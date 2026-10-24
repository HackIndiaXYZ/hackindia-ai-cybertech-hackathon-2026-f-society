// Syntax Highlighter for CodeLens AI
// High-fidelity token matching for multiple programming languages

export function highlightCode(code: string, language: string): string {
  if (!code) return "";

  // 1. Escape HTML first to prevent code execution or layout breakage
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const placeholders: string[] = [];
  const addPlaceholder = (text: string) => {
    placeholders.push(text);
    return `___TOKEN_HL_${placeholders.length - 1}___`;
  };

  const activeLang = (language || "python").toLowerCase();

  // 2. Extract Comments first to avoid highlight contamination inside them
  // C-Style multiline comments
  if (["javascript", "typescript", "java", "cpp", "go", "rust", "css"].includes(activeLang)) {
    escaped = escaped.replace(/\/\*([\s\S]*?)\*\//g, (match) => {
      return addPlaceholder(`<span class="text-slate-500 italic font-mono">${match}</span>`);
    });
  }

  // Single line comments
  if (["javascript", "typescript", "java", "cpp", "go", "rust"].includes(activeLang)) {
    escaped = escaped.replace(/(\/\/.*)/g, (match) => {
      return addPlaceholder(`<span class="text-slate-500 italic font-mono">${match}</span>`);
    });
  } else if (["python", "rust"].includes(activeLang)) {
    // python and some other script-like or config-like single line comments
    escaped = escaped.replace(/(#.*)/g, (match) => {
      return addPlaceholder(`<span class="text-slate-500 italic font-mono">${match}</span>`);
    });
  } else if (activeLang === "sql") {
    // SQL comments
    escaped = escaped.replace(/(--.*)/g, (match) => {
      return addPlaceholder(`<span class="text-slate-500 italic font-mono">${match}</span>`);
    });
  } else if (activeLang === "html") {
    // HTML comments
    escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (match) => {
      return addPlaceholder(`<span class="text-slate-500 italic font-mono">${match}</span>`);
    });
  }

  // 3. Triple quotes for python
  if (activeLang === "python") {
    escaped = escaped.replace(/(""\"[\s\S]*?""\"|'''[\s\S]*?''')/g, (match) => {
      return addPlaceholder(`<span class="text-emerald-400 font-mono">${match}</span>`);
    });
  }

  // 4. Strings (single quotes, double quotes, backticks)
  // Double quotes string literal
  escaped = escaped.replace(/"([^"\\]|\\.)*"/g, (match) => {
    return addPlaceholder(`<span class="text-emerald-400 font-mono">${match}</span>`);
  });

  // Single quotes string literal
  escaped = escaped.replace(/'([^'\\]|\\.)*'/g, (match) => {
    return addPlaceholder(`<span class="text-emerald-400 font-mono">${match}</span>`);
  });

  // Template backticks string literal
  escaped = escaped.replace(/`([^`\\]|\\.)*`/g, (match) => {
    return addPlaceholder(`<span class="text-emerald-400 font-mono">${match}</span>`);
  });

  // 5. Language Keywords & Tokens
  let keywords: string[] = [];
  if (activeLang === "python") {
    keywords = [
      "def", "class", "return", "import", "from", "as", "if", "elif", "else",
      "for", "while", "try", "except", "finally", "raise", "with", "lambda",
      "assert", "pass", "break", "continue", "in", "is", "not", "and", "or",
      "global", "nonlocal", "del", "yield", "None", "True", "False", "self"
    ];
  } else if (["javascript", "typescript"].includes(activeLang)) {
    keywords = [
      "const", "let", "var", "function", "return", "import", "export", "from",
      "class", "extends", "new", "this", "if", "else", "for", "while", "switch",
      "case", "break", "continue", "try", "catch", "finally", "throw", "async",
      "await", "yield", "typeof", "instanceof", "default", "interface", "type",
      "any", "number", "string", "boolean", "unknown", "never", "void", "keyof",
      "readonly", "null", "undefined", "true", "false", "super", "get", "set"
    ];
  } else if (activeLang === "java") {
    keywords = [
      "public", "private", "protected", "class", "interface", "enum", "extends",
      "implements", "import", "package", "static", "final", "void", "int", "double",
      "float", "char", "boolean", "byte", "short", "long", "if", "else", "for",
      "while", "do", "switch", "case", "break", "continue", "return", "new", "this",
      "super", "try", "catch", "finally", "throw", "throws", "null", "true", "false"
    ];
  } else if (activeLang === "cpp") {
    keywords = [
      "class", "struct", "enum", "union", "public", "private", "protected", "void",
      "int", "double", "float", "char", "bool", "short", "long", "const", "static",
      "virtual", "override", "if", "else", "for", "while", "do", "switch", "case",
      "break", "continue", "return", "new", "delete", "this", "try", "catch", "throw",
      "namespace", "using", "include", "template", "typename", "nullptr", "true", "false"
    ];
  } else if (activeLang === "go") {
    keywords = [
      "func", "package", "import", "var", "const", "type", "struct", "interface",
      "map", "chan", "go", "select", "if", "else", "for", "range", "switch", "case",
      "default", "fallthrough", "return", "break", "continue", "goto", "defer",
      "nil", "true", "false", "int", "string", "bool", "float64", "error"
    ];
  } else if (activeLang === "rust") {
    keywords = [
      "fn", "let", "mut", "pub", "use", "mod", "struct", "enum", "impl", "trait",
      "match", "if", "else", "for", "while", "loop", "return", "break", "continue",
      "as", "const", "static", "type", "where", "unsafe", "self", "Self", "true", "false"
    ];
  } else if (activeLang === "sql") {
    keywords = [
      "SELECT", "INSERT", "UPDATE", "DELETE", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT",
      "INNER", "OUTER", "ON", "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "OFFSET",
      "CREATE", "TABLE", "ALTER", "DROP", "INDEX", "VIEW", "INTO", "VALUES", "SET",
      "AND", "OR", "NOT", "IN", "IS", "NULL", "PRIMARY", "KEY", "FOREIGN", "REFERENCES",
      "select", "insert", "update", "delete", "from", "where", "join", "left", "right",
      "inner", "outer", "on", "group", "by", "order", "having", "limit", "offset",
      "create", "table", "alter", "drop", "index", "view", "into", "values", "set",
      "and", "or", "not", "in", "is", "null", "primary", "key", "foreign", "references"
    ];
  } else if (activeLang === "html") {
    keywords = [
      "doctype", "html", "head", "title", "meta", "link", "style", "script", "body",
      "div", "span", "p", "a", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
      "img", "button", "input", "textarea", "select", "option", "form", "label",
      "header", "footer", "main", "aside", "nav", "section", "article", "svg", "path"
    ];
  } else if (activeLang === "css") {
    keywords = [
      "import", "media", "keyframes", "font-face", "root", "hover", "active", "focus"
    ];
  }

  // Highlight Decorators / Annotations (e.g., @app.get, @Override)
  escaped = escaped.replace(/(@[a-zA-Z_][a-zA-Z0-9_\.]*)/g, (match) => {
    return `<span class="text-amber-500 font-semibold font-mono">${match}</span>`;
  });

  // Highlight keywords
  if (keywords.length > 0) {
    const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    escaped = escaped.replace(keywordRegex, (match) => {
      return `<span class="text-pink-400 font-semibold font-mono">${match}</span>`;
    });
  }

  // Highlight function definitions or calls
  if (["python", "javascript", "typescript", "java", "cpp", "go", "rust"].includes(activeLang)) {
    // Function definition/names before parenthesis
    escaped = escaped.replace(/([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, (match) => {
      // Avoid highlighting keywords as functions
      if (keywords.includes(match)) return match;
      return `<span class="text-blue-400 font-mono">${match}</span>`;
    });
  }

  // Highlight numbers
  escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, (match) => {
    return `<span class="text-yellow-500 font-mono">${match}</span>`;
  });

  // 6. Restore comments & strings back to original positions in reverse order
  for (let i = placeholders.length - 1; i >= 0; i--) {
    escaped = escaped.replace(`___TOKEN_HL_${i}___`, placeholders[i]);
  }

  return escaped;
}
