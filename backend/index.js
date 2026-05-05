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
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// =====================
// 📁 STORAGE CONFIG
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// =====================
// 🔍 TEST ROUTE
// =====================
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// =====================
// 📤 PDF UPLOAD (FIXED)
// =====================
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(fileBuffer);

    let text = data.text ? data.text.trim() : "";

    // 🔥 IMPORTANT FIX
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
    console.error(error);
    res.status(500).json({ error: "PDF failed" });
  }
});

// =====================
// 🎧 AUDIO UPLOAD
// =====================
app.post("/upload-audio", upload.single("file"), async (req, res) => {
  try {
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
    console.error(error);
    res.status(500).json({ error: "Chat error" });
  }
});

// =====================
// 📄 DEBUG ROUTE
// =====================
app.get("/documents", async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// =====================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});