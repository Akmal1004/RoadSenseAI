import { useState, useEffect, useRef } from "react";
import { Send, Bot, Trash2, HelpCircle, Sparkles } from "lucide-react";
import { askRoadSenseAI, cancelGeminiRequest } from "../services/aiService";
import { ChatMessage } from "../types/chat";

const defaultPrompts = [
  "Safest route home avoiding highways",
  "Traffic on my commute",
  "Find fuel station nearby",
  "Should I leave now or wait",
  "Weather impact on my trip"
];

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  createdAt: Date.now(),
  content: "Hi! I'm your RoadSense AI co-pilot. I can help with route planning, traffic updates, weather impact, fuel savings, and general safety recommendations."
};

export default function CoPilotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up ongoing requests on unmount
  useEffect(() => {
    return () => {
      cancelGeminiRequest("assistant");
    };
  }, []);

  async function handleSend(text = input) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      content: text.trim(),
      createdAt: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await askRoadSenseAI(text.trim());
      const replyMsg: ChatMessage = {
        id: `${Date.now()}-a`,
        role: "assistant",
        content: response,
        createdAt: Date.now()
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch (error) {
      const errMsg: ChatMessage = {
        id: `${Date.now()}-e`,
        role: "assistant",
        content: error instanceof Error ? error.message : "AI Co-Pilot is currently unavailable.",
        createdAt: Date.now()
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  const clearChat = () => {
    setMessages([welcomeMessage]);
  };

  return (
    <div className="glass-panel" style={{ height: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: "rgba(0, 229, 255, 0.08)",
            border: "1px solid rgba(0, 229, 255, 0.2)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Bot size={18} color="var(--primary-cyan)" />
          </div>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF" }}>AI Co-Pilot</h3>
            <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Active Copilot Intelligence</span>
          </div>
        </div>
        <button 
          onClick={clearChat}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "6px",
            borderRadius: "6px",
            transition: "var(--transition-smooth)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          title="Clear Conversation"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Message List Pane */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        paddingRight: "4px"
      }}>
        
        {/* Suggestion Chips */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-secondary)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>
            <Sparkles size={10} color="var(--primary-cyan)" />
            <span>Suggested Queries</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {defaultPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                style={{
                  textAlign: "left",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "var(--transition-smooth)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.borderColor = "var(--primary-cyan)";
                  e.currentTarget.style.backgroundColor = "rgba(0, 229, 255, 0.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--glass-border)";
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chats Map */}
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`chat-bubble ${message.role}`}
          >
            {message.content}
          </div>
        ))}
        
        {loading && (
          <div style={{ alignSelf: "flex-start", display: "flex", gap: "6px", alignItems: "center", background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--glass-border)", padding: "10px 14px", borderRadius: "10px" }}>
            <span style={{ width: "6px", height: "6px", background: "var(--primary-cyan)", borderRadius: "50%", animation: "fadeIn 0.6s linear infinite" }} />
            <span style={{ width: "6px", height: "6px", background: "var(--primary-cyan)", borderRadius: "50%", animation: "fadeIn 0.6s linear infinite 0.2s" }} />
            <span style={{ width: "6px", height: "6px", background: "var(--primary-cyan)", borderRadius: "50%", animation: "fadeIn 0.6s linear infinite 0.4s" }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
        <div className="cyber-input-wrap" style={{ marginBottom: 0, paddingLeft: "10px", flex: 1 }}>
          <input
            type="text"
            className="cyber-input"
            value={input}
            placeholder={loading ? "Copilot is analyzing..." : "Ask anything about your trip..."}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
          />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #00d4ff 100%)",
            border: "none",
            borderRadius: "var(--border-radius-md)",
            width: "46px",
            height: "46px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#FFFFFF",
            boxShadow: "0 4px 15px rgba(59, 130, 246, 0.2)",
            transition: "var(--transition-smooth)",
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(59, 130, 246, 0.35)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
          }}
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );
}
