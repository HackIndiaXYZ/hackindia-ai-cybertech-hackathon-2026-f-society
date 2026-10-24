import { GoogleGenAI, Type } from "@google/genai";
import { CodeReview } from "./db";

// Initialize Gemini client lazily to avoid crashing on start if API key is not set.
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is required. Please check your AI Studio secrets panel.",
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function buildFallbackReview(
  code: string,
  language: string,
): Omit<CodeReview, "id" | "timestamp"> {
  const lowerCode = code.toLowerCase();
  const bugs: Array<{
    severity: "critical" | "warning" | "suggestion";
    title: string;
    description: string;
    line?: number;
    suggestion?: string;
  }> = [];
  const security: Array<{
    severity: "critical" | "warning" | "suggestion";
    title: string;
    description: string;
    line?: number;
    suggestion?: string;
  }> = [];
  const performance: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    line?: number;
    suggestion?: string;
  }> = [];
  const bestPractices: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    line?: number;
    suggestion?: string;
  }> = [];
  const readability: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    line?: number;
    suggestion?: string;
  }> = [];

  if (/\beval\s*\(|exec\s*\(|subprocess|os\.system/i.test(lowerCode)) {
    security.push({
      severity: "critical",
      title: "Potential command injection or unsafe execution",
      description:
        "The code appears to execute dynamic commands or shell-like input, which can introduce injection risks.",
      suggestion:
        "Prefer explicit allowlists and avoid passing user-controlled strings to execution APIs.",
    });
  }

  if (
    /open\s*\(|connect\s*\(|close\s*\(/i.test(lowerCode) &&
    !/finally|with\s+/i.test(lowerCode)
  ) {
    bugs.push({
      severity: "warning",
      title: "Possible resource handling issue",
      description:
        "Resources such as files or connections may not be managed safely if teardown logic is missing.",
      suggestion:
        "Use try/finally or context managers so resources are always released.",
    });
  }

  if (/for\s*\([^\n]*\)\s*\{[^\n]*for\s*\(/s.test(code)) {
    performance.push({
      title: "Nested loops may hurt scalability",
      description:
        "The code contains nested iteration paths that can become expensive for larger inputs.",
      impact: "medium",
      suggestion:
        "Consider using maps, sets, or indexing structures to reduce repeated work.",
    });
  }

  if (
    /function\s+[A-Za-z0-9_]+/i.test(code) &&
    !/const\s+|let\s+|var\s+/i.test(code)
  ) {
    bestPractices.push({
      title: "Prefer modern declarations and clearer structure",
      description:
        "The code uses functional-style patterns without modern variable declarations, which can reduce clarity.",
      impact: "low",
      suggestion:
        "Use const and let consistently and keep helper functions small and readable.",
    });
  }

  if (code.split(/\r?\n/).length > 40) {
    readability.push({
      title: "Longer scripts can be harder to scan",
      description:
        "The file is fairly long, which can make intent and control flow harder to follow quickly.",
      impact: "medium",
      suggestion:
        "Break the implementation into smaller functions or modules with focused responsibilities.",
    });
  }

  const issueCount =
    bugs.length +
    security.length +
    performance.length +
    bestPractices.length +
    readability.length;
  const score = Math.max(45, Math.min(92, 88 - issueCount * 6));
  const rating =
    score >= 85
      ? "Excellent"
      : score >= 70
        ? "Good"
        : score >= 50
          ? "Fair"
          : "Needs Work";

  return {
    language,
    code,
    summary: `A local fallback review was generated because Gemini is not configured. The analysis highlights common reliability, security, and maintainability concerns in ${language} code.`,
    bugs,
    security,
    performance,
    bestPractices,
    readability,
    codeQuality: {
      score,
      rating,
      explanation:
        "Fallback review based on static heuristics and common code smell patterns.",
    },
  };
}

export async function analyzeCode(
  code: string,
  language: string,
): Promise<Omit<CodeReview, "id" | "timestamp">> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY is not configured; using built-in fallback analysis.",
    );
    return buildFallbackReview(code, language);
  }

  const ai = getGeminiClient();

  const prompt = `Analyze this code written in ${language}. Generate structured feedback detailing Bugs, Security Issues, Performance Improvements, Best Practices, Readability suggestions, and an overall Quality Score.

Code to review:
\`\`\`${language}
${code}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are CodeLens AI, an expert software architect, security specialist, and senior developer. 
Analyze the provided code meticulously. Be constructive, precise, and practical. 
If there are specific lines where issues occur, specify the line numbers.
For each issue found, always provide a clear explanation and, if helpful, a brief "suggestion" with code snippets or fix ideas.
You MUST respond with a valid JSON object matching the expected schema perfectly.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "summary",
            "bugs",
            "security",
            "performance",
            "bestPractices",
            "readability",
            "codeQuality",
          ],
          properties: {
            summary: {
              type: Type.STRING,
              description:
                "A professional, concise 2-3 sentence overall summary of the code and review findings.",
            },
            bugs: {
              type: Type.ARRAY,
              description:
                "List of syntax errors, logical bugs, or incorrect behaviors.",
              items: {
                type: Type.OBJECT,
                required: ["severity", "title", "description"],
                properties: {
                  severity: {
                    type: Type.STRING,
                    description: "Severity of the bug.",
                    enum: ["critical", "warning", "suggestion"],
                  },
                  title: {
                    type: Type.STRING,
                    description: "Short title identifying the issue.",
                  },
                  description: {
                    type: Type.STRING,
                    description:
                      "Detailed explanation of what the bug is and why it happens.",
                  },
                  line: {
                    type: Type.INTEGER,
                    description:
                      "1-indexed approximate line number where the issue occurs, if applicable.",
                  },
                  suggestion: {
                    type: Type.STRING,
                    description:
                      "Code snippet or concrete steps to fix the issue.",
                  },
                },
              },
            },
            security: {
              type: Type.ARRAY,
              description:
                "Security vulnerabilities, sensitive data exposure, injection risks, or unsafe practices.",
              items: {
                type: Type.OBJECT,
                required: ["severity", "title", "description"],
                properties: {
                  severity: {
                    type: Type.STRING,
                    description: "Security level risk.",
                    enum: ["critical", "warning", "suggestion"],
                  },
                  title: {
                    type: Type.STRING,
                    description: "Short title of the security issue.",
                  },
                  description: {
                    type: Type.STRING,
                    description:
                      "Explanation of the risk and potential exploit.",
                  },
                  line: {
                    type: Type.INTEGER,
                    description: "1-indexed approximate line number.",
                  },
                  suggestion: {
                    type: Type.STRING,
                    description: "Remediation code snippet or practice change.",
                  },
                },
              },
            },
            performance: {
              type: Type.ARRAY,
              description:
                "Performance, memory usage, algorithm complexity, or resource management issues.",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "impact"],
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Performance issue title.",
                  },
                  description: {
                    type: Type.STRING,
                    description: "Explanation of why this hinders performance.",
                  },
                  impact: {
                    type: Type.STRING,
                    description: "Potential speed/resource impact level.",
                    enum: ["high", "medium", "low"],
                  },
                  line: {
                    type: Type.INTEGER,
                    description: "1-indexed approximate line number.",
                  },
                  suggestion: {
                    type: Type.STRING,
                    description: "Optimization snippet or advice.",
                  },
                },
              },
            },
            bestPractices: {
              type: Type.ARRAY,
              description:
                "Violations of language-specific conventions, standards, styling, or idiom standards.",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "impact"],
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Best practice violation title.",
                  },
                  description: {
                    type: Type.STRING,
                    description: "Why the standard approach is preferred.",
                  },
                  impact: {
                    type: Type.STRING,
                    description: "Impact on code quality/maintainability.",
                    enum: ["high", "medium", "low"],
                  },
                  line: {
                    type: Type.INTEGER,
                    description: "1-indexed line number.",
                  },
                  suggestion: {
                    type: Type.STRING,
                    description: "Correct/standardized code sample.",
                  },
                },
              },
            },
            readability: {
              type: Type.ARRAY,
              description:
                "Readability, indentation, overly complex methods, naming conventions, or documentation concerns.",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "impact"],
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Readability issue title.",
                  },
                  description: {
                    type: Type.STRING,
                    description:
                      "Explanation of what makes it hard to read/understand.",
                  },
                  impact: {
                    type: Type.STRING,
                    description: "Improvement benefit.",
                    enum: ["high", "medium", "low"],
                  },
                  line: {
                    type: Type.INTEGER,
                    description: "1-indexed line number.",
                  },
                  suggestion: {
                    type: Type.STRING,
                    description: "Refactored code or naming recommendation.",
                  },
                },
              },
            },
            codeQuality: {
              type: Type.OBJECT,
              required: ["score", "rating", "explanation"],
              properties: {
                score: {
                  type: Type.INTEGER,
                  description:
                    "A score from 0 (very poor, uncompilable/extremely buggy) to 100 (flawless, clean code).",
                },
                rating: {
                  type: Type.STRING,
                  description:
                    "Quality classification: 'Needs Work' (0-49), 'Fair' (50-69), 'Good' (70-84), 'Excellent' (85-100).",
                },
                explanation: {
                  type: Type.STRING,
                  description:
                    "A summary explanation of how the score was calculated based on findings.",
                },
              },
            },
          },
        },
      },
    });

    const jsonText = response.text?.trim() || "{}";
    const parsed = JSON.parse(jsonText);

    return {
      language,
      code,
      summary: parsed.summary || "No summary provided.",
      bugs: parsed.bugs || [],
      security: parsed.security || [],
      performance: parsed.performance || [],
      bestPractices: parsed.bestPractices || [],
      readability: parsed.readability || [],
      codeQuality: parsed.codeQuality || {
        score: 70,
        rating: "Good",
        explanation: "Analysis finished with minor remarks.",
      },
    };
  } catch (error: any) {
    console.warn(
      "Gemini analysis failed; using built-in fallback review.",
      error.message,
    );
    return buildFallbackReview(code, language);
  }
}
