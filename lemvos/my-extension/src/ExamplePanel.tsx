import { PanelExtensionContext } from "@foxglove/studio";
import { ObcTopBar } from "@oicl/openbridge-webcomponents-react/components/top-bar/top-bar";
import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

// Import the web components directly
import "@oicl/openbridge-webcomponents/dist/automation/automation-button/automation-button.js";
import "@oicl/openbridge-webcomponents/dist/navigation-instruments/azimuth-thruster/azimuth-thruster.js";
import "@oicl/openbridge-webcomponents/dist/icons/icon-propulsion-azimuth-thruster.js";
import "@oicl/openbridge-webcomponents/dist/icons/icon-command-autopilot.js";
import "@oicl/openbridge-webcomponents/src/palettes/variables.css";
import "./App.css";
import { ObcNavigationMenu } from "./components/navigation_menu";

// Declare the custom elements for TypeScript
interface CustomElement extends HTMLElement {
  angle: number;
  value?: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "obc-automation-button": {
        label?: string;
        className?: string;
      };
      "obc-azimuth-thruster": {
        angle?: number;
        value?: number;
        ref?: React.Ref<CustomElement>;
        className?: string;
      };
    }
  }
}

// Topics we want to subscribe to
const topics = [
  "/navigation/thruster/angle",
  "/navigation/thruster/rpm",
  "/automation/state",
  "/vessel/attitude",
];

// Message Interfaces
interface ThrusterMessage {
  angle?: number;
  rpm?: number;
}

interface AutomationMessage {
  enabled?: boolean;
}

interface AttitudeMessage {
  pitch?: number;
  roll?: number;
}

