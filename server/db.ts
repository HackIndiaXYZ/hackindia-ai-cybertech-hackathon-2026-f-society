import fs from "fs";
import path from "path";

// Define the structured CodeReview type
export interface CodeReview {
  id: string;
  language: string;
  code: string;
  timestamp: string; // ISO string
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
    score: number; // 0 - 100
    rating: string; // e.g. "Needs Work", "Fair", "Good", "Excellent"
    explanation: string;
  };
}

const DB_DIR = path.join(process.cwd(), "database");
const DB_FILE = path.join(DB_DIR, "sqlite_reviews.json");

// Ensure the database directory and file exist
function initializeDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export const db = {
  // Read all records from the database (simulating SELECT * FROM reviews ORDER BY timestamp DESC)
  getAllReviews(): CodeReview[] {
    initializeDatabase();
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const reviews: CodeReview[] = JSON.parse(data);
      // Sort descending by timestamp
      return reviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error("Database read error:", error);
      return [];
    }
  },

  // Read a single record by ID (simulating SELECT * FROM reviews WHERE id = ?)
  getReviewById(id: string): CodeReview | null {
    const reviews = this.getAllReviews();
    return reviews.find((r) => r.id === id) || null;
  },

  // Insert a new record (simulating INSERT INTO reviews)
  saveReview(review: Omit<CodeReview, "id" | "timestamp">): CodeReview {
    initializeDatabase();
    const reviews = this.getAllReviews();
    
    const newReview: CodeReview = {
      ...review,
      id: "rev_" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };

    reviews.push(newReview);
    
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(reviews, null, 2), "utf-8");
    } catch (error) {
      console.error("Database write error:", error);
    }

    return newReview;
  },

  // Delete a record by ID (simulating DELETE FROM reviews WHERE id = ?)
  deleteReview(id: string): boolean {
    initializeDatabase();
    const reviews = this.getAllReviews();
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) return false;

    reviews.splice(index, 1);

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(reviews, null, 2), "utf-8");
      return true;
    } catch (error) {
      console.error("Database delete error:", error);
      return false;
    }
  },

  // Delete all records from the database
  deleteAllReviews(): boolean {
    initializeDatabase();
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf-8");
      return true;
    } catch (error) {
      console.error("Database clear error:", error);
      return false;
    }
  },
};
