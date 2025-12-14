import { PanelExtensionContext } from "@foxglove/studio";
import { ObcTopBar } from "@oicl/openbridge-webcomponents-react/components/top-bar/top-bar";
import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

// Import the web components directly
import "@oicl/openbridge-webcomponents/dist/automation/automation-button/automation-button.js";
import "@oicl/openbridge-webcomponents/dist/navigation-instruments/azimuth-thruster/azimuth-thruster.js";
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

// Type definitions for message data
interface ThrusterMessage {
  angle?: number;
  rpm?: number;
}

interface AutomationMessage {
  enabled?: boolean;
  mode?: string;
}

// Topics we want to subscribe to
const topics = ["/navigation/thruster/angle", "/navigation/thruster/rpm", "/automation/state"];

function OpenBridgePanel({ context }: { context: PanelExtensionContext }) {
  const [showBrillianceMenu, setShowBrillianceMenu] = useState(false);
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);

  // Component state
  const [thrusterAngle, setThrusterAngle] = useState(0);
  const [thrusterRpm, setThrusterRpm] = useState(0);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [demoMode, setDemoMode] = useState(true); // Start in demo mode
  const [useRadians, setUseRadians] = useState(false); // Unit switching

  // Refs for direct DOM manipulation
  const thrusterRef = useRef<CustomElement | null>(null);

  // Set the OpenBridge theme on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-obc-theme", "night");

    // Subscribe to topics using the new API
    context.subscribe(
      topics.map((topic) => ({
        topic,
      })),
    );

    // Watch for render events
    context.onRender = (renderState, done) => {
      // Check if we have any messages
      if (renderState.currentFrame != null && renderState.currentFrame.length > 0) {
        setDemoMode(false); // Switch off demo mode when real data arrives

        renderState.currentFrame.forEach((message) => {
          const topic = message.topic;
          const data = message.message;

          if (topic === "/navigation/thruster/angle") {
            const thrusterData = data as ThrusterMessage;
            setThrusterAngle(thrusterData.angle ?? 0);
          } else if (topic === "/navigation/thruster/rpm") {
            const thrusterData = data as ThrusterMessage;
            setThrusterRpm(thrusterData.rpm ?? 0);
          } else if (topic === "/automation/state") {
            const automationData = data as AutomationMessage;
            setAutomationEnabled(automationData.enabled ?? false);
          }
        });
      }

      done();
    };

    // Set initial state
    context.watch("topics");
    context.watch("currentFrame");
  }, [context]);

  // Demo mode: Animate instruments when no real data is present
  useEffect(() => {
    if (!demoMode) {
      return;
    }

    let animationFrame: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // seconds

      // Simulate smooth thruster rotation
      const newAngle = (elapsed * 20) % 360; // 20 degrees per second
      setThrusterAngle(newAngle);

      // Simulate RPM with sine wave
      const newRpm = 50 + Math.sin(elapsed) * 30;
      setThrusterRpm(Math.max(0, newRpm));

      // Toggle automation every 5 seconds
      setAutomationEnabled(Math.floor(elapsed / 5) % 2 === 0);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame !== 0) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [demoMode]);

  // Update thruster element directly when angle changes
  useEffect(() => {
    if (thrusterRef.current != null) {
      thrusterRef.current.angle = useRadians ? (thrusterAngle * Math.PI) / 180 : thrusterAngle;
    }
  }, [thrusterAngle, useRadians]);

  const handleDimmingButtonClicked = () => {
    setShowBrillianceMenu(!showBrillianceMenu);
  };

  const handleAppsButtonClicked = () => {
    setShowNavigationMenu(!showNavigationMenu);
  };

  const toggleUnits = () => {
    setUseRadians(!useRadians);
  };

  const toggleDemoMode = () => {
    setDemoMode(!demoMode);
  };

  // Format angle based on unit preference
  const formatAngle = (angle: number): string => {
    if (useRadians) {
      return `${((angle * Math.PI) / 180).toFixed(2)} rad`;
    }
    return `${Math.round(angle)}°`;
  };

  return (
    <div className="openbridge-panel">
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

      {showNavigationMenu && (
        <div className="navigation-menu-container">
          <ObcNavigationMenu />
        </div>
      )}

      <main className="panel-content">
        {/* Control Panel */}
        <div className="control-panel">
          <div className="control-group">
            <button
              className={`control-button ${demoMode ? "active" : ""}`}
              onClick={toggleDemoMode}
            >
              {demoMode ? "🎬 Demo Mode: ON" : "📡 Live Data Mode"}
            </button>
            <button className="control-button" onClick={toggleUnits}>
              Units: {useRadians ? "Radians" : "Degrees"}
            </button>
          </div>
          {demoMode && (
            <p className="demo-notice">
              📊 Demo mode active - Instruments are being animated automatically
            </p>
          )}
        </div>

        {/* Components Demo */}
        <div className="components-demo">
          {/* Automation Control Section */}
          <section className="automation-section">
            <h3>⚙️ Automation Control</h3>
            <div className="component-wrapper">
              <div className="obc-size-large">
                <obc-automation-button
                  label={automationEnabled ? "Auto Pilot: ON" : "Auto Pilot: OFF"}
                />
              </div>
              <p className="component-description">
                Status: {automationEnabled ? "✅ Enabled" : "❌ Disabled"}
                {demoMode && " (Toggling every 5s)"}
              </p>
            </div>
          </section>

          {/* Azimuth Thruster Section */}
          <section className="thruster-section">
            <h3>🚢 Azimuth Thruster</h3>
            <div className="component-wrapper">
              <div className="obc-size-large">
                <obc-azimuth-thruster
                  ref={thrusterRef}
                  angle={useRadians ? (thrusterAngle * Math.PI) / 180 : thrusterAngle}
                />
              </div>
              <div className="thruster-data">
                <div className="data-item">
                  <span className="data-label">Angle:</span>
                  <span className="data-value">{formatAngle(thrusterAngle)}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">RPM:</span>
                  <span className="data-value">{Math.round(thrusterRpm)}</span>
                </div>
              </div>
            </div>
            <div className="controls">
              <label>
                Manual RPM Control:
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={thrusterRpm}
                  disabled={demoMode}
                  onChange={(e) => {
                    setThrusterRpm(Number(e.target.value));
                  }}
                />
                {Math.round(thrusterRpm)}%
              </label>
              {demoMode && (
                <p className="control-note">Disable demo mode to manually control RPM</p>
              )}
            </div>
          </section>

          {/* Topic Subscriptions Info */}
          <section className="info-section">
            <h3>📡 Topic Subscriptions</h3>
            <div className="topics-list">
              {topics.map((topic) => (
                <div key={topic} className="topic-item">
                  <span className="topic-name">{topic}</span>
                  <span className={`topic-status ${demoMode ? "simulated" : "active"}`}>
                    {demoMode ? "Simulated" : "Subscribed"}
                  </span>
                </div>
              ))}
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
// import { PanelExtensionContext, MessageEvent } from "@foxglove/studio";
// import { ObcTopBar } from "@oicl/openbridge-webcomponents-react/components/top-bar/top-bar";
// import { useEffect, useLayoutEffect, useState } from "react";
// import { createRoot } from "react-dom/client";
// import "@oicl/openbridge-webcomponents/src/palettes/variables.css";
// import "./App.css";

// // Type definitions for our data
// type AttitudeData = {
//   pitch: number;
//   roll: number;
// };

// type ThrusterData = {
//   angle: number;
//   rpm: number;
// };

// type VesselState = {
//   attitude: AttitudeData;
//   thruster1: ThrusterData;
//   thruster2: ThrusterData;
// };

// // Type for incoming message data
// type AttitudeMessage = {
//   pitch?: number;
//   roll?: number;
// };

// type ThrusterMessage = {
//   angle?: number;
//   rpm?: number;
// };

// // OpenBridge component wrappers
// function PitchRollIndicator({
//   pitch,
//   roll,
//   useRadians,
// }: {
//   pitch: number;
//   roll: number;
//   useRadians: boolean;
// }) {
//   const displayPitch = useRadians ? pitch * (Math.PI / 180) : pitch;
//   const displayRoll = useRadians ? roll * (Math.PI / 180) : roll;
//   const unit = useRadians ? "rad" : "°";

//   return (
//     <div className="pitch-roll-container">
//       <div className="attitude-indicator">
//         <div
//           className="horizon-line"
//           style={{
//             transform: `rotate(${roll}deg) translateY(${pitch * 2}px)`,
//           }}
//         />
//         <div className="center-marker" />
//         {/* Pitch scale markers */}
//         {[-30, -20, -10, 0, 10, 20, 30].map((angle) => (
//           <div
//             key={angle}
//             className="pitch-marker"
//             style={{ transform: `translateY(${-angle * 2}px)` }}
//           />
//         ))}
//       </div>
//       <div className="value-display">
//         <span>
//           P: {displayPitch.toFixed(useRadians ? 3 : 1)}
//           {unit}
//         </span>
//         <span>
//           R: {displayRoll.toFixed(useRadians ? 3 : 1)}
//           {unit}
//         </span>
//       </div>
//     </div>
//   );
// }

// function AzimuthThruster({
//   angle,
//   rpm,
//   id,
//   useRadians,
// }: {
//   angle: number;
//   rpm: number;
//   id: number;
//   useRadians: boolean;
// }) {
//   const displayAngle = useRadians ? angle * (Math.PI / 180) : angle;
//   const unit = useRadians ? "rad" : "°";
//   const normalizedRpm = Math.min(Math.max(rpm / 1000, 0), 1);

//   return (
//     <div className="azimuth-thruster">
//       <h4>Thruster {id}</h4>
//       <div className="thruster-visual">
//         <svg className="rpm-ring">
//           <circle
//             cx="64"
//             cy="64"
//             r="58"
//             fill="none"
//             stroke="#3b82f6"
//             strokeWidth="8"
//             strokeDasharray={`${normalizedRpm * 364} 364`}
//           />
//         </svg>
//         <div className="direction-arrow" style={{ transform: `rotate(${angle}deg)` }} />
//       </div>
//       <div className="thruster-data">
//         <div>
//           Angle: {displayAngle.toFixed(useRadians ? 3 : 1)}
//           {unit}
//         </div>
//         <div>RPM: {rpm.toFixed(0)}</div>
//         <div>Power: {(normalizedRpm * 100).toFixed(0)}%</div>
//       </div>
//     </div>
//   );
// }

// // Main Panel Component
// function OpenBridgePanel({ context }: { context: PanelExtensionContext }) {
//   const [messages, setMessages] = useState<readonly MessageEvent[]>([]);
//   const [vesselState, setVesselState] = useState<VesselState>({
//     attitude: { pitch: 0, roll: 0 },
//     thruster1: { angle: 0, rpm: 0 },
//     thruster2: { angle: 180, rpm: 0 },
//   });
//   const [demoMode, setDemoMode] = useState(true);
//   const [isAnimating, setIsAnimating] = useState(true);
//   const [useRadians, setUseRadians] = useState(false);
//   const [showBrillianceMenu, setShowBrillianceMenu] = useState(false);

//   const handleDimmingButtonClicked = () => {
//     setShowBrillianceMenu(!showBrillianceMenu);
//   };
//   // Subscribe to topics
//   useLayoutEffect(() => {
//     context.subscribe([
//       { topic: "/vessel/attitude" },
//       { topic: "/vessel/thrusters/1" },
//       { topic: "/vessel/thrusters/2" },
//     ]);
//   }, [context]);

//   // Handle incoming messages
//   useEffect(() => {
//     context.onRender = (renderState, done) => {
//       setMessages(renderState.currentFrame ?? []);

//       // Check if we're receiving real data
//       if (renderState.currentFrame != null && renderState.currentFrame.length > 0) {
//         setDemoMode(false);
//       }

//       done();
//     };

//     context.watch("topics");
//     context.watch("currentFrame");
//   }, [context]);

//   // Process messages from topics
//   useEffect(() => {
//     if (messages.length === 0) {
//       return;
//     }

//     messages.forEach((msg) => {
//       switch (msg.topic) {
//         case "/vessel/attitude": {
//           const data = msg.message as AttitudeMessage;
//           if (data.pitch != null && data.roll != null) {
//             setVesselState((prev) => ({
//               ...prev,
//               attitude: { pitch: data.pitch!, roll: data.roll! },
//             }));
//           }
//           break;
//         }

//         case "/vessel/thrusters/1": {
//           const data = msg.message as ThrusterMessage;
//           if (data.angle != null && data.rpm != null) {
//             setVesselState((prev) => ({
//               ...prev,
//               thruster1: { angle: data.angle!, rpm: data.rpm! },
//             }));
//           }
//           break;
//         }

//         case "/vessel/thrusters/2": {
//           const data = msg.message as ThrusterMessage;
//           if (data.angle != null && data.rpm != null) {
//             setVesselState((prev) => ({
//               ...prev,
//               thruster2: { angle: data.angle!, rpm: data.rpm! },
//             }));
//           }
//           break;
//         }
//       }
//     });
//   }, [messages]);

//   // Demo mode animation
//   useEffect(() => {
//     if (!demoMode || !isAnimating) {
//       return;
//     }

//     const interval = setInterval(() => {
//       const time = Date.now() / 1000;

//       setVesselState({
//         attitude: {
//           pitch: Math.sin(time * 0.5) * 8,
//           roll: Math.cos(time * 0.3) * 10,
//         },
//         thruster1: {
//           angle: Math.sin(time * 0.4) * 45 + 45,
//           rpm: (Math.sin(time * 0.6) * 0.5 + 0.5) * 800 + 200,
//         },
//         thruster2: {
//           angle: Math.cos(time * 0.5) * 60 + 180,
//           rpm: (Math.cos(time * 0.7) * 0.5 + 0.5) * 900 + 100,
//         },
//       });
//     }, 50);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [demoMode, isAnimating]);

//   return (
//     <div className="openbridge-panel">
//       <header>
//         <ObcTopBar
//           appTitle="React"
//           pageName="Demo"
//           showDimmingButton
//           showAppsButton
//           onDimmingButtonClicked={handleDimmingButtonClicked}
//         />
//       </header>
//       {/* Header */}
//       <div className="panel-header">
//         <h2>OpenBridge Marine Control</h2>
//         <div className="status-indicator">
//           <span className={demoMode ? "demo" : "live"}>{demoMode ? "Demo Mode" : "Live Data"}</span>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="panel-controls">
//         <button
//           onClick={() => {
//             setIsAnimating(!isAnimating);
//           }}
//         >
//           {isAnimating ? "Pause" : "Play"}
//         </button>
//         <button
//           onClick={() => {
//             setVesselState({
//               attitude: { pitch: 0, roll: 0 },
//               thruster1: { angle: 0, rpm: 0 },
//               thruster2: { angle: 180, rpm: 0 },
//             });
//           }}
//         >
//           Reset
//         </button>
//         <label>
//           <input
//             type="checkbox"
//             checked={useRadians}
//             onChange={(e) => {
//               setUseRadians(e.target.checked);
//             }}
//           />
//           Use Radians
//         </label>
//       </div>

//       {/* Main content */}
//       <div className="panel-content">
//         <div className="instrument-section">
//           <h3>Attitude Indicator</h3>
//           <PitchRollIndicator
//             pitch={vesselState.attitude.pitch}
//             roll={vesselState.attitude.roll}
//             useRadians={useRadians}
//           />
//         </div>

//         <div className="instrument-section">
//           <h3>Azimuth Thrusters</h3>
//           <div className="thrusters-container">
//             <AzimuthThruster
//               angle={vesselState.thruster1.angle}
//               rpm={vesselState.thruster1.rpm}
//               id={1}
//               useRadians={useRadians}
//             />
//             <AzimuthThruster
//               angle={vesselState.thruster2.angle}
//               rpm={vesselState.thruster2.rpm}
//               id={2}
//               useRadians={useRadians}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Topic info */}
//       <div className="topic-info">
//         <h4>Subscribed Topics:</h4>
//         <ul>
//           <li>/vessel/attitude</li>
//           <li>/vessel/thrusters/1</li>
//           <li>/vessel/thrusters/2</li>
//         </ul>
//         {demoMode && <p className="warning">⚠️ No live data - using simulated values</p>}
//       </div>
//     </div>
//   );
// }

// export function initOpenBridgePanel(context: PanelExtensionContext): () => void {
//   const root = createRoot(context.panelElement);
//   root.render(<OpenBridgePanel context={context} />);

//   return () => {
//     root.unmount();
//   };
// }
