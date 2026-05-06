import { useState, useRef } from "react";
import axios from "axios";

const BASE_URL = "https://ai-doc-backend-emvr.onrender.com";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0f;
    color: #e8e4f0;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .app {
    max-width: 760px;
    margin: 0 auto;
    padding: 40px 20px 80px;
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
  }

  .header h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 2.4rem;
    background: linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
  }

  .header p {
    color: #6b7280;
    font-size: 0.95rem;
    margin-top: 6px;
    font-weight: 300;
  }

  .card {
    background: #13131a;
    border: 1px solid #1e1e2e;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
  }

  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 16px;
  }

  .file-zone {
    border: 2px dashed #2a2a3e;
    border-radius: 12px;
    padding: 28px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
  }

  .file-zone:hover {
    border-color: #a78bfa;
    background: #16162a;
  }

  .file-zone input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .file-zone-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .file-zone-text {
    color: #9ca3af;
    font-size: 0.9rem;
  }

  .file-name {
    margin-top: 10px;
    font-size: 0.85rem;
    color: #a78bfa;
    font-weight: 500;
  }

  .btn-row {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .btn {
    flex: 1;
    padding: 11px 18px;
    border-radius: 10px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .btn:active { transform: scale(0.97); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-primary {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff;
  }

  .btn-secondary {
    background: #1e1e2e;
    color: #c4b5fd;
    border: 1px solid #2a2a3e;
  }

  .btn-accent {
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    color: #fff;
  }

  .btn-outline {
    background: transparent;
    color: #9ca3af;
    border: 1px solid #2a2a3e;
  }

  .btn-outline:hover { border-color: #a78bfa; color: #a78bfa; }

  .summarize-btn {
    width: 100%;
    padding: 12px;
    background: #0f0f1a;
    border: 1px solid #1e1e2e;
    border-radius: 10px;
    color: #c4b5fd;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .summarize-btn:hover {
    background: #16162a;
    border-color: #a78bfa;
  }

  .audio-player {
    margin-top: 8px;
  }

  .audio-player audio {
    width: 100%;
    border-radius: 8px;
    accent-color: #a78bfa;
  }

  audio::-webkit-media-controls-panel {
    background: #1a1a2e;
  }

  .chat-input-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .chat-input {
    flex: 1;
    background: #0f0f1a;
    border: 1px solid #1e1e2e;
    border-radius: 12px;
    padding: 12px 16px;
    color: #e8e4f0;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .chat-input:focus { border-color: #7c3aed; }
  .chat-input::placeholder { color: #4b5563; }

  .send-btn {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    border: none;
    border-radius: 12px;
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.1rem;
    transition: opacity 0.2s, transform 0.1s;
    flex-shrink: 0;
  }

  .send-btn:active { transform: scale(0.94); }

  .chat-history {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .chat-bubble-user {
    align-self: flex-end;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    padding: 10px 16px;
    border-radius: 16px 16px 4px 16px;
    max-width: 80%;
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .chat-bubble-bot {
    align-self: flex-start;
    background: #13131a;
    border: 1px solid #1e1e2e;
    color: #d1d5db;
    padding: 14px 16px;
    border-radius: 16px 16px 16px 4px;
    max-width: 90%;
    font-size: 0.92rem;
    line-height: 1.65;
  }

  .bot-label {
    font-size: 0.75rem;
    color: #a78bfa;
    font-weight: 600;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
    display: block;
  }

  .timestamp-link {
    color: #60a5fa;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: rgba(96, 165, 250, 0.08);
    border-radius: 6px;
    margin: 3px 0;
    font-size: 0.88rem;
    font-weight: 500;
    transition: background 0.2s;
  }

  .timestamp-link:hover { background: rgba(96, 165, 250, 0.16); }

  .empty-chat {
    text-align: center;
    color: #374151;
    font-size: 0.9rem;
    padding: 30px 0 10px;
  }

  .status-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e1e2e;
    border: 1px solid #2a2a3e;
    color: #e8e4f0;
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 0.88rem;
    z-index: 999;
    animation: fadeIn 0.25s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .divider {
    height: 1px;
    background: #1e1e2e;
    margin: 8px 0 20px;
  }
`;

export default function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));

  const handleUpload = async () => {
    if (!file) return showToast("⚠️ Pehle file select karo");
    setLoad("pdf", true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${BASE_URL}/upload`, formData);
      showToast("✅ " + res.data.message);
    } catch {
      showToast("❌ PDF upload failed");
    } finally {
      setLoad("pdf", false);
    }
  };

  const handleAudioUpload = async () => {
    if (!file) return showToast("⚠️ Audio file select karo pehle");
    setLoad("audio", true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${BASE_URL}/upload-audio`, formData);
      if (res.data.file?.filename) {
        setAudioUrl(`${BASE_URL}/uploads/${res.data.file.filename}`);
      }
      showToast("✅ " + res.data.message);
    } catch {
      showToast("❌ Audio upload failed");
    } finally {
      setLoad("audio", false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessage("");
    setLoad("chat", true);
    try {
      const res = await axios.post(`${BASE_URL}/chat`, { message: userMsg });
      setChat((p) => [...p, { user: userMsg, bot: res.data.reply }]);
    } catch {
      showToast("❌ Chat failed");
    } finally {
      setLoad("chat", false);
    }
  };

  const handleSummary = async () => {
    setLoad("summary", true);
    try {
      const res = await axios.post(`${BASE_URL}/summary`);
      setChat((p) => [...p, { user: "📋 Summarize", bot: res.data.summary }]);
    } catch {
      showToast("❌ Summary failed");
    } finally {
      setLoad("summary", false);
    }
  };

  const jumpToTime = (time) => {
    const audio = document.getElementById("audioPlayer");
    if (audio) { audio.currentTime = time; audio.play(); }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <h1>AI Document Chat</h1>
          <p>Upload PDFs or Audio — then chat with your content</p>
        </div>

        {/* Upload Card */}
        <div className="card">
          <div className="card-title">📁 Upload File</div>
          <div className="file-zone">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <div className="file-zone-icon">☁️</div>
            <div className="file-zone-text">Click to choose a file</div>
            {file && <div className="file-name">📎 {file.name}</div>}
          </div>

          <div className="btn-row">
            <button className="btn btn-primary" onClick={handleUpload} disabled={loading.pdf}>
              {loading.pdf ? "Uploading…" : "📄 Upload PDF"}
            </button>
            <button className="btn btn-secondary" onClick={handleAudioUpload} disabled={loading.audio}>
              {loading.audio ? "Uploading…" : "🎧 Upload Audio"}
            </button>
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="card">
            <div className="card-title">🎧 Audio Player</div>
            <div className="audio-player">
              <audio id="audioPlayer" controls src={audioUrl} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card">
          <div className="card-title">⚡ Quick Actions</div>
          <button className="summarize-btn" onClick={handleSummary} disabled={loading.summary}>
            {loading.summary ? "⏳ Generating Summary…" : "✨ Generate Summary"}
          </button>
        </div>

        {/* Chat */}
        <div className="card">
          <div className="card-title">💬 Chat</div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Kuch bhi pucho document se…"
            />
            <button className="send-btn" onClick={handleSend} disabled={loading.chat}>
              {loading.chat ? "⏳" : "➤"}
            </button>
          </div>

          <div className="chat-history">
            {chat.length === 0 && (
              <div className="empty-chat">No messages yet. Start by asking something! 👆</div>
            )}
            {chat.map((c, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className="chat-bubble-user">{c.user}</div>
                <div className="chat-bubble-bot">
                  <span className="bot-label">AI</span>
                  {c.bot.split("\n").map((line, idx) => {
                    const match = line.match(/(\d+)s/);
                    if (match) {
                      return (
                        <div key={idx} className="timestamp-link" onClick={() => jumpToTime(parseInt(match[1]))}>
                          ⏱ {line}
                        </div>
                      );
                    }
                    return <div key={idx}>{line}</div>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && <div className="status-toast">{toast}</div>}
    </>
  );
}
