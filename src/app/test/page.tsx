"use client";

import { useState } from "react";

export default function Test() {
  const [playerId, setPlayerId] = useState(-1);
  const [delta, setDelta] = useState(10);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  async function getPlayer() {
    setLoading(true);
    setLastAction("GET");
    const res = await fetch(`/api/player/${playerId}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  async function updateChips(value: number) {
    setLoading(true);
    setLastAction(value > 0 ? "ADD" : "REDUCE");
    const res = await fetch("/api/chips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, delta: value }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  const badgeColor = lastAction === "GET"
    ? "#58a6ff"
    : lastAction === "ADD"
    ? "#3fb950"
    : "#f85149";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0d1117;
          color: #e6edf3;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          min-height: 100vh;
        }

        .container {
          max-width: 540px;
          margin: 48px auto;
          padding: 0 20px 60px;
        }

        /* Header */
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 36px;
        }
        .header-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1f6feb, #58a6ff);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(88,166,255,0.25);
        }
        .header-text h1 {
          font-size: 18px;
          font-weight: 600;
          color: #e6edf3;
          letter-spacing: -0.3px;
        }
        .header-text p {
          font-size: 11px;
          color: #7d8590;
          margin-top: 2px;
          font-family: system-ui, sans-serif;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* Card */
        .card {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
        }
        .card-label {
          font-size: 10px;
          color: #7d8590;
          font-family: system-ui, sans-serif;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 14px;
        }

        /* Input fields */
        .field-row {
          display: flex;
          gap: 16px;
        }
        .field {
          flex: 1;
        }
        .field label {
          display: block;
          font-size: 11px;
          color: #8b949e;
          margin-bottom: 6px;
          font-family: system-ui, sans-serif;
        }
        .field input {
          width: 100%;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 15px;
          font-family: 'JetBrains Mono', monospace;
          color: #e6edf3;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field input:focus {
          border-color: #58a6ff;
          box-shadow: 0 0 0 3px rgba(88,166,255,0.12);
        }

        /* Buttons */
        .btn-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
        .btn {
          padding: 11px 0;
          border-radius: 8px;
          border: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .btn:hover { opacity: 0.88; }
        .btn:active { transform: scale(0.97); }
        .btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-sub-label {
          font-size: 9px;
          font-family: system-ui, sans-serif;
          letter-spacing: 0.5px;
          opacity: 0.7;
          text-transform: uppercase;
        }

        .btn-get {
          background: #1f2937;
          color: #58a6ff;
          border: 1px solid #30363d;
        }
        .btn-add {
          background: #0d2f23;
          color: #3fb950;
          border: 1px solid #1a4731;
        }
        .btn-sub {
          background: #2d1117;
          color: #f85149;
          border: 1px solid #4a1f1f;
        }

        /* Response area */
        .response-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 10px;
          font-family: system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .pre-wrap {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 16px;
          overflow: auto;
          max-height: 340px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          line-height: 1.7;
          color: #e6edf3;
        }
        .pre-null {
          color: #7d8590;
          font-style: italic;
          font-family: system-ui, sans-serif;
          font-size: 13px;
          text-align: center;
          padding: 28px 0;
        }

        /* JSON colors */
        .json-key   { color: #79c0ff; }
        .json-str   { color: #a5d6ff; }
        .json-num   { color: #ff9e64; }
        .json-bool  { color: #ff7b72; }
        .json-null  { color: #8b949e; }

        .spinner {
          display: inline-block;
          width: 10px;
          height: 10px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #58a6ff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <main className="container">
        <div className="header">
          <div className="header-icon">💃</div>
          <div className="header-text">
            <h1>データベースデバッグ</h1>
            <p>Debug Console</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="card">
          <div className="card-label">パラメータ</div>
          <div className="field-row">
            <div className="field">
              <label>Player ID</label>
              <input
                type="number"
                value={playerId}
                onChange={(e) => setPlayerId(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>変更量 (Δ)</label>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <div className="card-label">アクション</div>
          <div className="btn-row">
            <button
              className="btn btn-get"
              onClick={getPlayer}
              disabled={loading}
            >
              {loading && lastAction === "GET"
                ? <span className="spinner" />
                : "GET"}
              <span className="btn-sub-label">取得</span>
            </button>
            <button
              className="btn btn-add"
              onClick={() => updateChips(Math.abs(delta))}
              disabled={loading}
            >
              {loading && lastAction === "ADD"
                ? <span className="spinner" />
                : `+${Math.abs(delta)}`}
              <span className="btn-sub-label">チップ追加</span>
            </button>
            <button
              className="btn btn-sub"
              onClick={() => updateChips(-Math.abs(delta))}
              disabled={loading}
            >
              {loading && lastAction === "REDUCE"
                ? <span className="spinner" />
                : `−${Math.abs(delta)}`}
              <span className="btn-sub-label">チップ減少</span>
            </button>
          </div>
        </div>

        {/* Response */}
        <div className="card">
          <div className="response-header">
            <div className="card-label" style={{ marginBottom: 0 }}>レスポンス</div>
            {lastAction && result && (
              <span
                className="badge"
                style={{
                  background: `${badgeColor}18`,
                  color: badgeColor,
                  border: `1px solid ${badgeColor}40`,
                }}
              >
                <span className="dot" style={{ background: badgeColor }} />
                {lastAction}
              </span>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            {result === null ? (
              <div className="pre-null">— まだ何も取得していません —</div>
            ) : (
              <pre
                className="pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: syntaxHighlight(JSON.stringify(result, null, 2)),
                }}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            return `<span class="json-key">${match}</span>`;
          }
          return `<span class="json-str">${match}</span>`;
        }
        if (/true|false/.test(match)) return `<span class="json-bool">${match}</span>`;
        if (/null/.test(match)) return `<span class="json-null">${match}</span>`;
        return `<span class="json-num">${match}</span>`;
      }
    );
}