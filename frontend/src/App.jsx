import { useState } from "react";
import axios from "axios";

// 🔥 LIVE BACKEND
const BASE_URL = "https://ai-doc-backend-emvr.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");

  // 📄 PDF Upload
  const handleUpload = async () => {
    try {
      if (!file) return alert("Select file first");

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data.message);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("PDF upload failed ❌");
    }
  };

  // 🎧 AUDIO Upload
  const handleAudioUpload = async () => {
    try {
      if (!file) return alert("Select audio file first");

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${BASE_URL}/upload-audio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.file?.filename) {
        setAudioUrl(`${BASE_URL}/uploads/${res.data.file.filename}`);
      }

      alert(res.data.message);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Audio upload failed ❌");
    }
  };

  // 🤖 Chat
  const handleSend = async () => {
    try {
      if (!message.trim()) return;

      const res = await axios.post(`${BASE_URL}/chat`, { message });

      setChat((prev) => [
        ...prev,
        { user: message, bot: res.data.reply },
      ]);

      setMessage("");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Chat failed ❌");
    }
  };

  // 📄 Summary
  const handleSummary = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/chat`, {
        message: "summary",
      });

      setChat((prev) => [
        ...prev,
        { user: "Summarize PDF", bot: res.data.reply },
      ]);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Summary failed ❌");
    }
  };

  // 🔥 Jump to timestamp
  const jumpToTime = (time) => {
    const audio = document.getElementById("audioPlayer");
    if (audio) {
      audio.currentTime = time;
      audio.play();
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>📄 AI PDF Chat</h1>

      {/* File Input */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* Buttons */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={handleUpload}>Upload PDF</button>
        <button onClick={handleAudioUpload} style={{ marginLeft: "10px" }}>
          Upload Audio 🎧
        </button>
      </div>

      <br />
      <button onClick={handleSummary}>Summarize PDF</button>

      {/* 🎧 AUDIO PLAYER */}
      {audioUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>🎧 Audio Player</h3>
          <audio
            id="audioPlayer"
            controls
            src={audioUrl}
            style={{ width: "100%" }}
          />
        </div>
      )}

      <hr />

      {/* Chat */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          style={{ flex: 1, padding: "8px" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something..."
        />
        <button onClick={handleSend}>Send</button>
      </div>

      {/* Messages */}
      <div style={{ marginTop: "20px" }}>
        {chat.map((c, i) => (
          <div key={i} style={{ marginBottom: "15px" }}>
            <p><b>You:</b> {c.user}</p>

            <div
              style={{
                background: "#f4f4f4",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <b>Bot:</b>

              {c.bot.split("\n").map((line, index) => {
                const match = line.match(/(\d+)s/);

                if (match) {
                  const time = parseInt(match[1]);

                  return (
                    <div
                      key={index}
                      style={{
                        color: "blue",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                      onClick={() => jumpToTime(time)}
                    >
                      ⏱ {line}
                    </div>
                  );
                }

                return <div key={index}>{line}</div>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;