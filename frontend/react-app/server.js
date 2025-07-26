import express from "express";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable gzip compression
app.use(compression());

// Absolute path to dist folder
const distPath = path.join(__dirname, "dist");

// Serve all static files from dist
app.use(express.static(distPath));

// Fallback for all routes (SPA)
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
