import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  History, 
  Trash2, 
  Copy, 
  Check, 
  FileCode, 
  ShieldAlert, 
  Zap, 
  Lightbulb, 
  BookOpen, 
  Code2, 
  ArrowRight, 
  RefreshCw, 
  AlertTriangle, 
  Upload,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { highlightCode } from "./utils/highlighter";

// Define TypeScript interfaces matching server database types
interface CodeReview {
  id: string;
  language: string;
  code: string;
  timestamp: string;
  summary: string;
  bugs: Array<{
    severity: "critical" | "warning" | "suggestion";
    title: string;
    description: string;
    line?: number;
    suggestion?: string;
  }>;
  security: Array<{
    severity: "critical" | "warning" | "suggestion";
    title: string;
    description: string;
    line?: number;
    suggestion?: string;
  }>;
  performance: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    line?: number;
    suggestion?: string;
  }>;
  bestPractices: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    line?: number;
    suggestion?: string;
  }>;
  readability: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    line?: number;
    suggestion?: string;
  }>;
  codeQuality: {
    score: number;
    rating: string;
    explanation: string;
  };
}

// Starter templates for quick testing
const CODE_TEMPLATES = [
  {
    name: "Python Vulnerability",
    language: "python",
    code: `import sqlite3
import os

def get_user_data(username):
    # CRITICAL SECURITY ISSUE: SQL Injection
    db_path = "users.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
    
    # UNUSED RESOURCE / PERFORMANCE: Connection is not closed in finally
    return cursor.fetchall()

def process_image(filename):
    # BUG: File is opened but never closed properly
    file = open(filename, 'rb')
    data = file.read()
    # No close() call!
    
    # BUG/SMELL: Modifying list during iteration
    items = [1, 2, 3, 4, 5]
    for x in items:
        if x % 2 == 0:
            items.remove(x)
            
    return data
`
  },
  {
    name: "JS Memory Leak",
    language: "javascript",
    code: `// JS example demonstrating leaks and poor performance
const globalCache = [];

function addData(user) {
    // MEMORY LEAK: Unbounded global cache accumulation
    globalCache.push({
        id: user.id,
        meta: user.details,
        timestamp: Date.now()
    });
}

function processUsers(users) {
    // PERFORMANCE: Using O(N^2) double loops instead of hash maps
    const results = [];
    for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < globalCache.length; j++) {
            if (users[i].id === globalCache[j].id) {
                results.push({ ...users[i], cachedAt: globalCache[j].timestamp });
            }
        }
    }
    
    // READABILITY/BEST PRACTICE: Implicit global variables
    undeclaredVar = "This is a global variable because 'let/const/var' is missing";
    
    // SECURITY/BUG: Unsafe eval usage
    const calculation = eval(users[0]?.mathExpression || "1 + 1");
    
    return { results, calculation };
}
`
  },
  {
    name: "C++ Buffer Overflow",
    language: "cpp",
    code: `#include <iostream>
#include <cstring>

void copyData(char* input) {
    // SECURITY: Classic buffer overflow vulnerability
    char buffer[16];
    strcpy(buffer, input); 
    std::cout << "Buffer contents: " << buffer << std::endl;
}

int main() {
    // BUG: Potential null pointer dereference
    char* data = nullptr;
    if (std::strlen(data) > 0) {
        copyData(data);
    }
    return 0;
}
`
  },
  {
    name: "React Infinite Loop",
    language: "typescript",
    code: `import React, { useState, useEffect } from 'react';

export default function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [counter, setCounter] = useState(0);

  // BUG: Infinite re-render loop - updating state on every render in useEffect without dependency stabilization
  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        setUserData(data);
      });
  }); // Missing dependency array!

  // PERFORMANCE: Heavy computation inside render body instead of useMemo
  const sortedItems = Array(10000).fill(0).map((_, i) => ({
    id: i,
    val: Math.random()
  })).sort((a, b) => a.val - b.val);

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Loaded items: {sortedItems.length}</p>
      <button onClick={() => setCounter(counter + 1)}>
        Increment: {counter}
      </button>
    </div>
  );
}
`
  }
];

const PROGRAMMING_LANGUAGES = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "sql", name: "SQL" },
  { id: "html", name: "HTML" },
  { id: "css", name: "CSS" },
];

