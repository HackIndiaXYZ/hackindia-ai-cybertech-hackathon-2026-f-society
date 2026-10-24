import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import express from "express";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import { analyzeCode } from "./server/reviewer";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || "0.0.0.0";

  // Set up body parsers with generous limits to support large source code files
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", time: new Date().toISOString() });
  });

  // GET: Retrieve all reviews
  app.get("/api/reviews", (req, res) => {
    try {
      const reviews = db.getAllReviews();
      res.json(reviews);
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error);
      res.status(500).json({ error: "Failed to load review history." });
    }
  });

  // GET: Retrieve a single review by ID
  app.get("/api/reviews/:id", (req, res) => {
    try {
      const review = db.getReviewById(req.params.id);
      if (!review) {
        res.status(404).json({ error: "Review not found." });
        return;
      }
      res.json(review);
    } catch (error: any) {
      console.error("Failed to fetch review:", error);
      res.status(500).json({ error: "Failed to load review details." });
    }
  });

  // POST: Create a new code review
  app.post("/api/reviews", async (req, res) => {
    const { code, language } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      res
        .status(400)
        .json({ error: "Please provide non-empty source code to review." });
      return;
    }

    if (!language || typeof language !== "string" || !language.trim()) {
      res.status(400).json({ error: "Please specify a programming language." });
      return;
    }

    try {
      // 1. Analyze code using Gemini model
      const feedback = await analyzeCode(code, language);

      // 2. Save the result to local JSON-based SQLite store
      const savedReview = db.saveReview(feedback);

      res.status(201).json(savedReview);
    } catch (error: any) {
      console.error("Review processing failed:", error);
      res.status(500).json({
        error:
          error.message ||
          "An unexpected error occurred during the review process.",
      });
    }
  });

  // DELETE: Delete a review by ID
  app.delete("/api/reviews/:id", (req, res) => {
    try {
      const success = db.deleteReview(req.params.id);
      if (!success) {
        res
          .status(404)
          .json({ error: "Review not found or could not be deleted." });
        return;
      }
      res.json({ success: true, message: "Review deleted successfully." });
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      res.status(500).json({ error: "Failed to delete review from history." });
    }
  });

  // DELETE: Clear all reviews history
  app.delete("/api/reviews", (req, res) => {
    try {
      const success = db.deleteAllReviews();
      if (!success) {
        res.status(500).json({ error: "Could not clear history." });
        return;
      }
      res.json({ success: true, message: "All reviews history cleared." });
    } catch (error: any) {
      console.error("Failed to clear review history:", error);
      res.status(500).json({ error: "Failed to clear review history." });
    }
  });

  // Frontend Serving Logic (Express + Vite Integrations)

  if (process.env.NODE_ENV !== "production") {
    // Serve Vite in development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Serve static files from the build directory in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from dist/.");
  }

  const maxPortAttempts = 10;
  let currentPort = PORT;

  const tryListen = () => {
    const server = app.listen(currentPort, HOST, () => {
      console.log(
        `CodeLens AI server running at http://localhost:${currentPort}`,
      );
    });

    server.on("error", (error: any) => {
      if (
        error.code === "EADDRINUSE" &&
        currentPort < PORT + maxPortAttempts - 1
      ) {
        console.warn(
          `Port ${currentPort} is busy. Retrying on ${currentPort + 1}...`,
        );
        server.close(() => {
          currentPort += 1;
          tryListen();
        });
      } else {
        console.error("Fatal server error:", error);
        process.exit(1);
      }
    });
  };

  tryListen();
}

startServer().catch((err) => {
  console.error("Fatal error starting CodeLens server:", err);
});
