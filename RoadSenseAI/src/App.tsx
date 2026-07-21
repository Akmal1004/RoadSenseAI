import { useState, useEffect, useRef } from "react";
import { AppStateProvider, useAppState } from "./context/AppStateContext";
import RoutePlanner from "./components/RoutePlanner";
import MapContainer from "./components/MapContainer";
import DashboardView from "./components/DashboardView";
import CoPilotChat from "./components/CoPilotChat";
import ProfileSettings from "./components/ProfileSettings";
import { 
  Bot, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  Navigation, 
  ExternalLink,
  Shield, 
  ShieldCheck,
  Timer, 
  Zap, 
  X,
  Sparkles,
  Map,
  Compass,
  CloudRain,
  ChevronRight,
  ShieldAlert,
  Info,
  Layers,
  Activity,
  ArrowRight
} from "lucide-react";
import { useStats } from "./hooks/useStats";
import gsap from "gsap";

// Navigation Header Bar Component
function NavBar({ currentPath }: { currentPath: string }) {
  const { routePlan } = useAppState();
  const navRef = useRef<HTMLDivElement>(null);

  // Entrance animation for header
  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(navRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: "power3.out" }
    );
  }, []);

  const getNavLinkClass = (hash: string) => {
    const active = currentPath === hash || (hash === "#/" && currentPath === "#/home");
    return `nav-link-item ${active ? "active" : ""}`;
  };

  return (
    <nav ref={navRef} className="nav-header">
      {/* Brand logo */}
      <a href="#/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <div style={{
          background: "linear-gradient(135deg, #00e5ff 0%, #3b82f6 100%)",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 10px rgba(0, 229, 255, 0.4)"
        }}>
          <Navigation size={15} color="#FFFFFF" style={{ transform: "rotate(45deg)" }} />
        </div>
        <span className="title-display text-gradient-cyan" style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "-0.02em" }}>
          RoadSense
        </span>
      </a>

      {/* Nav Links */}
      <ul className="nav-links-container">
        <li>
          <a href="#/" className={getNavLinkClass("#/")}>
            Home
          </a>
        </li>
        <li>
          <a href="#/console" className={getNavLinkClass("#/console")}>
            Console
          </a>
        </li>
        <li>
          <a href="#/dashboard" className={getNavLinkClass("#/dashboard")}>
            Dashboard
          </a>
        </li>
        <li>
          <a href="#/copilot" className={getNavLinkClass("#/copilot")}>
            AI Co-Pilot
          </a>
        </li>
        <li>
          <a href="#/settings" className={getNavLinkClass("#/settings")}>
            Settings
          </a>
        </li>
      </ul>

      {/* Right-side Status Badge / CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {routePlan ? (
          <div style={{
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            color: "var(--safest-green)",
            fontSize: "11px",
            fontWeight: 800,
            padding: "5px 12px",
            borderRadius: "99px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--safest-green)", animation: "fadeIn 1s infinite alternate" }} />
            <span>Active: {routePlan.destination.split(",")[0]}</span>
          </div>
        ) : (
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-secondary)",
            fontSize: "11px",
            fontWeight: 700,
            padding: "5px 12px",
            borderRadius: "99px"
          }}>
            No Active Trip
          </div>
        )}
        <a 
          href="#/console" 
          className="btn-gradient" 
          style={{ height: "36px", padding: "0 16px", fontSize: "12px", textDecoration: "none", width: "auto", boxShadow: "none" }}
        >
          Launch App
        </a>
      </div>
    </nav>
  );
}

// Global Footbar Component
function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--glass-border)",
      padding: "40px 0 20px 0",
      marginTop: "80px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "20px",
      fontSize: "13px",
      color: "var(--text-secondary)",
      zIndex: 10,
      position: "relative"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Navigation size={14} color="var(--primary-cyan)" style={{ transform: "rotate(45deg)" }} />
        <span style={{ fontWeight: 800, color: "#FFFFFF" }}>RoadSense Web Console</span>
      </div>
      <div>
        <span>© 2026 RoadSense Trip Intelligence. Replicated client MVP.</span>
      </div>
      <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
        <a href="#/" style={{ color: "var(--text-secondary)", textDecoration: "none", transition: "var(--transition-smooth)", fontSize: "13px" }} className="nav-link-item">Privacy Policy</a>
        <a href="#/console" style={{ color: "var(--text-secondary)", textDecoration: "none", transition: "var(--transition-smooth)", fontSize: "13px" }} className="nav-link-item">Console</a>
        <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>External API usage limits apply</span>
      </div>
    </footer>
  );
}

// GSAP Animating Counter Component
function CounterItem({ 
  label, 
  endVal, 
  prefix = "", 
  suffix = "", 
  color = "#FFFFFF",
  startAnimate = false
}: { 
  label: string; 
  endVal: number; 
  prefix?: string; 
  suffix?: string;
  color?: string;
  startAnimate?: boolean;
}) {
  const numberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!numberRef.current || !startAnimate) return;
    const obj = { val: 0 };
    gsap.fromTo(obj, 
      { val: 0 },
      {
        val: endVal,
        duration: 2.0,
        ease: "power3.out",
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.textContent = `${prefix}${Math.round(obj.val).toLocaleString()}${suffix}`;
          }
        }
      }
    );
  }, [endVal, prefix, suffix, startAnimate]);

  return (
    <div style={{ textAlign: "center", padding: "10px" }} className="stat-card-item">
      <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 800, marginBottom: "6px", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div ref={numberRef} style={{ fontSize: "32px", fontWeight: 900, fontFamily: "var(--font-display)", color: color }}>
        {prefix}0{suffix}
      </div>
    </div>
  );
}
// Landing Page (Home View)
function HomeView() {
  const stats = useStats();
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [animateCounters, setAnimateCounters] = useState(false);

  // REDESIGNED FEATURE SECTION LOGIC
  const [activeFeature, setActiveFeature] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const featuresData = [
    {
      title: "Multi-Factor Safety Scoring",
      description: "Evaluates route profiles on safety metrics. Compares and ranks directions so you can choose paths with lower hazard risk and clearer flows.",
      icon: <ShieldCheck size={18} />,
      color: "var(--safest-green)",
      glowColor: "rgba(34, 197, 94, 0.25)",
      accentBg: "rgba(34, 197, 94, 0.08)",
      borderColor: "rgba(34, 197, 94, 0.3)",
      tag: "SAFETY CORE v2.1",
      logs: [
        "[SYSTEM] Initializing Multi-Factor Safety Engine...",
        "[GEO] Fetching alternate coordinate pathways [4 sets]...",
        "[CALC] Computing safe coefficients: topography, curve severity...",
        "[WARN] High sharp-curve density detected on Highway 4A.",
        "[INFO] SafeScore: Route A: 96/100 | Route B: 84/100 | Route C: 72/100.",
        "[RECOMMEND] Optimal safest route selected."
      ],
      details: {
        score: "96 / 100 SAFETY INDEX",
        metrics: [
          { name: "Curve Severity Risk", val: 15 },
          { name: "Congestion Index", val: 24 },
          { name: "Slippage Danger", val: 8 }
        ]
      }
    },
    {
      title: "WebGL Map Preview",
      description: "Visualizes route geometry using hardware-accelerated MapLibre GL. Overlay multiple directions, inspect zoom limits, and trigger path switches.",
      icon: <Map size={18} />,
      color: "var(--primary-cyan)",
      glowColor: "var(--primary-glow)",
      accentBg: "rgba(0, 229, 255, 0.08)",
      borderColor: "rgba(0, 229, 255, 0.3)",
      tag: "WEBGL GL-RENDERER",
      logs: [
        "[MAPLIBRE] Hardware WebGL context initialized successfully.",
        "[VECTORS] Fetching administrative boundaries and road layers...",
        "[PATH] Plotting GeoJSON route vectors: 142 latitude/longitude vertices...",
        "[ZOOM] Bounds centered: min(77.58, 12.94), max(77.65, 12.99)...",
        "[RENDER] Frame draw complete in 12.4ms (60 FPS active)."
      ],
      details: {
        score: "60 FPS ACTIVE",
        metrics: [
          { name: "Tile Draw Call Latency", val: 8 },
          { name: "GPU Memory Utilized", val: 32 },
          { name: "Vector Vertices Plotted", val: 78 }
        ]
      }
    },
    {
      title: "Weather Intelligence",
      description: "Integrates forecasts from Open-Meteo. Computes wind speeds, visibility scales, and rain probability thresholds to score real-time road conditions.",
      icon: <CloudRain size={18} />,
      color: "var(--eco-purple)",
      glowColor: "var(--eco-glow)",
      accentBg: "rgba(168, 85, 247, 0.08)",
      borderColor: "rgba(168, 85, 247, 0.3)",
      tag: "METEOROLOGY GRID",
      logs: [
        "[WEATHER] Syncing with Open-Meteo regional grid data...",
        "[COORD] Mapping active weather cells for grid: lat 12.97 / lon 77.59...",
        "[METEO] Temperature: 28.5°C | Wind: 14.8 km/h at 230° SW...",
        "[METEO] Precipitation probability: 10% | Humidity: 58%...",
        "[GRIP] Calibrating road grip coefficient: 0.94 (Optimal dry surface)."
      ],
      details: {
        score: "DRY ROAD CONDITIONS",
        metrics: [
          { name: "Precipitation Risk", val: 10 },
          { name: "Crosswind Influence", val: 18 },
          { name: "Surface Grip Index", val: 94 }
        ]
      }
    },
    {
      title: "Generative AI Copilot",
      description: "Chat directly with our Gemini-powered co-pilot. Solicits instant guidelines on fuel mileage, optimal departure schedules, and local landmark nodes.",
      icon: <Bot size={18} />,
      color: "var(--warn-yellow)",
      glowColor: "rgba(250, 204, 21, 0.2)",
      accentBg: "rgba(250, 204, 21, 0.08)",
      borderColor: "rgba(250, 204, 21, 0.3)",
      tag: "GEMINI FLASH INTERFACE",
      logs: [
        "[CHAT] Gemini Session established: ID cb3-f421a...",
        "[PROMPT] User requested optimal departure suggestion...",
        "[AI] Analyzing weather degradation and current route speed drops...",
        "[AI] Guidance: Recommend departure at 16:15 before rain likelihood increases.",
        "[AI] Bypass recommended near Highway 3 intersection: Saves 6 mins."
      ],
      details: {
        score: "AI COPILOT ONLINE",
        metrics: [
          { name: "Response Latency", val: 24 },
          { name: "Token Compression Ratio", val: 82 },
          { name: "Context Accuracy Score", val: 98 }
        ]
      }
    }
  ];

  // Check if we use actual trip context stats or default mock scan metrics
  const isActualActive = stats.trips > 0;
  
  const targetDistance = isActualActive ? parseFloat(stats.distanceDriven.replace(" km", "")) : 286;
  const targetTrips = isActualActive ? stats.completedTrips : 14;
  const targetSavings = isActualActive ? parseFloat(stats.fuelSaved.replace("Rs ", "")) : 1020;
  const targetSafety = isActualActive ? stats.avgSafety : 92;

  // 1. Hero elements entrance on mount (since it's at the top of the viewport)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-anim",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  // 2. Stats ribbon entrance & number counters count-up triggered by scroll intersection
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (statsRef.current) {
          gsap.fromTo(statsRef.current,
            { opacity: 0, scale: 0.98, y: 15 },
            { 
              opacity: 1, 
              scale: 1, 
              y: 0, 
              duration: 0.8, 
              ease: "power2.out",
              onComplete: () => {
                setAnimateCounters(true);
              }
            }
          );
        } else {
          setAnimateCounters(true);
        }
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    const timer = setTimeout(() => {
      if (statsRef.current) {
        observer.observe(statsRef.current);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // 3. Workflow pipeline cards stagger entrance triggered by scroll intersection
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        gsap.fromTo(".flow-card-anim",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
        );
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    const timer = setTimeout(() => {
      if (flowRef.current) {
        observer.observe(flowRef.current);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // 4. Features section cards stagger entrance triggered by scroll intersection
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        gsap.fromTo(".feature-card-anim",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
        );
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    const timer = setTimeout(() => {
      if (featuresRef.current) {
        observer.observe(featuresRef.current);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "95px" }} className="fade-in">
      {/* Hero Section */}
      <section ref={heroRef} className="hero-landing">
        <div className="hero-tag hero-anim">
          <Sparkles size={12} />
          <span>Trip Safety Intelligence</span>
        </div>
        
        <h1 className="hero-title title-display hero-anim">
          Autonomous Route Safety <br />
          <span className="text-gradient-cyan">& Co-Pilot Guidance</span>
        </h1>
        
        <p className="hero-description hero-anim">
          Optimizing your journeys using real-time safety scores, meteorological road grip indicators, and a conversational AI co-pilot. Your navigation console, evolved.
        </p>

        <div className="hero-buttons hero-anim">
          <a href="#/console" className="btn-gradient" style={{ flex: 1, textDecoration: "none" }}>
            <Navigation size={16} style={{ transform: "rotate(45deg)" }} />
            <span>Launch Console</span>
          </a>
          <a 
            href="#/dashboard" 
            className="chip" 
            style={{ flex: 1, display: "flex", justifyContent: "center", height: "50px", borderRadius: "var(--border-radius-md)", fontSize: "15px", fontWeight: 700 }}
          >
            Explore Dashboard
            <ChevronRight size={16} style={{ marginLeft: "4px" }} />
          </a>
        </div>
      </section>

      {/* Aggregate Stats Strip (Interactive counters triggered by visibility) */}
      <section 
        ref={statsRef} 
        className="glass-panel" 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "24px", 
          padding: "30px 24px",
          position: "relative",
          opacity: 0 // Initial opacity to prevent flash before observer triggers
        }}
      >
        <div style={{ position: "absolute", top: "10px", right: "12px", fontSize: "9px", color: isActualActive ? "var(--safest-green)" : "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>
          {isActualActive ? "• Active Trip Statistics" : "• Mock Analytics Scan"}
        </div>
        
        <CounterItem label="Aggregate Distance" endVal={targetDistance} suffix=" km" startAnimate={animateCounters} />
        <CounterItem label="Trips Guided" endVal={targetTrips} color="var(--primary-cyan)" startAnimate={animateCounters} />
        <CounterItem label="Accrued Savings" endVal={targetSavings} prefix="Rs " color="var(--safest-green)" startAnimate={animateCounters} />
        <CounterItem label="Safety Index" endVal={targetSafety} suffix="/100" color="var(--warn-yellow)" startAnimate={animateCounters} />
      </section>

      {/* NEW: How it Works Section (Safety Pipeline Flow) */}
      <section ref={flowRef} style={{ padding: "10px 0" }}>
        <h2 style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, marginBottom: "6px" }}>
          The Routing Safety Pipeline
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "14px", marginBottom: "34px", maxWidth: "550px", margin: "0 auto 34px auto" }}>
          How RoadSense calculates scores, evaluates hazards, and prepares turn-by-turn guidelines.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          
          <div className="glass-panel flow-card-anim" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "26px", opacity: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Layers size={16} color="var(--primary-cyan)" style={{ margin: "auto" }} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--primary-cyan)" }}>STAGE 01</span>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 800 }}>1. Route Geometry Scan</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Ingests coordinate nodes using geocoding engines. Requests alternative directions from OpenRouteService and draws geometries.
            </p>
          </div>

          <div className="glass-panel flow-card-anim" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "26px", opacity: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity size={16} color="var(--safest-green)" style={{ margin: "auto" }} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--safest-green)" }}>STAGE 02</span>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 800 }}>2. Multi-Factor Score Analysis</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Calculates safety indexes by referencing wind velocities, rain probabilities (Open-Meteo API), and regional incident hazards.
            </p>
          </div>

          <div className="glass-panel flow-card-anim" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "26px", opacity: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={16} color="var(--warn-yellow)" style={{ margin: "auto" }} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--warn-yellow)" }}>STAGE 03</span>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 800 }}>3. Copilot Synchronization</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Synchronizes route metrics with Gemini Flash-Lite models to output driving suggestions, weekly savings projections, and checklists.
            </p>
          </div>

        </div>
      </section>

      {/* Feature Showcase Redesign */}
      <section ref={featuresRef} className="intel-section feature-card-anim" style={{ opacity: 0 }}>
        <h2 style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, marginBottom: "6px" }}>
          Copilot Intelligence Center
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "14px", marginBottom: "34px", maxWidth: "550px", margin: "0 auto 34px auto" }}>
          Explore RoadSense's core modules driving our AI-guided navigation and route hazard analyzer.
        </p>

        <div className="intel-container">
          {/* Left Side: Interactive Selectors */}
          <div className="intel-selector-list">
            {featuresData.map((feature, idx) => {
              const isActive = activeFeature === idx;
              return (
                <button
                  key={idx}
                  className={`intel-selector-btn ${isActive ? "active" : ""}`}
                  style={{
                    ["--active-accent-color" as any]: feature.color,
                    ["--active-border-color" as any]: feature.borderColor,
                    ["--active-accent-bg" as any]: feature.accentBg
                  }}
                  onClick={() => {
                    setActiveFeature(idx);
                    setAutoPlay(false);
                  }}
                >
                  <div className="intel-selector-header">
                    <div className="intel-selector-icon-wrapper">
                      {feature.icon}
                    </div>
                    <span className="intel-selector-title">{feature.title}</span>
                  </div>
                  <p className="intel-selector-desc">{feature.description}</p>
                </button>
              );
            })}
          </div>

          {/* Right Side: Interactive High-Tech Diagnostic Panel */}
          <div 
            className="intel-diagnostics-monitor"
            style={{
              ["--active-accent-color" as any]: featuresData[activeFeature].color
            }}
          >
            <div className="intel-monitor-header">
              <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                <span className="intel-monitor-dot"></span>
                SYSTEM MODULE DIAGNOSTIC: {featuresData[activeFeature].tag}
              </span>
              <span style={{ fontSize: "10px", color: featuresData[activeFeature].color, fontWeight: "bold" }}>
                {featuresData[activeFeature].details.score}
              </span>
            </div>

            {/* Diagnostic Logs */}
            <div className="intel-monitor-content">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "12px", marginBottom: "6px" }}>
                {featuresData[activeFeature].logs.map((log, lIdx) => (
                  <div key={lIdx} style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--text-muted)", width: "65px", flexShrink: 0 }}>
                      [{(15 + lIdx).toString().padStart(2, "0")}:32:{(20 + lIdx * 7).toString().padStart(2, "0")}]
                    </span>
                    <span style={{ 
                      color: log.includes("[WARN]") ? "var(--warn-yellow)" : log.includes("[RECOMMEND]") || log.includes("[SUCCESS]") || log.includes("[AI]") ? "#ffffff" : featuresData[activeFeature].color 
                    }}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic stats breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.05em", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "2px" }}>
                  Diagnostic Metrics Breakdown
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {featuresData[activeFeature].details.metrics.map((metric, mIdx) => (
                    <div 
                      key={mIdx}
                      style={{ 
                        background: "rgba(255, 255, 255, 0.02)", 
                        border: "1px solid rgba(255, 255, 255, 0.05)", 
                        borderRadius: "8px", 
                        padding: "10px", 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "4px" 
                      }}
                    >
                      <span style={{ fontSize: "9px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {metric.name}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>
                          {metric.val}%
                        </span>
                        <div style={{ width: "24px", height: "4px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${metric.val}%`, height: "100%", background: featuresData[activeFeature].color }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Marquee Section */}
      <section className="marquee-container">
        <h2 style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, marginBottom: "6px" }}>
          Trusted by Drivers Everywhere
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "14px", marginBottom: "12px", maxWidth: "500px" }}>
          See how our AI-guided navigation saves time, fuel, and ensures a safer journey.
        </p>

        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[
              {
                name: "Alex Mercer",
                handle: "@alex_nav",
                avatar: "AM",
                avatarBg: "#3b82f6",
                rating: 5,
                text: "The safety score routing saved me from a massive waterlogged bypass last week! Absolutely essential web console tool."
              },
              {
                name: "Priya Sharma",
                handle: "@priya_travels",
                avatar: "PS",
                avatarBg: "#10b981",
                rating: 5,
                text: "Gemini Copilot scheduling suggestions are spot on. Saved about 4.5 Liters of fuel already on my weekly commute!"
              },
              {
                name: "Rohan Das",
                handle: "@rohan_rider",
                avatar: "RD",
                avatarBg: "#facc15",
                rating: 5,
                text: "The WebGL map preview is incredibly smooth. Transitioning alternative route options feels like using professional aerospace dashboards."
              },
              {
                name: "Sarah Jenkins",
                handle: "@sarah_j",
                avatar: "SJ",
                avatarBg: "#8b5cf6",
                rating: 5,
                text: "Open-Meteo real-time rain probability and road grip index tracking makes storm driving feel much safer. Five stars!"
              },
              {
                name: "Kabir Mehta",
                handle: "@kabir_m",
                avatar: "KM",
                avatarBg: "#ec4899",
                rating: 4,
                text: "Excellent integration of multi-factor hazards check. It's clean, premium, and very fast at recalculating optimal routes."
              },
              {
                name: "Diana Prince",
                handle: "@diana_cruise",
                avatar: "DP",
                avatarBg: "#ef4444",
                rating: 5,
                text: "Truly a next-gen trip intelligence system. The conversational guidance checklist prepared me perfectly for the mountain trip."
              }
            ].map((review, idx) => (
              <div key={`rev-1-${idx}`} className="review-card">
                <div className="review-card-header">
                  <div className="review-avatar" style={{ backgroundColor: review.avatarBg }}>
                    {review.avatar}
                  </div>
                  <div className="review-user-info">
                    <span className="review-username">{review.name}</span>
                    <span className="review-handle">{review.handle}</span>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: "2px" }}>
                    {Array.from({ length: review.rating }).map((_, rIdx) => (
                      <span key={rIdx} style={{ color: "var(--warn-yellow)", fontSize: "12px" }}>★</span>
                    ))}
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
            {[
              {
                name: "Alex Mercer",
                handle: "@alex_nav",
                avatar: "AM",
                avatarBg: "#3b82f6",
                rating: 5,
                text: "The safety score routing saved me from a massive waterlogged bypass last week! Absolutely essential web console tool."
              },
              {
                name: "Priya Sharma",
                handle: "@priya_travels",
                avatar: "PS",
                avatarBg: "#10b981",
                rating: 5,
                text: "Gemini Copilot scheduling suggestions are spot on. Saved about 4.5 Liters of fuel already on my weekly commute!"
              },
              {
                name: "Rohan Das",
                handle: "@rohan_rider",
                avatar: "RD",
                avatarBg: "#facc15",
                rating: 5,
                text: "The WebGL map preview is incredibly smooth. Transitioning alternative route options feels like using professional aerospace dashboards."
              },
              {
                name: "Sarah Jenkins",
                handle: "@sarah_j",
                avatar: "SJ",
                avatarBg: "#8b5cf6",
                rating: 5,
                text: "Open-Meteo real-time rain probability and road grip index tracking makes storm driving feel much safer. Five stars!"
              },
              {
                name: "Kabir Mehta",
                handle: "@kabir_m",
                avatar: "KM",
                avatarBg: "#ec4899",
                rating: 4,
                text: "Excellent integration of multi-factor hazards check. It's clean, premium, and very fast at recalculating optimal routes."
              },
              {
                name: "Diana Prince",
                handle: "@diana_cruise",
                avatar: "DP",
                avatarBg: "#ef4444",
                rating: 5,
                text: "Truly a next-gen trip intelligence system. The conversational guidance checklist prepared me perfectly for the mountain trip."
              }
            ].map((review, idx) => (
              <div key={`rev-2-${idx}`} className="review-card">
                <div className="review-card-header">
                  <div className="review-avatar" style={{ backgroundColor: review.avatarBg }}>
                    {review.avatar}
                  </div>
                  <div className="review-user-info">
                    <span className="review-username">{review.name}</span>
                    <span className="review-handle">{review.handle}</span>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: "2px" }}>
                    {Array.from({ length: review.rating }).map((_, rIdx) => (
                      <span key={rIdx} style={{ color: "var(--warn-yellow)", fontSize: "12px" }}>★</span>
                    ))}
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Console View (Planner + Map Container side-by-side)
function ConsoleView({ 
  selectedRouteId, 
  setSelectedRouteId, 
  setIsNavigating 
}: { 
  selectedRouteId: string | null; 
  setSelectedRouteId: (id: string | null) => void;
  setIsNavigating: (active: boolean) => void;
}) {
  const { routePlan } = useAppState();
  const consoleRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance
  useEffect(() => {
    if (!consoleRef.current) return;
    gsap.fromTo(consoleRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" }
    );
  }, []);

  const getBadgeColor = (badge: string) => {
    if (badge === "RECOMMENDED") return "var(--safest-green)";
    if (badge === "FASTEST") return "var(--fastest-cyan)";
    return "var(--eco-purple)";
  };

  return (
    <div ref={consoleRef} className="console-grid fade-in">
      {/* Planner Card */}
      <div>
        <RoutePlanner />
      </div>

      {/* Map + Route Cards Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Map Container */}
        <div style={{ height: "420px" }} className="glass-panel">
          <MapContainer 
            plan={routePlan} 
            selectedRouteId={selectedRouteId} 
            onSelectRoute={setSelectedRouteId} 
          />
        </div>

        {/* Route options cards list */}
        <div className="glass-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              Optimal Route Options
            </h3>
            {routePlan && selectedRouteId && (
              <button
                onClick={() => setIsNavigating(true)}
                className="btn-gradient"
                style={{ width: "auto", height: "38px", padding: "0 18px", fontSize: "13px" }}
              >
                <Navigation size={14} style={{ transform: "rotate(45deg)" }} />
                <span>Start Navigation</span>
              </button>
            )}
          </div>

          {routePlan?.routes && routePlan.routes.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {routePlan.routes.map((route) => {
                const isSelected = selectedRouteId === route.id;
                const activeColor = getBadgeColor(route.badge);

                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className="glass-card-interactive"
                    style={{
                      padding: "16px",
                      borderRadius: "var(--border-radius-md)",
                      border: `1px solid ${isSelected ? activeColor : "var(--glass-border)"}`,
                      cursor: "pointer",
                      transition: "var(--transition-smooth)",
                      background: isSelected ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          background: `${activeColor}20`,
                          border: `1px solid ${activeColor}40`,
                          color: activeColor,
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: "4px"
                        }}>
                          {route.badge}
                        </span>
                        <span style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "15px" }}>
                          {route.name}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Shield size={14} color="var(--safest-green)" />
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--safest-green)" }}>
                          Safety score: {route.safetyScore}/100
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <div>
                        <span>Distance:</span>
                        <div style={{ color: "#FFFFFF", fontWeight: 700, marginTop: "2px" }}>
                          {route.distance} km
                        </div>
                      </div>
                      <div>
                        <span>ETA Duration:</span>
                        <div style={{ color: "#FFFFFF", fontWeight: 700, marginTop: "2px" }}>
                          {route.eta} mins
                        </div>
                      </div>
                      <div>
                        <span>Fuel Ratio:</span>
                        <div style={{ color: "#FFFFFF", fontWeight: 700, marginTop: "2px" }}>
                          {route.fuelUsage.toFixed(2)} L
                        </div>
                      </div>
                      <div>
                        <span>Fuel Cost:</span>
                        <div style={{ color: "#FFFFFF", fontWeight: 700, marginTop: "2px" }}>
                          Rs {route.fuelCost}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
              Enter your source and destination coordinates on the left panel to request safety-optimized alternative routes.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function MainAppContent() {
  const { routePlan } = useAppState();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.hash || "#/");

  // Sync Router hash changes and Scroll to Top on Page navigation
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || "#/");
      
      // Always scroll window instantly back to the top when navigating
      window.scrollTo(0, 0);
    };
    
    // Scroll to top on initial mount as well
    window.scrollTo(0, 0);

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Auto-select first route when a new plan is loaded
  useEffect(() => {
    if (routePlan?.routes && routePlan.routes.length > 0) {
      setSelectedRouteId(routePlan.routes[0].id);
    } else {
      setSelectedRouteId(null);
    }
  }, [routePlan]);

  const selectedRoute = routePlan?.routes.find((r) => r.id === selectedRouteId) || routePlan?.routes[0] || null;

  // Launch directions on google maps
  const openGoogleMaps = () => {
    if (!routePlan || !selectedRoute) return;
    const origin = `${routePlan.sourceCoordinate.latitude},${routePlan.sourceCoordinate.longitude}`;
    const destination = `${routePlan.destinationCoordinate.latitude},${routePlan.destinationCoordinate.longitude}`;
    
    const waypoints = selectedRoute.coordinates
      .slice(1, -1)
      .filter((_, idx, pts) => idx === 0 || idx === pts.length - 1)
      .map((p) => `${p.latitude},${p.longitude}`)
      .join("|");

    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving${
      waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""
    }`;
    window.open(url, "_blank");
  };

  return (
    <div className="app-container">
      {/* Global persistent Navigation Header */}
      <NavBar currentPath={currentPath} />

      {/* Pages Switch Router */}
      <div style={{ flex: 1, marginTop: "12px" }}>
        
        {/* HOME LANDING */}
        {(currentPath === "#/" || currentPath === "#/home") && <HomeView />}

        {/* ROUTING CONSOLE */}
        {currentPath === "#/console" && (
          <ConsoleView 
            selectedRouteId={selectedRouteId}
            setSelectedRouteId={setSelectedRouteId}
            setIsNavigating={setIsNavigating}
          />
        )}

        {/* TRIP INTEGRATION DASHBOARD */}
        {currentPath === "#/dashboard" && (
          <div className="centered-page-layout fade-in">
            <DashboardView />
          </div>
        )}

        {/* AI CO-PILOT CHAT */}
        {currentPath === "#/copilot" && (
          <div className="copilot-stretched-layout fade-in" style={{ height: "650px" }}>
            <CoPilotChat />
          </div>
        )}

        {/* PROFILE SETTINGS */}
        {currentPath === "#/settings" && (
          <div className="centered-page-layout fade-in">
            <ProfileSettings />
          </div>
        )}

      </div>

      {/* Persistent global Footer */}
      <Footer />

      {/* Turn-by-Turn Navigation Modal Overlay */}
      {isNavigating && selectedRoute && routePlan && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(3, 7, 18, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: "20px"
        }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "550px", animation: "slideInUp 0.35s ease forwards" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Navigation size={18} color="var(--primary-cyan)" style={{ transform: "rotate(45deg)" }} />
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Start Navigation</h3>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Selected: {selectedRoute.name}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsNavigating(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              
              <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "var(--border-radius-md)" }}>
                <Timer size={20} color="var(--primary-cyan)" />
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>Estimated Duration</span>
                  <strong style={{ fontSize: "15px" }}>{selectedRoute.eta} mins ({selectedRoute.distance} km)</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "var(--border-radius-md)" }}>
                <Zap size={20} color="var(--safest-green)" />
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>Safety Index score</span>
                  <strong style={{ fontSize: "15px", color: "var(--safest-green)" }}>{selectedRoute.safetyScore}/100</strong>
                </div>
              </div>

              <div style={{ padding: "14px", background: "rgba(0, 229, 255, 0.03)", border: "1px solid rgba(0, 229, 255, 0.08)", borderRadius: "var(--border-radius-md)" }}>
                <h4 style={{ fontSize: "12px", fontWeight: 800, color: "var(--primary-cyan)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={12} />
                  <span>AI Copilot Trip Tip</span>
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  This route is optimized using live safety analytics, weather projections, and fuel mileage ratios. Proceed carefully, follow local traffic guidance, and keep safety scores high.
                </p>
              </div>

              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                To view real-time turn-by-turn navigation on your device, launch the preloaded routing maps.
              </div>

            </div>

            {/* Launch Google Maps */}
            <button className="btn-gradient" onClick={openGoogleMaps} style={{ width: "100%" }}>
              <ExternalLink size={16} />
              <span>Launch Google Maps Navigation</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <MainAppContent />
    </AppStateProvider>
  );
}
