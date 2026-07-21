import { 
  Gauge, 
  CheckCircle2, 
  Leaf, 
  ShieldCheck, 
  Thermometer, 
  CloudRain, 
  Sun, 
  Wind, 
  Eye, 
  AlertTriangle, 
  Compass, 
  Info 
} from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import { useStats } from "../hooks/useStats";
import { useWeather } from "../hooks/useWeather";
import { hazards } from "../constants/mockData";
import { routeColor } from "../constants/routeDisplay";

export default function DashboardView() {
  const stats = useStats();
  const { routePlan } = useAppState();
  const weather = useWeather(routePlan?.sourceCoordinate);
  
  const bestRoute = routePlan?.routes[0];

  const safetyAnalytics = [
    { id: "safest", label: "Safest", score: 0, color: "#22c55e" },
    { id: "fastest", label: "Fastest", score: 0, color: "#06b6d4" },
    { id: "eco", label: "Eco", score: 0, color: "#a855f7" }
  ].map((fallback, index) => {
    const route = routePlan?.routes[index];
    return route
      ? {
          id: route.id,
          label: route.name.replace(" Route", ""),
          score: route.safetyScore,
          color: routeColor(route.id, index)
        }
      : fallback;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Driving Statistics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        
        <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.15)", borderRadius: "var(--border-radius-sm)" }}>
            <Gauge size={20} color="var(--primary-cyan)" />
          </div>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 800 }}>Distance</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-display)", marginTop: "2px" }}>
              {stats.distanceDriven}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.15)", borderRadius: "var(--border-radius-sm)" }}>
            <CheckCircle2 size={20} color="var(--safest-green)" />
          </div>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 800 }}>Trips</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-display)", marginTop: "2px" }}>
              {stats.completedTrips}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.15)", borderRadius: "var(--border-radius-sm)" }}>
            <Leaf size={20} color="var(--eco-purple)" />
          </div>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 800 }}>Fuel Saved</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-display)", marginTop: "2px" }}>
              {stats.fuelSaved}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.15)", borderRadius: "var(--border-radius-sm)" }}>
            <ShieldCheck size={20} color="var(--warn-yellow)" />
          </div>
          <div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 800 }}>Safety Rating</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-display)", marginTop: "2px" }}>
              {stats.avgSafety ? `${stats.avgSafety}/100` : "--"}
            </div>
          </div>
        </div>

      </div>

      {/* Active Driving Insights */}
      <div className="glass-panel">
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-display)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Compass size={16} color="var(--primary-cyan)" />
          <span>Active Journey Insights</span>
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Active Destination</span>
            <span style={{ fontWeight: 700, color: "#FFFFFF", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {routePlan?.destination ?? "None"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Recommended Route</span>
            <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{bestRoute?.name ?? "--"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Current ETA</span>
            <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{bestRoute ? `${bestRoute.eta} minutes` : "--"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-secondary)" }}>Estimated Fuel</span>
            <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{bestRoute ? `${bestRoute.fuelUsage.toFixed(2)} L` : "--"}</span>
          </div>
        </div>
      </div>

      {/* Weather Intelligence Widget */}
      <div className="glass-panel">
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-display)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
          {weather && weather.rainProbability > 55 ? <CloudRain size={16} color="var(--primary-cyan)" /> : <Sun size={16} color="var(--warn-yellow)" />}
          <span>Weather Intelligence</span>
        </h3>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "18px" }}>
          <div style={{ fontSize: "38px", fontWeight: 800, fontFamily: "var(--font-display)", display: "flex", alignItems: "flex-start" }}>
            <span>{weather ? weather.temperature : 29}</span>
            <span style={{ fontSize: "20px", color: "var(--primary-cyan)", marginTop: "4px" }}>°C</span>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
              {weather ? weather.conditions : "Partly cloudy"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Road Grip: <span style={{ fontWeight: 700, color: weather && weather.rainProbability > 55 ? "var(--warn-yellow)" : "var(--safest-green)" }}>
                {weather ? weather.roadCondition : "Normal road grip"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
            <Thermometer size={14} />
            <span>Impact Score: <strong style={{ color: "#FFFFFF" }}>{weather ? weather.impactScore : 24}/100</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
            <CloudRain size={14} />
            <span>Rain Chance: <strong style={{ color: "#FFFFFF" }}>{weather ? weather.rainProbability : 22}%</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
            <Wind size={14} />
            <span>Wind Speed: <strong style={{ color: "#FFFFFF" }}>{weather ? weather.windSpeed : 11} km/h</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
            <Eye size={14} />
            <span>Visibility: <strong style={{ color: "#FFFFFF" }}>{weather ? weather.visibility : "Good"}</strong></span>
          </div>
        </div>
      </div>

      {/* Safety Analytics side-by-side rings */}
      <div className="glass-panel">
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-display)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldCheck size={16} color="var(--safest-green)" />
          <span>Safety Analytics</span>
        </h3>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
          {safetyAnalytics.map((item) => (
            <div key={item.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: "10px" }}>
              <div style={{
                position: "relative",
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                border: `4px solid ${item.color}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `inset 0 0 10px rgba(0,0,0,0.5), 0 0 8px ${item.color}33`
              }}>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF" }}>{item.score || "--"}</span>
                <span style={{ fontSize: "9px", color: "var(--text-secondary)", marginTop: "-2px" }}>/100</span>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Hazards Incident Feed */}
      <div className="glass-panel">
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-display)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
          <AlertTriangle size={16} color="var(--danger-red)" />
          <span>Live Hazard Feeds (Chennai MVP)</span>
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {hazards.map((haz) => (
            <div key={haz.id} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
              borderRadius: "var(--border-radius-sm)",
              padding: "10px"
            }}>
              <AlertTriangle size={14} color={haz.severity === "high" ? "var(--danger-red)" : "var(--warn-yellow)"} style={{ marginTop: "2px", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{haz.title}</span>
                  <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{haz.timestamp}</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Location: <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{haz.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
