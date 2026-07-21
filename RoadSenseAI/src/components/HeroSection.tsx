import { ShieldAlert, Compass, Navigation } from "lucide-react";
import { useStats } from "../hooks/useStats";

export default function HeroSection() {
  const stats = useStats();

  return (
    <header className="glass-panel slide-in-up" style={{ padding: "30px", marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        
        {/* Main Branding Title */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{
              background: "linear-gradient(135deg, #00e5ff 0%, #3b82f6 100%)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(0, 229, 255, 0.4)"
            }}>
              <Navigation size={18} color="#FFFFFF" style={{ transform: "rotate(45deg)" }} />
            </div>
            <h1 className="title-display text-gradient-cyan" style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "-0.03em" }}>
              RoadSense
            </h1>
            <span style={{
              background: "rgba(0, 229, 255, 0.1)",
              border: "1px solid rgba(0, 229, 255, 0.2)",
              color: "var(--primary-cyan)",
              fontSize: "10px",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "99px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Web Console v1.0
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500, maxWidth: "520px", lineHeight: "1.5" }}>
            Autonomous route safety optimizer & AI-powered trip intelligence copilot. Re-routing your journeys for safety, efficiency, and real-time navigation hazards.
          </p>
        </div>

        {/* Global Live Stats Panel */}
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.15)",
              borderRadius: "10px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Compass size={20} color="var(--safest-green)" />
            </div>
            <div>
              <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 800, letterSpacing: "0.05em" }}>
                Total Distance
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-display)" }}>
                {stats.distanceDriven}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: "rgba(6, 182, 212, 0.1)",
              border: "1px solid rgba(6, 182, 212, 0.15)",
              borderRadius: "10px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <ShieldAlert size={20} color="var(--fastest-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 800, letterSpacing: "0.05em" }}>
                Safety Index
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-display)" }}>
                {stats.safetyScore ? `${stats.safetyScore}/100` : "--"}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
