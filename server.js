import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve static files from workspace root
app.use(express.static(__dirname));

// Fallback for HTML requests to index.html
app.get("*", (req, res, next) => {
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "index.html"));
  } else {
    next();
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
