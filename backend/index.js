require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mongoose = require("mongoose");

const app = express();

// =====================
// 🔗 DB CONNECT
// =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch((err) => console.error("MongoDB Error ❌", err.message));

// =====================
// 📦 SCHEMA
// =====================
const DocumentSchema = new mongoose.Schema({
  fileName: String,
  type: String,
  content: String,
  timestamps: Array,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Document = mongoose.model("Document", DocumentSchema);

// =====================
// ⚙️ MIDDLEWARE
// =====================
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// 📁 UPLOAD FOLDER
// =====================
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// =====================
// 📁 MULTER
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use("/uploads", express.static(uploadDir));

// =====================
// 🔍 TEST
// =====================
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// =====================
// 📄 GET DOCUMENTS
// =====================
app.get("/documents", async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// =====================
// 🧹 CLEAR DATABASE (FINAL FIX)
// =====================
app.get("/clear", async (req, res) => {
  try {
    const result = await Document.deleteMany({});
    console.log("DELETED:", result.deletedCount);

    res.json({
      message: "DB Cleared ✅",
      deleted: result.deletedCount
    });
  } catch (err) {
    console.error("CLEAR ERROR:", err);
    res.status(500).json({ error: "Clear failed" });
  }
});

// =====================
// 📄 SUMMARY API
// =====================
app.post("/summary", async (req, res) => {
  try {
    const doc = await Document.findOne().sort({ createdAt: -1 });

    if (!doc) {
      return res.json({ summary: "No document found" });
    }

    res.json({
      summary: doc.content.slice(0, 500)
    });

  } catch (err) {
    res.status(500).json({ error: "Summary failed" });
  }
});

// =====================
// 📤 PDF UPLOAD
// =====================
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let text = "";

    try {
      const buffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(buffer);
      text = data.text?.trim() || "";
    } catch (err) {
      console.log("PDF PARSE ERROR:", err.message);
      text = "⚠️ Could not extract text";
    }

    if (!text) {
      text = "⚠️ Scanned PDF (no text)";
    }

    await Document.create({
      fileName: req.file.originalname,
      type: "pdf",
      content: text
    });

    res.json({
      message: "PDF uploaded & saved to DB ✅"
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// =====================
// 🎧 AUDIO UPLOAD
// =====================
app.post("/upload-audio", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio uploaded" });
    }

    const timestamps = [
      { text: "Introduction to AI", time: 5 },
      { text: "Machine Learning", time: 15 },
      { text: "Development", time: 30 },
    ];

    const content = timestamps.map(t => t.text).join(" ");

    await Document.create({
      fileName: req.file.originalname,
      type: "audio",
      content,
      timestamps,
    });

    res.json({
      message: "Audio uploaded & saved 🎧",
      file: req.file
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Audio failed" });
  }
});

// =====================
// 🤖 CHAT
// =====================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const query = message.toLowerCase();

    const doc = await Document.findOne().sort({ createdAt: -1 });

    if (!doc) {
      return res.json({ reply: "No document found" });
    }

    let response = "";

    if (doc.type === "audio") {
      const match = doc.timestamps.find(t =>
        query.includes(t.text.toLowerCase())
      );

      if (match) {
        return res.json({
          reply: `⏱ ${match.text} at ${match.time}s`
        });
      }
    }

    if (query.includes("summary")) {
      response = doc.content.slice(0, 600);
    } else if (query.includes("name")) {
      response = doc.content.split("\n")[0];
    } else {
      response = doc.content.slice(0, 400);
    }

    res.json({
      reply: response
    });

  } catch (error) {
    res.status(500).json({ error: "Chat error" });
  }
});

// =====================
// 🚀 SERVER START
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});