// ----------------------------------------------------------------------
// 1. PitchRollIndicator Component (Custom Implementation)
// ----------------------------------------------------------------------
function PitchRollIndicator({
  pitch,
  roll,
  useRadians,
}: {
  pitch: number;
  roll: number;
  useRadians: boolean;
}) {
  const displayPitch = useRadians ? (pitch * Math.PI) / 180 : pitch;
  const displayRoll = useRadians ? (roll * Math.PI) / 180 : roll;
  const unit = useRadians ? "rad" : "°";

  return (
    <div className="pitch-roll-container">
      <div className="attitude-indicator">
        {/* The horizon line moves up/down for pitch and rotates for roll */}
        <div
          className="horizon-line"
          style={{
            transform: `rotate(${-roll}deg) translateY(${pitch * 2}px)`,
          }}
        />
        <div className="center-marker" />
        {/* Artificial pitch scale markers */}
        {[-30, -20, -10, 10, 20, 30].map((angle) => (
          <div
            key={angle}
            className="pitch-marker"
            style={{
              transform: `translate(-50%, ${-angle * 2}px) rotate(${-roll}deg)`,
              transformOrigin: "center center",
            }}
          />
        ))}
      </div>
      <div className="value-display">
        <span>
          P: {displayPitch.toFixed(useRadians ? 2 : 1)}
          {unit}
        </span>
        <span>
          R: {displayRoll.toFixed(useRadians ? 2 : 1)}
          {unit}
        </span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Panel
// ----------------------------------------------------------------------
function OpenBridgePanel({ context }: { context: PanelExtensionContext }) {
  // UI State
  const [showBrillianceMenu, setShowBrillianceMenu] = useState(false);
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [useRadians, setUseRadians] = useState(false); // Bonus: Unit Switching

  // Data State
  const [thrusterAngle, setThrusterAngle] = useState(0);
  const [thrusterRpm, setThrusterRpm] = useState(0);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);

  // Refs
  const thrusterRef = useRef<CustomElement | null>(null);

  // 1. Initial Setup
  useEffect(() => {
    document.documentElement.setAttribute("data-obc-theme", "night");

    // Subscribe to topics
    context.subscribe(topics.map((topic) => ({ topic })));

    // Handle incoming messages
    context.onRender = (renderState, done) => {
      if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        setDemoMode(false); // Auto-disable demo mode on real data

        renderState.currentFrame.forEach((msg) => {
          if (msg.topic === "/navigation/thruster/angle") {
            const data = msg.message as ThrusterMessage;
            if (data.angle != null) {
              setThrusterAngle(data.angle);
            }
          } else if (msg.topic === "/navigation/thruster/rpm") {
            const data = msg.message as ThrusterMessage;
            if (data.rpm != null) {
              setThrusterRpm(data.rpm);
            }
          } else if (msg.topic === "/automation/state") {
            const data = msg.message as AutomationMessage;
            if (data.enabled != null) {
              setAutomationEnabled(data.enabled);
            }
          } else if (msg.topic === "/vessel/attitude") {
            const data = msg.message as AttitudeMessage;
            if (data.pitch != null) {
              setPitch(data.pitch);
            }
            if (data.roll != null) {
              setRoll(data.roll);
            }
          }
        });
      }
      done();
    };

    context.watch("topics");
    context.watch("currentFrame");
  }, [context]);

  // 2. Demo Mode Animation (Bonus)
  useEffect(() => {
    if (!demoMode) {
      return;
    }

    let animationFrame: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      // Thruster: Rotate continuously
      setThrusterAngle((elapsed * 20) % 360);
      setThrusterRpm(50 + Math.sin(elapsed) * 30);

      // Pitch & Roll: Sine wave simulation
      setPitch(Math.sin(elapsed * 0.5) * 15); // +/- 15 degrees
      setRoll(Math.cos(elapsed * 0.3) * 20); // +/- 20 degrees

      // Automation: Toggle every 5 seconds
      setAutomationEnabled(Math.floor(elapsed / 5) % 2 === 0);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [demoMode]);

  // 3. Update Web Component Properties directly
  useEffect(() => {
    if (thrusterRef.current) {
      // Pass radians/degrees based on component requirement (assuming web component takes degrees usually, or radians)
      // Standard OBC usually expects degrees for visual rotation
      thrusterRef.current.angle = thrusterAngle;
    }
  }, [thrusterAngle]);

  // Handlers
  const handleDimmingButtonClicked = () => {
    setShowBrillianceMenu(!showBrillianceMenu);
  };
  const handleAppsButtonClicked = () => {
    setShowNavigationMenu(!showNavigationMenu);
  };
  const toggleUnits = () => {
    setUseRadians(!useRadians);
  };
  const toggleDemoMOde = () => {
    setDemoMode(!demoMode);
  };

  const formatAngle = (angle: number) => {
    if (useRadians) {
      return `${((angle * Math.PI) / 180).toFixed(2)} rad`;
    }
    return `${Math.round(angle)}°`;
  };

  return (
    <div className="openbridge-panel">
      {/* 4. Topbar Component */}
      <header>
        <ObcTopBar
          appTitle="OpenBridge"
          pageName="Demo Panel"
          showDimmingButton
          showAppsButton
          onDimmingButtonClicked={handleDimmingButtonClicked}
          onAppsButtonClicked={handleAppsButtonClicked}
        />
      </header>

      {/* 5. Navigation Menu Component */}
      {showNavigationMenu && (
        <div className="navigation-menu-container">
          <ObcNavigationMenu />
        </div>
      )}

      <main className="panel-content">
        <div className="control-panel">
          <div className="control-group">
            <button
              className={`control-button ${demoMode ? "active" : ""}`}
              onClick={toggleDemoMOde}
            >
              {demoMode ? "🎬 Demo Mode: ON" : "📡 Live Data Mode"}
            </button>
            <button className="control-button" onClick={toggleUnits}>
              Units: {useRadians ? "Radians" : "Degrees"}
            </button>
          </div>
          {demoMode && <p className="demo-notice">📊 Animating all instruments...</p>}
        </div>

        <div className="components-demo">
          {/* Section: Pitch & Roll (Custom Component) */}
          <section className="info-section">
            <h3>PLANES: Pitch & Roll</h3>
            <div className="component-wrapper">
              <PitchRollIndicator pitch={pitch} roll={roll} useRadians={useRadians} />
              <p className="component-description">Custom implementation of Attitude Indicator</p>
            </div>
          </section>

          {/* Section: Azimuth Thruster (Web Component) */}
          <section className="thruster-section">
            <h3>PROPULSION: Azimuth Thruster</h3>
            <div className="component-wrapper">
              <div className="obc-size-large">
                <obc-azimuth-thruster ref={thrusterRef} angle={thrusterAngle} />
              </div>
              <div className="thruster-data">
                <div className="data-item">
                  <span className="data-label">Angle</span>
                  <span className="data-value">{formatAngle(thrusterAngle)}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">RPM</span>
                  <span className="data-value">{Math.round(thrusterRpm)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Automation (Web Component) */}
          <section className="automation-section">
            <h3>AUTOMATION</h3>
            <div className="component-wrapper">
              <div className="obc-size-large">
                <obc-automation-button
                  label={automationEnabled ? "Auto Pilot: ON" : "Auto Pilot: OFF"}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export function initOpenBridgePanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<OpenBridgePanel context={context} />);

  return () => {
    root.unmount();
  };
}