export default function App() {
  // Main states
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("python");
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("Scanning source...");
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState<"summary" | "bugs" | "security" | "performance" | "bestPractices" | "readability">("summary");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [expandedSuggestionId, setExpandedSuggestionId] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightedBlockRef = useRef<HTMLPreElement>(null);

  // Sync scroll of line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current) {
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
      if (highlightedBlockRef.current) {
        highlightedBlockRef.current.scrollTop = textareaRef.current.scrollTop;
        highlightedBlockRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
    }
  };

  // Generate line number array based on newline count
  const lines = code.split("\n");
  const lineNumbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);

  // Rotate loading step messages for nice realistic UI
  useEffect(() => {
    if (!loading) return;
    
    const steps = [
      "Parsing Abstract Syntax Tree...",
      "Analyzing variable bindings...",
      "Searching for logical issues...",
      "Evaluating security permissions...",
      "Auditing algorithm efficiency...",
      "Measuring modular complexity...",
      "Formatting architectural feedback..."
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % steps.length;
      setLoadingStep(steps[currentIndex]);
    }, 2500);

    return () => clearInterval(interval);
  }, [loading]);

  // Load reviews on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      if (!response.ok) throw new Error("Could not fetch review history.");
      const data = await response.json();
      setReviews(data);
      // Auto-select the first review if available and none selected yet
      if (data.length > 0 && !selectedReview) {
        setSelectedReview(data[0]);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Submit code for review
  const handleReviewCode = async () => {
    if (!code.trim()) {
      setError("Please paste some code or load a template before initiating a review.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setLoadingStep("Reading source files...");
    setExpandedSuggestionId(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to complete AI code analysis.");
      }

      const newReview: CodeReview = await response.json();
      
      // Update reviews list and select new review
      setReviews((prev) => [newReview, ...prev]);
      setSelectedReview(newReview);
      setActiveTab("summary");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this review from history?")) return;

    try {
      const response = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete review.");
      
      setReviews((prev) => prev.filter((r) => r.id !== id));
      
      if (selectedReview?.id === id) {
        setSelectedReview(null);
      }
    } catch (err: any) {
      alert(err.message || "Could not delete historical review.");
    }
  };

  // Clear all reviews history
  const handleClearAllReviews = async () => {
    if (!confirm("Are you sure you want to permanently clear your entire review history? This cannot be undone.")) return;

    try {
      const response = await fetch("/api/reviews", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to clear review history.");
      
      setReviews([]);
      setSelectedReview(null);
    } catch (err: any) {
      alert(err.message || "Could not clear history.");
    }
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Drag-and-drop mechanics
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      readCodeFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readCodeFile(file);
    }
  };

  const readCodeFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCode(text);
        
        // Auto-detect language based on file extension
        const extension = file.name.split(".").pop()?.toLowerCase();
        const mappedLang = detectLanguageByExtension(extension);
        if (mappedLang) {
          setLanguage(mappedLang);
        }
      }
    };
    reader.readAsText(file);
  };

  const detectLanguageByExtension = (ext?: string): string | null => {
    if (!ext) return null;
    const mappings: { [key: string]: string } = {
      py: "python",
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      java: "java",
      cpp: "cpp",
      cc: "cpp",
      h: "cpp",
      hpp: "cpp",
      go: "go",
      rs: "rust",
      sql: "sql",
      html: "html",
      css: "css",
    };
    return mappings[ext] || null;
  };

  // Fill text editor with standard template
  const loadTemplate = (tmpl: { language: string; code: string }) => {
    setCode(tmpl.code);
    setLanguage(tmpl.language);
    setError(null);
  };

  // Color mappings for scores
  const getScoreColor = (score: number) => {
    if (score >= 85) return { border: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-950/40", fill: "stroke-emerald-500" };
    if (score >= 70) return { border: "border-blue-500", text: "text-blue-400", bg: "bg-blue-950/40", fill: "stroke-blue-500" };
    if (score >= 50) return { border: "border-amber-500", text: "text-amber-400", bg: "bg-amber-950/40", fill: "stroke-amber-500" };
    return { border: "border-red-500", text: "text-red-400", bg: "bg-red-950/40", fill: "stroke-red-500" };
  };

  const handleExportPDF = () => {
    if (!selectedReview) return;

    // Helper to generate list items for different sections
    const renderFindingsHtml = (title: string, items: any[], colorClass: 'critical' | 'warning' | 'info') => {
      if (!items || items.length === 0) return '';
      
      const itemsHtml = items.map(item => {
        const lineText = item.line ? `Line ${item.line}` : '';
        const levelText = item.severity || item.impact || '';
        const badgeText = [lineText, levelText].filter(Boolean).join(' • ');

        return `
          <div class="finding-item ${colorClass}">
            <div class="finding-header">
              <span class="finding-title">${item.title}</span>
              ${badgeText ? `<span class="finding-meta">${badgeText}</span>` : ''}
            </div>
            <div class="finding-description">${item.description}</div>
            ${item.suggestion ? `<div class="finding-suggestion">${item.suggestion}</div>` : ''}
          </div>
        `;
      }).join('');

      return `
        <div class="findings-container">
          <div class="section-title">${title}</div>
          ${itemsHtml}
        </div>
      `;
    };

    const originalCodeLines = selectedReview.code.split('\n').map((line, idx) => {
      return `
        <div class="code-line">
          <span class="line-number">${idx + 1}</span>
          <span class="line-content">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
        </div>
      `;
    }).join('');

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CodeLens AI Review Report - ${selectedReview.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            padding: 40px;
            background-color: #ffffff;
          }
          
          .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .logo-box {
            width: 36px;
            height: 36px;
            background-color: #2563eb;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 20px;
          }
          
          .title {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            letter-spacing: -0.02em;
          }
          
          .subtitle {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 700;
          }
          
          .metadata-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 30px;
            background-color: #f8fafc;
            padding: 16px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
          }
          
          .metadata-item {
            font-size: 13px;
          }
          
          .metadata-label {
            font-weight: 600;
            color: #475569;
          }
          
          .metadata-value {
            color: #0f172a;
            font-family: 'JetBrains Mono', monospace;
          }

          .dashboard {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 30px;
          }

          .metric-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 16px;
            text-align: center;
            background: #ffffff;
          }

          .metric-card.score {
            border-color: #2563eb;
            background-color: #eff6ff;
          }

          .metric-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 6px;
            letter-spacing: 0.05em;
          }

          .metric-value {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
          }

          .metric-value.score-val {
            color: #2563eb;
          }

          .summary-section {
            margin-bottom: 30px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
          }

          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .findings-container {
            margin-bottom: 30px;
          }

          .finding-item {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 14px;
            background-color: #ffffff;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .finding-item.critical {
            border-left: 4px solid #ef4444;
          }

          .finding-item.warning {
            border-left: 4px solid #f97316;
          }

          .finding-item.info {
            border-left: 4px solid #3b82f6;
          }

          .finding-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .finding-title {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
          }

          .finding-meta {
            font-size: 10px;
            font-family: 'JetBrains Mono', monospace;
            padding: 2px 6px;
            border-radius: 4px;
            background-color: #f1f5f9;
            color: #475569;
          }

          .finding-description {
            font-size: 12px;
            color: #475569;
            margin-bottom: 8px;
            line-height: 1.6;
          }

          .finding-suggestion {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            background-color: #fafafa;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            white-space: pre-wrap;
            color: #1e293b;
            margin-top: 8px;
            line-height: 1.5;
          }

          .code-section {
            page-break-before: always;
            margin-top: 40px;
          }

          .code-container {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            background-color: #fafafa;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            overflow-x: auto;
            white-space: pre;
            line-height: 1.6;
          }

          .code-line {
            display: flex;
          }

          .line-number {
            width: 30px;
            text-align: right;
            padding-right: 15px;
            color: #a1a1aa;
            user-select: none;
            border-right: 1px solid #e4e4e7;
            margin-right: 15px;
          }

          .line-content {
            color: #27272a;
          }

          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <div class="logo-box">C</div>
            <div>
              <h1 class="title">CodeLens AI</h1>
              <div class="subtitle">Intelligent Static Analysis System</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; font-weight: 600; color: #0f172a;">REPORT GENERATED</div>
            <div style="font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace;">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        <div class="metadata-grid">
          <div class="metadata-item">
            <span class="metadata-label">Report ID:</span>
            <span class="metadata-value">${selectedReview.id}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Target Language:</span>
            <span class="metadata-value" style="text-transform: uppercase;">${selectedReview.language}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Quality Classification:</span>
            <span class="metadata-value" style="font-weight: 600; color: #2563eb;">${selectedReview.codeQuality.rating}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Quality Score:</span>
            <span class="metadata-value" style="font-weight: 600;">${selectedReview.codeQuality.score} / 100</span>
          </div>
        </div>

        <div class="dashboard">
          <div class="metric-card score">
            <div class="metric-title">Quality Score</div>
            <div class="metric-value score-val">${selectedReview.codeQuality.score}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Bugs Detected</div>
            <div class="metric-value">${selectedReview.bugs.length}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Security Issues</div>
            <div class="metric-value" style="color: ${selectedReview.security.length > 0 ? '#f97316' : '#0f172a'};">${selectedReview.security.length}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Optimization Rules</div>
            <div class="metric-value">${selectedReview.performance.length + selectedReview.bestPractices.length + selectedReview.readability.length}</div>
          </div>
        </div>

        <div class="summary-section">
          <div class="section-title">Executive Summary</div>
          <p style="font-size: 13px; color: #334155; margin: 0; line-height: 1.6;">${selectedReview.summary}</p>
          <p style="font-size: 12px; color: #64748b; margin-top: 12px; margin-bottom: 0; font-style: italic;"><strong>Architectural Insight:</strong> ${selectedReview.codeQuality.explanation}</p>
        </div>

        ${renderFindingsHtml('Bugs & Logical Flaws', selectedReview.bugs, 'critical')}
        ${renderFindingsHtml('Security Vulnerabilities', selectedReview.security, 'warning')}
        ${renderFindingsHtml('Performance Improvements', selectedReview.performance, 'info')}
        ${renderFindingsHtml('Best Practice & Language Conventions', selectedReview.bestPractices, 'info')}
        ${renderFindingsHtml('Readability Improvements', selectedReview.readability, 'info')}

        <div class="code-section">
          <div class="section-title">Analyzed Source Code</div>
          <div class="code-container">${originalCodeLines}</div>
        </div>
      </body>
      </html>
    `;

    // Print using the robust hidden iframe trick to bypass browser blocks on window.open in sandboxed iframe
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow ? printFrame.contentWindow.document : printFrame.contentDocument;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(reportHtml);
      frameDoc.close();

      setTimeout(() => {
        if (printFrame.contentWindow) {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 2000);
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-800 bg-[#0f172a] sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              C
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">
              CodeLens <span className="text-blue-500">AI</span>
            </span>
            <span className="ml-2 px-2 py-0.5 bg-slate-800 rounded text-[10px] uppercase font-bold tracking-widest text-slate-400 border border-slate-700/60">
              v1.0.4 - Build Week
            </span>
          </div>

          {/* System status / models indicators */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              System Ready
            </div>
            <div className="hidden sm:block h-6 w-[1px] bg-slate-800"></div>
            <span className="text-[11px] font-mono bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              AI Model: Gemini 3.5 Flash
            </span>
          </div>

        </div>
      </header>

      {/* CORE FRAMEWORK */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: INPUT EDITOR & TEMPLATES & HISTORY */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. CODE SUBMISSION CONSOLE */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 backdrop-blur-sm shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-slate-200">Source Editor</h2>
                </div>

                <div className="flex items-center gap-3">
                  {/* Copy Source Code Button */}
                  {code && (
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(code, "source_code")}
                      className="text-[11px] font-medium text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedId === "source_code" ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Drag-and-drop file upload triggers */}
                  <label className="text-[11px] font-medium text-slate-400 hover:text-blue-400 cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="h-3 w-3" />
                    <span>Import File</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept=".py,.js,.jsx,.ts,.tsx,.java,.cpp,.cc,.h,.go,.rs,.sql,.html,.css" 
                    />
                  </label>
                </div>
              </div>

              {/* Templates bar */}
              <div className="mb-4">
                <p className="text-[11px] font-mono text-slate-400 mb-2">Test with bug templates:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CODE_TEMPLATES.map((tmpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => loadTemplate(tmpl)}
                      className="text-[10px] font-mono bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-300 px-2.5 py-1 rounded border border-slate-850 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-2.5 w-2.5 text-blue-400" />
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Code Editor (Simulating IDE with line numbers) */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-xl border font-mono text-xs overflow-hidden h-[340px] flex ${
                  isDragging ? "border-blue-500 bg-blue-950/20" : "border-slate-800 bg-[#010409]"
                } transition-all`}
              >
                
                {/* Drag-drop absolute overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-950/80 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <Upload className="h-10 w-10 text-blue-400 animate-bounce mb-2" />
                    <p className="text-sm font-medium text-slate-200">Drop Code File Here</p>
                    <p className="text-xs text-slate-400 mt-1">Accepts code source files</p>
                  </div>
                )}

                {/* Line Numbers Column */}
                <div 
                  ref={lineNumbersRef}
                  className="w-10 bg-slate-900/30 border-r border-slate-800 select-none py-3 text-right pr-2 text-[11px] text-slate-600 overflow-hidden"
                >
                  {lineNumbers.map((num) => (
                    <div key={num} className="h-5 leading-5">{num}</div>
                  ))}
                </div>

                {/* Interactive Area */}
                <div className="relative flex-1 h-full overflow-hidden">
                  {/* Real-time Syntax Highlight Overlay */}
                  <pre
                    ref={highlightedBlockRef}
                    className="absolute inset-0 w-full h-full py-3 px-3 overflow-hidden leading-5 font-mono text-xs whitespace-pre select-none pointer-events-none text-slate-300"
                    dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
                  />
                  
                  {/* Editing Textarea layered perfectly over/under the highlight */}
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onScroll={handleScroll}
                    placeholder={`// Paste your source code here...\n// Or drag & drop a file to begin code review.\n\nfunction calculateSum(a, b) {\n  return a + b;\n}`}
                    className="absolute inset-0 w-full h-full py-3 px-3 bg-transparent text-transparent caret-white focus:outline-none resize-none overflow-auto leading-5 font-mono whitespace-pre select-text placeholder:text-slate-500"
                    spellCheck={false}
                    id="code-editor-textarea"
                  />
                </div>

                {/* Bottom line count display */}
                <div className="absolute bottom-2 right-3 bg-slate-900/90 text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 pointer-events-none">
                  Lines: {lines.length}
                </div>
              </div>

              {/* Bottom selection and submit controls */}
              <div className="mt-4 pt-4 border-t border-slate-850 flex flex-col sm:flex-row gap-3 items-center justify-between">
                
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <label htmlFor="language-select" className="text-xs font-medium text-slate-400 whitespace-nowrap">Language:</label>
                  <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full sm:w-auto text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 font-mono font-medium cursor-pointer"
                  >
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                {/* CTA Action Button */}
                <button
                  type="button"
                  id="review-code-btn"
                  onClick={handleReviewCode}
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 active:scale-95 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-blue-200" />
                      Review Code
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl border border-red-900/40 bg-red-950/10 text-red-400 text-xs flex gap-3 items-start"
                >
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-400" />
                  <div>
                    <span className="font-semibold block mb-0.5">Analysis Failed</span>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2. HISTORY / REVIEW JOURNAL */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Review History</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50">
                    {reviews.length} saved
                  </span>
                  {reviews.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllReviews}
                      className="text-[10px] font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer bg-red-950/20 hover:bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-800/80 rounded-xl">
                  <p className="text-xs text-slate-500">No review logs compiled yet.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Submit code to build your analysis journal.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                  {reviews.map((rev) => {
                    const isSelected = selectedReview?.id === rev.id;
                    const ratingColor = getScoreColor(rev.codeQuality.score);
                    
                    return (
                      <div
                        key={rev.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedReview(rev);
                          setActiveTab("summary");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedReview(rev);
                            setActiveTab("summary");
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                          isSelected 
                            ? "bg-slate-900 border-blue-500/30 text-white shadow-[0_0_12px_rgba(37,99,235,0.08)]" 
                            : "bg-[#010409]/60 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/40"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                              {rev.language}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(rev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 truncate font-sans">
                            {rev.summary}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${ratingColor.bg} ${ratingColor.text} border ${ratingColor.border}/30`}>
                            {rev.codeQuality.score}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteReview(rev.id, e)}
                            className="p-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete this log"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: DYNAMIC RESULTS PANEL OR PLACEHOLDER */}
          <div className="lg:col-span-7">
            
            <AnimatePresence mode="wait">
              
              {/* STATE 1: LOADER SPINNER */}
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-slate-900/40 rounded-2xl border border-slate-800 p-12 text-center backdrop-blur-sm shadow-xl min-h-[580px] flex flex-col items-center justify-center relative overflow-hidden"
                >
                  {/* Absolute subtle glows */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-indigo-600/10 filter blur-3xl"></div>
                  
                  {/* Custom Rotating AI Wheel */}
                  <div className="relative mb-8">
                    <div className="h-16 w-16 rounded-full border-2 border-slate-800 border-t-indigo-500 animate-spin"></div>
                    <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-transparent border-b-purple-500 animate-pulse flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-indigo-400" />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-slate-100 tracking-tight">
                    Running Intelligence Pipeline
                  </h3>
                  
                  <p className="text-xs text-indigo-400 font-mono mt-2 animate-pulse min-h-[1.5rem]">
                    {loadingStep}
                  </p>
                  
                  <p className="text-xs text-slate-500 max-w-sm mt-4 font-sans">
                    Our semantic analysis compiler is compiling your script syntax, evaluating vulnerabilities, and constructing modular optimization recommendations.
                  </p>
                </motion.div>
              ) : 
              
              /* STATE 2: EMPTY / NO REVIEW LOADED PLACEHOLDER */
              !selectedReview ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-900/10 rounded-2xl border border-dashed border-slate-800 p-12 text-center backdrop-blur-sm min-h-[580px] flex flex-col items-center justify-center"
                >
                  <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-5 shadow-inner">
                    <Sparkles className="h-6 w-6 text-indigo-400/80" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-200 tracking-tight">
                    Ready for CodeLens Analysis
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                    Select a testing template, paste raw code, or import a source file on the left console, then click <strong className="text-indigo-400">Review Code</strong> to trigger AI feedback.
                  </p>
                </motion.div>
              ) : (
                
                /* STATE 3: REVIEW DETAILS AND METRICS EXPOSURE */
                <motion.div
                  key={selectedReview.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  
                  {/* SCORE & RATING ACCORDION CARD */}
                  <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      
                      {/* Metric Circular SVG Score ring */}
                      <div className="flex items-center gap-5">
                        <div className="relative shrink-0 flex items-center justify-center">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className="stroke-slate-800 fill-none"
                              strokeWidth="6"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className={`fill-none transition-all duration-1000 ${
                                getScoreColor(selectedReview.codeQuality.score).fill
                              }`}
                              strokeWidth="6"
                              strokeDasharray={`${2 * Math.PI * 34}`}
                              strokeDashoffset={`${
                                2 * Math.PI * 34 * (1 - selectedReview.codeQuality.score / 100)
                              }`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className={`absolute text-xl font-mono font-bold ${getScoreColor(selectedReview.codeQuality.score).text}`}>
                            {selectedReview.codeQuality.score}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold tracking-tight text-white">
                              Code Quality Score
                            </h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                              getScoreColor(selectedReview.codeQuality.score).border
                            }/40 ${getScoreColor(selectedReview.codeQuality.score).bg} ${getScoreColor(selectedReview.codeQuality.score).text}`}>
                              {selectedReview.codeQuality.rating}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {selectedReview.codeQuality.explanation}
                          </p>
                        </div>
                      </div>

                      {/* Header Controls */}
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyToClipboard(JSON.stringify(selectedReview, null, 2), "review-json")}
                          className="text-[11px] font-mono bg-slate-900 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedId === "review-json" ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              Copied JSON
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy JSON
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* HIGH-FIDELITY DASHBOARD GRID (From Design HTML) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#010409] border border-red-500/15 p-3.5 rounded-xl">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider">Bugs</div>
                      <div className={`text-xl font-mono font-bold ${selectedReview.bugs.length > 0 ? "text-red-500" : "text-slate-400"}`}>
                        {String(selectedReview.bugs.length).padStart(2, "0")}
                      </div>
                    </div>
                    <div className="bg-[#010409] border border-orange-500/15 p-3.5 rounded-xl">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider">Security</div>
                      <div className={`text-xl font-mono font-bold ${
                        selectedReview.security.length > 0 
                          ? selectedReview.security.some(s => s.severity === "critical") 
                            ? "text-red-500" 
                            : "text-orange-500"
                          : "text-emerald-400"
                      }`}>
                        {selectedReview.security.length > 0 
                          ? selectedReview.security.some(s => s.severity === "critical") 
                            ? "CRITICAL" 
                            : "WARNING"
                          : "SECURE"}
                      </div>
                    </div>
                    <div className="bg-[#010409] border border-slate-800 p-3.5 rounded-xl">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider">Quality Index</div>
                      <div className="text-xl font-mono text-slate-300 font-bold">
                        {(selectedReview.codeQuality.score / 10).toFixed(1)}<span className="text-xs text-slate-500 font-normal">/10</span>
                      </div>
                    </div>
                    <div className="bg-[#010409] border border-blue-500/15 p-3.5 rounded-xl">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider">Performance</div>
                      <div className={`text-xl font-mono font-bold ${selectedReview.performance.length > 0 ? "text-blue-400" : "text-emerald-400"}`}>
                        {selectedReview.performance.length > 0 ? "FAIR" : "OPTIMAL"}
                      </div>
                    </div>
                  </div>

                  {/* ANALYSIS TAB TRIGGER RAIL */}
                  <div className="flex items-center border-b border-slate-800 overflow-x-auto gap-1 scrollbar-none">
                    {[
                      { id: "summary", label: "Executive Summary", icon: Sparkles, count: null },
                      { id: "bugs", label: "Bugs", icon: AlertTriangle, count: selectedReview.bugs.length, color: "text-red-400" },
                      { id: "security", label: "Security", icon: ShieldAlert, count: selectedReview.security.length, color: "text-orange-400" },
                      { id: "performance", label: "Performance", icon: Zap, count: selectedReview.performance.length, color: "text-amber-400" },
                      { id: "bestPractices", label: "Conventions", icon: Lightbulb, count: selectedReview.bestPractices.length, color: "text-blue-400" },
                      { id: "readability", label: "Readability", icon: BookOpen, count: selectedReview.readability.length, color: "text-indigo-400" },
                    ].map((tab) => {
                      const isActive = activeTab === tab.id;
                      const Icon = tab.icon;
                      
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id as any);
                            setExpandedSuggestionId(null);
                          }}
                          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? "border-blue-500 text-white bg-blue-950/10"
                              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${tab.color || ""}`} />
                          <span>{tab.label}</span>
                          {tab.count !== null && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                              tab.count > 0 
                                ? isActive ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
                                : "bg-slate-900 text-slate-600"
                            }`}>
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* TAB SECTIONS */}
                  <div className="min-h-[380px]">
                    <AnimatePresence mode="wait">
                      
                      {/* SUB-SECTION 1: SUMMARY TAB */}
                      {activeTab === "summary" && (
                        <motion.div
                          key="summary-tab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm space-y-6"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-4 mb-3">
                              <h4 className="text-xs font-mono text-blue-400 uppercase tracking-wider">Review Overview</h4>
                              <button
                                type="button"
                                onClick={handleExportPDF}
                                className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-900/10 active:scale-95 transition-all cursor-pointer"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                <span>Export to PDF</span>
                              </button>
                            </div>
                            <p className="text-sm text-slate-200 font-sans leading-relaxed">
                              {selectedReview.summary}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
                            
                            {/* Analysis Statistics Grid */}
                            <div className="space-y-3">
                              <h5 className="text-xs font-semibold text-slate-400">Defects & Vulnerability Count</h5>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs p-2 bg-slate-950/40 rounded-lg border border-slate-900">
                                  <span className="text-slate-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical Bugs
                                  </span>
                                  <span className="font-mono font-bold text-red-400">
                                    {selectedReview.bugs.filter(b => b.severity === "critical").length}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs p-2 bg-slate-950/40 rounded-lg border border-slate-900">
                                  <span className="text-slate-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Security Alerts
                                  </span>
                                  <span className="font-mono font-bold text-orange-400">
                                    {selectedReview.security.length}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs p-2 bg-slate-950/40 rounded-lg border border-slate-900">
                                  <span className="text-slate-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Performance Concerns
                                  </span>
                                  <span className="font-mono font-bold text-amber-400">
                                    {selectedReview.performance.length}
                                  </span>
                                </div>
                              </div>
                            </div>

                             {/* App metadata and quick hints */}
                            <div className="p-4 bg-blue-950/10 rounded-xl border border-blue-900/20 flex flex-col justify-between">
                              <div>
                                <h5 className="text-xs font-semibold text-blue-300 mb-1">Code Quality Guidance</h5>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                                  Use the category tabs above to browse granular feedback with highlighted code recommendations. You can see specific line indexes for each remark.
                                </p>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-3 flex justify-between items-center">
                                <span>Ref: {selectedReview.id}</span>
                                <span>Compiled: {new Date(selectedReview.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}

                      {/* SUB-SECTION 2: BUGS TAB */}
                      {activeTab === "bugs" && (
                        <motion.div
                          key="bugs-tab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          {selectedReview.bugs.length === 0 ? (
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-xs">
                              <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                              No logical flaws or semantic bugs detected.
                            </div>
                          ) : (
                            selectedReview.bugs.map((bug, index) => {
                              const uniqueId = `bug_${index}`;
                              const isExpanded = expandedSuggestionId === uniqueId;
                              
                              return (
                                <div 
                                  key={index}
                                  className={`bg-slate-900/40 border p-5 rounded-2xl backdrop-blur-sm transition-all ${
                                    bug.severity === "critical" ? "border-red-900/40 glow-critical bg-red-950/5" : "border-slate-800 bg-slate-900/40"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-md ${
                                          bug.severity === "critical" 
                                            ? "bg-red-950 text-red-400 border border-red-900/60" 
                                            : "bg-slate-800 text-slate-400"
                                        }`}>
                                          {bug.severity}
                                        </span>
                                        {bug.line && (
                                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-1.5 py-0.2 rounded border border-slate-800">
                                            Line {bug.line}
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="text-sm font-semibold text-slate-100">{bug.title}</h5>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-300 mt-2.5 font-sans leading-relaxed">
                                    {bug.description}
                                  </p>

                                  {bug.suggestion && (
                                    <div className="mt-4 border-t border-slate-800/60 pt-3">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedSuggestionId(isExpanded ? null : uniqueId)}
                                        className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="h-3.5 w-3.5" />
                                            Hide Remediation Code
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3.5 w-3.5" />
                                            View Remediation Code
                                          </>
                                        )}
                                      </button>

                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-2.5"
                                          >
                                            <div className="relative rounded-lg bg-slate-950/80 border border-slate-800 p-3.5 font-mono text-[11px] text-slate-300 whitespace-pre overflow-x-auto leading-relaxed">
                                              {bug.suggestion}
                                              <button
                                                type="button"
                                                onClick={() => handleCopyToClipboard(bug.suggestion || "", `${uniqueId}_copy`)}
                                                className="absolute top-2 right-2 p-1.5 hover:bg-slate-800 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                                                title="Copy fix snippet"
                                              >
                                                {copiedId === `${uniqueId}_copy` ? (
                                                  <Check className="h-3 w-3 text-emerald-400" />
                                                ) : (
                                                  <Copy className="h-3 w-3" />
                                                )}
                                              </button>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </motion.div>
                      )}

                      {/* SUB-SECTION 3: SECURITY TAB */}
                      {activeTab === "security" && (
                        <motion.div
                          key="security-tab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          {selectedReview.security.length === 0 ? (
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-xs">
                              <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                              No potential security vulnerabilities or injections found.
                            </div>
                          ) : (
                            selectedReview.security.map((sec, index) => {
                              const uniqueId = `sec_${index}`;
                              const isExpanded = expandedSuggestionId === uniqueId;
                              
                              return (
                                <div 
                                  key={index}
                                  className={`bg-slate-900/40 border p-5 rounded-2xl backdrop-blur-sm transition-all ${
                                    sec.severity === "critical" ? "border-orange-900/40 glow-warning bg-orange-950/5" : "border-slate-800 bg-slate-900/40"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-md ${
                                          sec.severity === "critical" 
                                            ? "bg-orange-950 text-orange-400 border border-orange-900/60" 
                                            : "bg-slate-800 text-slate-400"
                                        }`}>
                                          {sec.severity} Risk
                                        </span>
                                        {sec.line && (
                                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-1.5 py-0.2 rounded border border-slate-800">
                                            Line {sec.line}
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="text-sm font-semibold text-slate-100">{sec.title}</h5>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-300 mt-2.5 font-sans leading-relaxed">
                                    {sec.description}
                                  </p>

                                  {sec.suggestion && (
                                    <div className="mt-4 border-t border-slate-800/60 pt-3">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedSuggestionId(isExpanded ? null : uniqueId)}
                                        className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="h-3.5 w-3.5" />
                                            Hide Remediation Code
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3.5 w-3.5" />
                                            View Remediation Code
                                          </>
                                        )}
                                      </button>

                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-2.5"
                                          >
                                            <div className="relative rounded-lg bg-slate-950/80 border border-slate-800 p-3.5 font-mono text-[11px] text-slate-300 whitespace-pre overflow-x-auto leading-relaxed">
                                              {sec.suggestion}
                                              <button
                                                type="button"
                                                onClick={() => handleCopyToClipboard(sec.suggestion || "", `${uniqueId}_copy`)}
                                                className="absolute top-2 right-2 p-1.5 hover:bg-slate-800 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                                                title="Copy fix snippet"
                                              >
                                                {copiedId === `${uniqueId}_copy` ? (
                                                  <Check className="h-3 w-3 text-emerald-400" />
                                                ) : (
                                                  <Copy className="h-3 w-3" />
                                                )}
                                              </button>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </motion.div>
                      )}

                      {/* SUB-SECTION 4: PERFORMANCE TAB */}
                      {activeTab === "performance" && (
                        <motion.div
                          key="performance-tab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          {selectedReview.performance.length === 0 ? (
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-xs">
                              <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                              No major algorithm or execution bottlenecks observed.
                            </div>
                          ) : (
                            selectedReview.performance.map((perf, index) => {
                              const uniqueId = `perf_${index}`;
                              const isExpanded = expandedSuggestionId === uniqueId;
                              
                              return (
                                <div key={index} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-md ${
                                          perf.impact === "high" 
                                            ? "bg-amber-950 text-amber-400 border border-amber-900/60" 
                                            : "bg-slate-800 text-slate-400"
                                        }`}>
                                          {perf.impact} Performance Impact
                                        </span>
                                        {perf.line && (
                                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-1.5 py-0.2 rounded border border-slate-800">
                                            Line {perf.line}
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="text-sm font-semibold text-slate-100">{perf.title}</h5>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-300 mt-2.5 font-sans leading-relaxed">
                                    {perf.description}
                                  </p>

                                  {perf.suggestion && (
                                    <div className="mt-4 border-t border-slate-800/60 pt-3">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedSuggestionId(isExpanded ? null : uniqueId)}
                                        className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="h-3.5 w-3.5" />
                                            Hide Optimized Alternative
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3.5 w-3.5" />
                                            View Optimized Alternative
                                          </>
                                        )}
                                      </button>

                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-2.5"
                                          >
                                            <div className="relative rounded-lg bg-slate-950/80 border border-slate-800 p-3.5 font-mono text-[11px] text-slate-300 whitespace-pre overflow-x-auto leading-relaxed">
                                              {perf.suggestion}
                                              <button
                                                type="button"
                                                onClick={() => handleCopyToClipboard(perf.suggestion || "", `${uniqueId}_copy`)}
                                                className="absolute top-2 right-2 p-1.5 hover:bg-slate-800 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                                                title="Copy fix snippet"
                                              >
                                                {copiedId === `${uniqueId}_copy` ? (
                                                  <Check className="h-3 w-3 text-emerald-400" />
                                                ) : (
                                                  <Copy className="h-3 w-3" />
                                                )}
                                              </button>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </motion.div>
                      )}

                      {/* SUB-SECTION 5: BEST PRACTICES / CONVENTIONS TAB */}
                      {activeTab === "bestPractices" && (
                        <motion.div
                          key="conventions-tab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          {selectedReview.bestPractices.length === 0 ? (
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-xs">
                              <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                              Your conventions are flawless. No style breaches detected.
                            </div>
                          ) : (
                            selectedReview.bestPractices.map((prac, index) => {
                              const uniqueId = `prac_${index}`;
                              const isExpanded = expandedSuggestionId === uniqueId;
                              
                              return (
                                <div key={index} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-md bg-blue-950 text-blue-400 border border-blue-900/60">
                                          Convention Standard ({prac.impact})
                                        </span>
                                        {prac.line && (
                                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-1.5 py-0.2 rounded border border-slate-800">
                                            Line {prac.line}
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="text-sm font-semibold text-slate-100">{prac.title}</h5>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-300 mt-2.5 font-sans leading-relaxed">
                                    {prac.description}
                                  </p>

                                  {prac.suggestion && (
                                    <div className="mt-4 border-t border-slate-800/60 pt-3">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedSuggestionId(isExpanded ? null : uniqueId)}
                                        className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="h-3.5 w-3.5" />
                                            Hide Standardized Snippet
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3.5 w-3.5" />
                                            View Standardized Snippet
                                          </>
                                        )}
                                      </button>

                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-2.5"
                                          >
                                            <div className="relative rounded-lg bg-slate-950/80 border border-slate-800 p-3.5 font-mono text-[11px] text-slate-300 whitespace-pre overflow-x-auto leading-relaxed">
                                              {prac.suggestion}
                                              <button
                                                type="button"
                                                onClick={() => handleCopyToClipboard(prac.suggestion || "", `${uniqueId}_copy`)}
                                                className="absolute top-2 right-2 p-1.5 hover:bg-slate-800 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                                                title="Copy fix snippet"
                                              >
                                                {copiedId === `${uniqueId}_copy` ? (
                                                  <Check className="h-3 w-3 text-emerald-400" />
                                                ) : (
                                                  <Copy className="h-3 w-3" />
                                                )}
                                              </button>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </motion.div>
                      )}

                      {/* SUB-SECTION 6: READABILITY TAB */}
                      {activeTab === "readability" && (
                        <motion.div
                          key="readability-tab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          {selectedReview.readability.length === 0 ? (
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-xs">
                              <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                              Excellent readability. Code is simple and well-commented.
                            </div>
                          ) : (
                            selectedReview.readability.map((read, index) => {
                              const uniqueId = `read_${index}`;
                              const isExpanded = expandedSuggestionId === uniqueId;
                              
                              return (
                                <div key={index} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-900/60">
                                          Readability Guide ({read.impact})
                                        </span>
                                        {read.line && (
                                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-1.5 py-0.2 rounded border border-slate-800">
                                            Line {read.line}
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="text-sm font-semibold text-slate-100">{read.title}</h5>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-300 mt-2.5 font-sans leading-relaxed">
                                    {read.description}
                                  </p>

                                  {read.suggestion && (
                                    <div className="mt-4 border-t border-slate-800/60 pt-3">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedSuggestionId(isExpanded ? null : uniqueId)}
                                        className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="h-3.5 w-3.5" />
                                            Hide Refactored Clean Code
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3.5 w-3.5" />
                                            View Refactored Clean Code
                                          </>
                                        )}
                                      </button>

                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-2.5"
                                          >
                                            <div className="relative rounded-lg bg-slate-950/80 border border-slate-800 p-3.5 font-mono text-[11px] text-slate-300 whitespace-pre overflow-x-auto leading-relaxed">
                                              {read.suggestion}
                                              <button
                                                type="button"
                                                onClick={() => handleCopyToClipboard(read.suggestion || "", `${uniqueId}_copy`)}
                                                className="absolute top-2 right-2 p-1.5 hover:bg-slate-800 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                                                title="Copy fix snippet"
                                              >
                                                {copiedId === `${uniqueId}_copy` ? (
                                                  <Check className="h-3 w-3 text-emerald-400" />
                                                ) : (
                                                  <Copy className="h-3 w-3" />
                                                )}
                                              </button>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* Analysis Status Footer */}
                  <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl text-[10px] text-slate-500 flex justify-between">
                    <span>Tokens: ~{Math.floor(code.length / 3) + 185}</span>
                    <span>Lat: ~1.2s</span>
                    <span className="font-bold text-blue-400 uppercase">AI MODEL: GEMINI 3.5 FLASH</span>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-16 py-8 text-center text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-mono">CodeLens AI — Built with Express, React 19, Tailwind CSS v4, and Gemini AI</p>
          <p className="font-sans text-[11px] text-slate-700">OpenAI Build Week Hackathon Project • Fully persistent database logging enabled</p>
        </div>
      </footer>

    </div>
  );
}
