const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer config — save with unique names
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "_" + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded images
app.use("/uploads", express.static(UPLOAD_DIR));

// Upload endpoint (multiple files)
app.post("/api/upload", upload.array("photos", 20), (req, res) => {
  const files = req.files.map((f) => ({
    name: f.originalname,
    filename: f.filename,
    size: f.size,
    url: `/uploads/${f.filename}`,
    ts: Date.now(),
  }));
  res.json({ ok: true, files });
});

// List all photos
app.get("/api/photos", (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR)
      .filter((f) => /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(f))
      .map((f) => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, f));
        return {
          filename: f,
          url: `/uploads/${f}`,
          size: stat.size,
          ts: stat.mtimeMs,
        };
      })
      .sort((a, b) => b.ts - a.ts);
    res.json({ ok: true, photos: files });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed to list photos" });
  }
});

// Delete a photo
app.delete("/api/photos/:filename", (req, res) => {
  const filepath = path.join(UPLOAD_DIR, path.basename(req.params.filename));
  if (!fs.existsSync(filepath)) return res.status(404).json({ ok: false, error: "Not found" });
  try {
    fs.unlinkSync(filepath);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Delete failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Photo Drop running on http://localhost:${PORT}`);
});
