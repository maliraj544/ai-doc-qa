require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
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
app.use("/uploads", express.static("uploads"));

// =====================
// 📁 STORAGE CONFIG
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// =====================
// 🔍 TEST ROUTE
// =====================
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// =====================
// 📤 PDF UPLOAD (FINAL FIX)
// =====================
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // 🔥 FIX 1: file check
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(fileBuffer);

    let text = data.text ? data.text.trim() : "";

    // 🔥 FIX 2: scanned PDF fallback
    if (!text) {
      text = "⚠️ This PDF is scanned (image-based). Text extraction not possible.";
    }

    await Document.create({
      fileName: req.file.originalname,
      type: "pdf",
      content: text
    });

    res.json({
      message: "PDF uploaded & saved to DB ✅",
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: "PDF failed" });
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

    const audioText = "This audio talks about AI, machine learning and software development.";

    const timestamps = [
      { text: "AI intro", time: 10 },
      { text: "ML basics", time: 25 },
      { text: "Dev discussion", time: 45 }
    ];

    await Document.create({
      fileName: req.file.originalname,
      type: "audio",
      content: audioText,
      timestamps: timestamps
    });

    res.json({
      message: "Audio uploaded & saved to DB 🎧",
      file: req.file
    });

  } catch (error) {
    console.error("AUDIO ERROR:", error);
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
      return res.json({ reply: "⚠️ No document found" });
    }

    let response = "";

    if (doc.type === "audio" && query.includes("audio")) {
      response = `🎧 Audio Content:\n\n${doc.content}\n\n⏱ Timestamps:\n`;

      doc.timestamps.forEach(t => {
        response += `- ${t.text} at ${t.time}s\n`;
      });
    }
    else if (query.includes("summary")) {
      response = `📄 Summary:\n\n${doc.content.slice(0, 600)}...`;
    }
    else if (query.includes("name")) {
      response = doc.content.split("\n")[0];
    }
    else {
      response = doc.content.slice(0, 400);
    }

    res.json({
      reply: `🤖 Answer:\n\n${response}`,
    });

  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json({ error: "Chat error" });
  }
});

// =====================
// 🚀 SERVER START (IMPORTANT FIX)
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});