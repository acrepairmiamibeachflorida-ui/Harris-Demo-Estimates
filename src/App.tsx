import React, { useEffect, useMemo, useState } from "react";

type Step = "home" | "estimate" | "results" | "booking";
type ProjectName = "Kitchen Remodel" | "Bathroom Remodel" | "Full Renovation" | "Addition";
type SizeName = "Small" | "Medium" | "Large";
type FinishName = "Standard" | "High-End" | "Luxury";
type EstimateSubstep = 0 | 1 | 2;

const projectOptions: ProjectName[] = [
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Full Renovation",
  "Addition",
];

const sizeOptions: SizeName[] = ["Small", "Medium", "Large"];
const finishOptions: FinishName[] = ["Standard", "High-End", "Luxury"];

const pricing: Record<ProjectName, Record<SizeName, Record<FinishName, [number, number]>>> = {
  "Kitchen Remodel": {
    Small: { Standard: [45000, 65000], "High-End": [75000, 105000], Luxury: [110000, 160000] },
    Medium: { Standard: [65000, 85000], "High-End": [95000, 135000], Luxury: [140000, 210000] },
    Large: { Standard: [85000, 110000], "High-End": [120000, 170000], Luxury: [175000, 250000] },
  },
  "Bathroom Remodel": {
    Small: { Standard: [25000, 40000], "High-End": [45000, 65000], Luxury: [70000, 95000] },
    Medium: { Standard: [35000, 50000], "High-End": [60000, 85000], Luxury: [90000, 120000] },
    Large: { Standard: [45000, 65000], "High-End": [80000, 110000], Luxury: [115000, 150000] },
  },
  "Full Renovation": {
    Small: { Standard: [90000, 130000], "High-End": [140000, 195000], Luxury: [210000, 300000] },
    Medium: { Standard: [130000, 180000], "High-End": [190000, 265000], Luxury: [280000, 400000] },
    Large: { Standard: [180000, 240000], "High-End": [250000, 340000], Luxury: [360000, 500000] },
  },
  Addition: {
    Small: { Standard: [85000, 120000], "High-End": [125000, 170000], Luxury: [180000, 250000] },
    Medium: { Standard: [120000, 165000], "High-End": [170000, 230000], Luxury: [240000, 325000] },
    Large: { Standard: [165000, 220000], "High-End": [230000, 310000], Luxury: [320000, 425000] },
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function isMobileWidth() {
  return typeof window !== "undefined" ? window.innerWidth < 768 : false;
}

export default function HarrisContractingLiveDemo() {
  const [step, setStep] = useState<Step>("home");
  const [estimateSubstep, setEstimateSubstep] = useState<EstimateSubstep>(0);
  const [project, setProject] = useState<ProjectName | null>(null);
  const [size, setSize] = useState<SizeName | null>(null);
  const [finish, setFinish] = useState<FinishName | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isMobile, setIsMobile] = useState(isMobileWidth());
  const [visible, setVisible] = useState(false);
  const [pricePulse, setPricePulse] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const estimate = useMemo(() => {
    if (!project) return null;

    if (project && !size) {
      const ranges = Object.values(pricing[project]).flatMap((finishMap) => Object.values(finishMap));
      const mins = ranges.map(([min]) => min);
      const maxes = ranges.map(([, max]) => max);
      return { min: Math.min(...mins), max: Math.max(...maxes) };
    }

    if (project && size && !finish) {
      const ranges = Object.values(pricing[project][size]);
      const mins = ranges.map(([min]) => min);
      const maxes = ranges.map(([, max]) => max);
      return { min: Math.min(...mins), max: Math.max(...maxes) };
    }

    const [min, max] = pricing[project][size!][finish!];
    return { min, max };
  }, [project, size, finish]);

  useEffect(() => {
    const onResize = () => setIsMobile(isMobileWidth());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, estimateSubstep]);

  useEffect(() => {
    setPricePulse(true);
    const timer = window.setTimeout(() => setPricePulse(false), 280);
    return () => window.clearTimeout(timer);
  }, [project, size, finish, estimateSubstep]);

  const colors = {
    bg: "#0B0B0B",
    panel: "#161616",
    panelSoft: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.10)",
    text: "#FFFFFF",
    muted: "#A1A1AA",
    gold: "#C9A96E",
    goldSoft: "rgba(201,169,110,0.12)",
    goldBorder: "rgba(201,169,110,0.35)",
  };

  const progressWidth = step === "home" ? "0%" : step === "estimate" ? "33%" : step === "results" ? "66%" : "100%";

  function hasSelectionForCurrentEstimateStep() {
    if (estimateSubstep === 0) return !!project;
    if (estimateSubstep === 1) return !!size;
    return !!finish;
  }

  function promptForMissingSelection() {
    window.alert("Quick step — choose an option so we can refine your estimate.");
  }

  function getEstimateDisplay(context: "home" | "estimate") {
    if (estimate) return `${formatCurrency(estimate.min)} – ${formatCurrency(estimate.max)}`;
    return context === "home" ? "Waiting for Selection" : "Choose Project Type";
  }

  function getEstimateHelperText() {
    if (!project) return "Choose the project type to begin calculating your planning range.";
    if (project && !size) return `Range shown for ${project}. Choose project size to narrow it down.`;
    if (project && size && !finish) return `Range shown for ${project}, ${size.toLowerCase()} scope. Choose finish level to refine it further.`;
    return `Based on ${project}, ${size!.toLowerCase()} scope, and ${finish!.toLowerCase()} finishes.`;
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: `radial-gradient(circle at top, rgba(201,169,110,0.16), transparent 28%), ${colors.bg}`,
      color: colors.text,
      fontFamily: "Inter, system-ui, sans-serif",
      padding: isMobile ? "16px 14px 190px" : "28px 20px 40px",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.45s ease",
    } as React.CSSProperties,
    shell: {
      maxWidth: 1180,
      margin: "0 auto",
    } as React.CSSProperties,
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: isMobile ? "flex-start" : "center",
      flexDirection: isMobile ? "column" : "row",
      gap: 14,
      marginBottom: isMobile ? 18 : 28,
    } as React.CSSProperties,
    eyebrow: {
      fontSize: 11,
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color: "#71717A",
      marginBottom: 6,
    } as React.CSSProperties,
    brandTitle: {
      fontSize: isMobile ? 18 : 22,
      fontWeight: 700,
      lineHeight: 1.15,
    } as React.CSSProperties,
    primaryButton: {
      background: colors.gold,
      color: "#000",
      border: "none",
      borderRadius: 16,
      minHeight: 50,
      padding: isMobile ? "12px 18px" : "14px 22px",
      fontWeight: 700,
      fontSize: 14,
      cursor: "pointer",
      boxShadow: "0 10px 30px rgba(201,169,110,0.25)",
      transition: "all 0.2s ease",
    } as React.CSSProperties,
    secondaryButton: {
      background: "transparent",
      color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: 16,
      minHeight: 50,
      padding: isMobile ? "12px 18px" : "14px 22px",
      fontWeight: 700,
      fontSize: 14,
      cursor: "pointer",
      transition: "all 0.2s ease",
    } as React.CSSProperties,
    stepBar: {
      marginBottom: 16,
      border: `1px solid ${colors.border}`,
      background: colors.panelSoft,
      borderRadius: 16,
      padding: isMobile ? "12px 14px" : "12px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      color: colors.muted,
      fontSize: 14,
    } as React.CSSProperties,
    card: {
      background: colors.panel,
      border: `1px solid ${colors.border}`,
      borderRadius: 28,
      padding: isMobile ? 18 : 26,
      boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
      transition: "all 0.25s ease",
    } as React.CSSProperties,
    goldCard: {
      background: colors.goldSoft,
      border: `1px solid ${colors.goldBorder}`,
      borderRadius: 24,
      padding: isMobile ? 18 : 24,
    } as React.CSSProperties,
    sectionLabel: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.24em",
      textTransform: "uppercase",
      color: "#71717A",
      marginBottom: 10,
    } as React.CSSProperties,
    h1: {
      fontSize: isMobile ? 34 : 62,
      lineHeight: 1.02,
      fontWeight: 700,
      margin: 0,
      maxWidth: 720,
    } as React.CSSProperties,
    h2: {
      fontSize: isMobile ? 32 : 48,
      lineHeight: 1.06,
      fontWeight: 700,
      margin: 0,
    } as React.CSSProperties,
    body: {
      fontSize: isMobile ? 15 : 18,
      lineHeight: 1.7,
      color: colors.muted,
    } as React.CSSProperties,
    homeGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.08fr 0.92fr",
      gap: isMobile ? 18 : 24,
      alignItems: "start",
    } as React.CSSProperties,
    chipsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: 12,
      marginTop: 24,
    } as React.CSSProperties,
    chip: {
      border: `1px solid ${colors.border}`,
      background: colors.panelSoft,
      color: "#D4D4D8",
      borderRadius: 18,
      padding: "14px 16px",
      fontSize: 14,
      lineHeight: 1.5,
    } as React.CSSProperties,
    projectGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: 12,
    } as React.CSSProperties,
    projectCard: (active: boolean): React.CSSProperties => ({
      border: active ? `1px solid ${colors.gold}` : `1px solid ${colors.border}`,
      background: active ? colors.goldSoft : colors.panelSoft,
      color: colors.text,
      borderRadius: 22,
      padding: isMobile ? 16 : 18,
      textAlign: "left",
      cursor: "pointer",
      minHeight: 88,
      transition: "all 0.2s ease",
    }),
    optionGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: 12,
    } as React.CSSProperties,
    optionButton: (active: boolean): React.CSSProperties => ({
      border: active ? `1px solid ${colors.gold}` : `1px solid ${colors.border}`,
      background: active ? colors.goldSoft : colors.panelSoft,
      color: colors.text,
      borderRadius: 18,
      padding: "14px 16px",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      minHeight: 50,
      transition: "all 0.2s ease",
    }),
    twoColumn: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.06fr 0.94fr",
      gap: isMobile ? 16 : 22,
    } as React.CSSProperties,
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: 14,
      marginTop: 22,
    } as React.CSSProperties,
    summaryCard: {
      border: `1px solid ${colors.border}`,
      background: colors.panelSoft,
      borderRadius: 20,
      padding: "16px 18px",
      transition: "all 0.2s ease",
    } as React.CSSProperties,
    input: {
      height: 54,
      width: "100%",
      borderRadius: 18,
      border: `1px solid ${colors.border}`,
      background: "rgba(0,0,0,0.28)",
      color: colors.text,
      padding: "0 16px",
      fontSize: 15,
      outline: "none",
      boxSizing: "border-box",
    } as React.CSSProperties,
    sticky: {
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 40,
      borderTop: `1px solid ${colors.border}`,
      background: "rgba(11,11,11,0.96)",
      backdropFilter: "blur(12px)",
      padding: "12px 14px calc(env(safe-area-inset-bottom) + 14px)",
    } as React.CSSProperties,
  };

  function buttonHoverProps(): React.HTMLAttributes<HTMLButtonElement> {
    return isMobile
      ? {}
      : {
          onMouseEnter: (e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          },
          onMouseLeave: (e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
          },
        };
  }

  function cardHoverProps(): React.HTMLAttributes<HTMLDivElement> {
    return isMobile
      ? {}
      : {
          onMouseEnter: (e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
          },
          onMouseLeave: (e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0px)";
          },
        };
  }

  function progressBar() {
    return (
      <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden", marginTop: 8, width: "100%" }}>
        <div style={{ width: progressWidth, height: "100%", background: colors.gold, transition: "width 0.4s ease" }} />
      </div>
    );
  }

  function renderHome() {
    return (
      <div style={styles.homeGrid}>
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 999,
              border: `1px solid ${colors.border}`,
              background: colors.panelSoft,
              color: "#D4D4D8",
              fontSize: 13,
              marginBottom: 18,
            }}
          >
            Projects Starting at $75K+
          </div>
          <h1 style={styles.h1}>
            See What Your Renovation Will Cost <span style={{ color: colors.gold }}>Before You Commit</span>
          </h1>
          <p style={{ ...styles.body, maxWidth: 640, marginTop: 18 }}>
            A guided estimate experience designed to pre-qualify clients, introduce pricing early, and make a one-man operation feel like a premium, system-driven firm.
          </p>

          <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row", marginTop: 22 }}>
            <button style={styles.primaryButton} onClick={() => { setProject(null); setSize(null); setFinish(null); setEstimateSubstep(0); setStep("estimate"); }} {...buttonHoverProps()}>Start Your Estimate</button>
            <button style={styles.secondaryButton} onClick={() => setStep("results")} {...buttonHoverProps()}>Preview Results Experience</button>
          </div>

          <div style={styles.chipsGrid}>
            {["Structured lead filtering", "Premium pricing presentation", "Less wasted back-and-forth"].map((item) => (
              <div key={item} style={styles.chip}>{item}</div>
            ))}
          </div>
        </div>

        <div style={styles.card} {...cardHoverProps()}>
          <div style={styles.sectionLabel}>Live Demo Preview</div>
          <div style={{ fontSize: isMobile ? 24 : 30, fontWeight: 700, marginBottom: 18 }}>Client Estimate Experience</div>

          <div style={styles.goldCard}>
            <div style={{ fontSize: 14, color: "#E4E4E7" }}>Estimated Investment</div>
            <div
              style={{
                fontSize: isMobile ? 30 : 42,
                fontWeight: 700,
                marginTop: 10,
                lineHeight: 1.1,
                transform: pricePulse ? "scale(1.025)" : "scale(1)",
                opacity: pricePulse ? 0.92 : 1,
                transition: "transform 0.24s ease, opacity 0.24s ease"
              }}
            >
              {getEstimateDisplay("home")}
            </div>
            <div style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>Select project details to preview a planning range</div>
          </div>

          <div style={{ ...styles.projectGrid, marginTop: 16 }}>
            {projectOptions.map((item) => (
              <button key={item} style={styles.projectCard(project === item)} onClick={() => setProject(item)} {...buttonHoverProps()}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{item}</div>
                <div style={{ color: colors.muted, fontSize: 13, marginTop: 6 }}>Premium project planning flow</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderEstimateOptions() {
    if (estimateSubstep === 0) {
      return (
        <div style={styles.projectGrid}>
          {projectOptions.map((item) => (
            <button key={item} style={styles.projectCard(project === item)} onClick={() => setProject(item)} {...buttonHoverProps()}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{item}</div>
              <div style={{ color: colors.muted, fontSize: 13, marginTop: 6 }}>Select the scope that best matches the project</div>
            </button>
          ))}
        </div>
      );
    }

    if (estimateSubstep === 1) {
      return (
        <div style={styles.optionGrid}>
          {sizeOptions.map((item) => (
            <button key={item} style={styles.optionButton(size === item)} onClick={() => setSize(item)} {...buttonHoverProps()}>{item}</button>
          ))}
        </div>
      );
    }

    return (
      <div style={styles.optionGrid}>
        {finishOptions.map((item) => (
          <button key={item} style={styles.optionButton(finish === item)} onClick={() => setFinish(item)} {...buttonHoverProps()}>{item}</button>
        ))}
      </div>
    );
  }

  function renderEstimate() {
    const titles = ["Choose Project Type", "Select Project Size", "Select Finish Level"];
    const descriptions = [
      "Start by selecting the type of project the client is planning.",
      "Now narrow the scope so the planning range becomes more realistic.",
      "Finally, choose the finish level to shape the investment range.",
    ];

    return (
      <div style={{ maxWidth: 980, margin: "0 auto", paddingBottom: isMobile ? 24 : 0 }}>
        <div style={styles.stepBar}>
          <span>Step 1 of 3</span>
          <span>Build the estimate one decision at a time.</span>
          {progressBar()}
        </div>

        <div style={styles.card} {...cardHoverProps()}>
          <div style={styles.sectionLabel}>Step 1 · Project Builder</div>
          <h2 style={styles.h2}>Tell us about your project</h2>
          <p style={{ ...styles.body, marginTop: 14, maxWidth: 700 }}>
            This screen is focused on one decision at a time so the experience feels guided instead of overwhelming.
          </p>

          <div style={{ marginTop: 28 }}>
            <div style={{ ...styles.sectionLabel, marginBottom: 12 }}>{titles[estimateSubstep]}</div>
            <p style={{ ...styles.body, fontSize: 14, marginTop: 0, marginBottom: 14 }}>{descriptions[estimateSubstep]}</p>
            {renderEstimateOptions()}
          </div>

          {!isMobile && (
            <div style={{ ...styles.goldCard, marginTop: 26, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#E4E4E7" }}>Current Planning Range</div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  marginTop: 10,
                  transform: pricePulse ? "scale(1.02)" : "scale(1)",
                  opacity: pricePulse ? 0.92 : 1,
                  transition: "transform 0.24s ease, opacity 0.24s ease"
                }}
              >
                {getEstimateDisplay("estimate")}
              </div>
              <div style={{ fontSize: 14, color: colors.muted, marginTop: 8, lineHeight: 1.6 }}>
                {getEstimateHelperText()}
              </div>
            </div>
          )}

          {!isMobile && (
            <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
              <button
                style={styles.primaryButton}
                onClick={() => {
                  if (!hasSelectionForCurrentEstimateStep()) {
                    promptForMissingSelection();
                  } else if (estimateSubstep < 2) {
                    setEstimateSubstep((estimateSubstep + 1) as EstimateSubstep);
                  } else {
                    setIsCalculating(true);
                    window.setTimeout(() => {
                      setIsCalculating(false);
                      setStep("results");
                    }, 900);
                  }
                }}
                {...buttonHoverProps()}
              >
                {estimateSubstep < 2 ? "Continue" : "Continue to Results"}
              </button>
              <button
                style={styles.secondaryButton}
                onClick={() => {
                  if (estimateSubstep > 0) setEstimateSubstep((estimateSubstep - 1) as EstimateSubstep);
                  else setStep("home");
                }}
                {...buttonHoverProps()}
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderResults() {
  const urgencyItems = [
    "Review slots are intentionally limited each week to keep projects moving quickly.",
    "Clients who delay scheduling usually lose momentum and restart the process later.",
    "The next step is simply to confirm fit and scope before a final proposal is prepared.",
  ];

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto" }}>
      <div style={styles.stepBar}>
        <span>Step 2 of 3</span>
        <span>Now the number does the heavy lifting.</span>
        {progressBar()}
      </div>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={styles.sectionLabel}>Step 2 · Results Experience</div>
        <h2 style={styles.h2}>Your Project Estimate Is Ready</h2>
        <p style={{ ...styles.body, maxWidth: 760, margin: "14px auto 0" }}>
          This is not the calculator anymore. This is the decision screen — where the range is framed, the project fit is reinforced, and the next step becomes obvious.
        </p>
      </div>

      <div style={styles.card} {...cardHoverProps()}>
        <div style={{ ...styles.goldCard, textAlign: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.muted, marginBottom: 8 }}>
            Planning Range Confirmed
          </div>
          <div style={{ fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: "#E4E4E7" }}>
            Estimated Investment
          </div>
          <div
            style={{
              fontSize: isMobile ? 38 : 60,
              fontWeight: 700,
              lineHeight: 1.06,
              marginTop: 12,
              transform: pricePulse ? "scale(1.018)" : "scale(1)",
              opacity: pricePulse ? 0.94 : 1,
              transition: "transform 0.24s ease, opacity 0.24s ease",
            }}
          >
            {getEstimateDisplay("estimate")}
          </div>
          <div style={{ fontSize: 14, color: colors.muted, marginTop: 10, lineHeight: 1.6 }}>
            This is a general planning range based on the selections made in the estimate builder. The purpose here is to move from curiosity to commitment.
          </div>
        </div>

        <div style={styles.summaryGrid}>
          {[["Project", project], ["Finish", finish], ["Client Fit", "Premium Match"]].map(([label, value]) => (
            <div key={label} style={styles.summaryCard}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.2em", color: "#71717A" }}>
                {label}
              </div>
              <div style={{ marginTop: 8, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          <div style={{ ...styles.goldCard, textAlign: "center", padding: isMobile ? 16 : 18 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#E4E4E7" }}>
              Next Step: Project Review
            </div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, marginTop: 8 }}>
              Schedule the review while the project scope is fresh.
            </div>
            <div style={{ fontSize: 14, color: colors.muted, marginTop: 8, lineHeight: 1.6 }}>
              This keeps momentum high, confirms fit faster, and moves the right prospects toward a real conversation.
            </div>
          </div>
        </div>

        <div style={{ ...styles.twoColumn, marginTop: 22 }}>
          <div
            style={{ ...styles.card, padding: isMobile ? 18 : 22, background: "rgba(0,0,0,0.28)" }}
            {...cardHoverProps()}
          >
            <div style={{ ...styles.sectionLabel, marginBottom: 14 }}>Personal Project Review Based on Your Selections</div>
            <div
              style={{
                borderRadius: 22,
                overflow: "hidden",
                border: `1px solid ${colors.border}`,
                background: "#000",
                aspectRatio: "1 / 1",
                position: "relative"
              }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#000", cursor: "pointer" }}
                onClick={(e) => {
                  const video = e.currentTarget;
                  video.loop = false;
                  video.muted = false;
                  video.currentTime = 0;
                  video.play();
                }}
              >
                <source src="/harristhankyou.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  bottom: 12,
                  background: "rgba(0,0,0,0.55)",
                  color: "#FFFFFF",
                  fontSize: 12,
                  padding: "8px 10px",
                  borderRadius: 999,
                  letterSpacing: "0.02em",
                  pointerEvents: "none"
                }}
              >
                Tap for sound
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, padding: isMobile ? 18 : 22 }} {...cardHoverProps()}>
            <div style={styles.sectionLabel}>Why This Converts</div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                "Pricing is introduced before the call",
                "Low-budget leads self-filter",
                "The business feels premium and structured",
              ].map((item) => (
                <div key={item} style={styles.chip}>{item}</div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={styles.sectionLabel}>Urgency & Momentum</div>
              <div style={{ display: "grid", gap: 10 }}>
                {urgencyItems.map((item) => (
                  <div key={item} style={{ ...styles.chip, fontSize: 13, lineHeight: 1.6 }}>{item}</div>
                ))}
              </div>
            </div>

            {!isMobile && (
              <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
                <button style={styles.primaryButton} onClick={() => setStep("booking")} {...buttonHoverProps()}>
                  Schedule Project Review
                </button>
                <button
                  style={styles.secondaryButton}
                  onClick={() => {
                    setEstimateSubstep(2);
                    setStep("estimate");
                  }}
                  {...buttonHoverProps()}
                >
                  Edit Estimate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderBooking() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={styles.stepBar}>
        <span>Step 3 of 3</span>
        <span>Final step: turn interest into a scheduled review.</span>
        {progressBar()}
      </div>

      <div style={styles.card} {...cardHoverProps()}>
        <div style={{ textAlign: "center" }}>
          <div style={styles.sectionLabel}>Step 3 · Booking</div>
          <h2 style={styles.h2}>Schedule Your Project Review</h2>
          <p style={{ ...styles.body, maxWidth: 560, margin: "14px auto 0" }}>
            Qualified prospects move from estimate to conversation here. Clean, simple, and no chaos.
          </p>
        </div>

        <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
          <input style={styles.input} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input style={styles.input} placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div style={{ ...styles.goldCard, marginTop: 20 }}>
          <div style={styles.sectionLabel}>Project Review Summary</div>
          <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700 }}>{project} · {finish}</div>
          <div style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
            Planning range: {getEstimateDisplay("estimate")}
          </div>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          <div style={{ ...styles.chip, textAlign: "center" }}>
            Project reviews are limited to qualified opportunities so each client receives focused attention.
          </div>
          <div style={{ ...styles.chip, textAlign: "center" }}>
            Submitting now helps secure the next available review window before scheduling fills.
          </div>
        </div>

        {!isMobile && (
          <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
            <button style={styles.primaryButton} {...buttonHoverProps()}>
              Confirm Appointment Request
            </button>
            <button style={styles.secondaryButton} onClick={() => setStep("results")} {...buttonHoverProps()}>
              Back to Results
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", color: "#71717A", fontSize: 14, marginTop: 16, lineHeight: 1.7 }}>
          Only clients aligned with project scope and investment level are scheduled.
        </p>
        <div style={{ fontSize: 13, color: "#A1A1AA", textAlign: "center", marginTop: 10 }}>
          No obligation. This is simply to review your project via phone call and confirm details.
        </div>
      </div>
    </div>
  );
}

const renderStep = () => {
    if (step === "home") return renderHome();
    if (step === "estimate") return renderEstimate();
    if (step === "results") return renderResults();
    return renderBooking();
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1.02); }
            100% { opacity: 0.6; transform: scale(0.98); }
          }
        `}
      </style>
      {isCalculating && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11,11,11,0.96)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            flexDirection: "column",
            color: "#E4E4E7"
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 14,
              opacity: 0.8
            }}
          >
            Analyzing Project Scope
          </div>

          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#C9A96E",
              animation: "pulse 1.2s ease-in-out infinite"
            }}
          >
            Calculating...
          </div>
        </div>
      )}
      <div style={styles.shell}>
        <div style={styles.topBar}>
          <div>
            <div style={styles.eyebrow}>Harris Contracting</div>
            <div style={styles.brandTitle}>Franchise-Level Client Experience</div>
          </div>
          {step === "home" && !isMobile && (
            <button
              type="button"
              style={{
                ...styles.primaryButton,
                width: isMobile ? "100%" : "auto",
                alignSelf: isMobile ? "stretch" : "auto",
                position: "relative",
                zIndex: 10,
              }}
              onClick={() => {
                setProject(null);
                setSize(null);
                setFinish(null);
                setEstimateSubstep(0);
                setStep("estimate");
              }}
              {...buttonHoverProps()}
            >
              Start Estimate
            </button>
          )}
        </div>

        <div key={`${step}-${estimateSubstep}`} style={{ transition: "all 0.3s ease", transform: "translateY(0px)" }}>
          {renderStep()}
        </div>
      </div>

      {isMobile && step !== "home" && (
        <div style={styles.sticky}>
          {step === "estimate" && (
           <div
  style={{
    ...styles.goldCard,
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  }}
>
              <div
  style={{
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#E4E4E7",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: pricePulse ? 0.6 : 1,
    transform: pricePulse ? "translateY(-2px)" : "translateY(0px)",
    transition: "all 0.25s ease"
  }}
>
  <span style={{ textAlign: "center" }}>Current Planning Range</span>
</div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  marginTop: 6,
                  textAlign: "center",
                  transform: pricePulse ? "scale(1.04)" : "scale(1)",
                  opacity: pricePulse ? 0.95 : 1,
                  textShadow: pricePulse
                    ? "0 0 10px rgba(201,169,110,0.35), 0 0 20px rgba(201,169,110,0.25)"
                    : "0 0 0px rgba(0,0,0,0)",
                  transition: "transform 0.25s ease, opacity 0.25s ease, text-shadow 0.3s ease"
                }}
              >
                {getEstimateDisplay("estimate")}
              </div>
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 6, textAlign: "center" }}>
                {estimateSubstep === 0
                  ? (project ? `${project} · Broad Range` : "Choose project type")
                  : estimateSubstep === 1
                    ? (project && size ? `${project} · ${size}` : (project ? `${project} · Broad Range` : "Choose project type"))
                    : (project && size && finish ? `${project} · ${size} · ${finish}` : (project && size ? `${project} · ${size}` : "Choose finish level"))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{ ...styles.secondaryButton, width: "40%" }}
              onClick={() => {
                if (step === "estimate") {
                  if (estimateSubstep > 0) setEstimateSubstep((estimateSubstep - 1) as EstimateSubstep);
                  else setStep("home");
                } else if (step === "results") {
                  setEstimateSubstep(2);
                  setStep("estimate");
                } else if (step === "booking") {
                  setStep("results");
                }
              }}
            >
              {step === "estimate" ? "Back" : step === "results" ? "Edit Estimate" : "Back to Results"}
            </button>
            <button
              style={{ ...styles.primaryButton, flex: 1 }}
              onClick={() => {
                if (step === "estimate") {
                  if (!hasSelectionForCurrentEstimateStep()) {
                    promptForMissingSelection();
                  } else if (estimateSubstep < 2) setEstimateSubstep((estimateSubstep + 1) as EstimateSubstep);
                  else {
                    setIsCalculating(true);
                    window.setTimeout(() => {
                      setIsCalculating(false);
                      setStep("results");
                    }, 900);
                  }
                } else if (step === "results") {
                  setStep("booking");
                } else {
                  console.log("Confirm Appointment Request");
                }
              }}
            >
              {step === "estimate" ? (estimateSubstep < 2 ? "Continue" : "Continue to Results") : step === "results" ? "Schedule Project Review" : "Confirm Appointment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
