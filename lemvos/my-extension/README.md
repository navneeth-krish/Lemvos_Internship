# OpenBridge Foxglove Extension

This extension integrates [OpenBridge Web Components](https://github.com/Ocean-Industries-Concept-Lab/openbridge-webcomponents) into [Foxglove Studio](https://foxglove.dev/).

## Features

-   **OpenBridge Design System**: Uses the official `night` theme and components.
-   **Integrated Components**:
    1.  **Top Bar**: Official `ObcTopBar`.
    2.  **Navigation Menu**: Official `ObcNavigationMenu`.
    3.  **Azimuth Thruster**: Official `obc-azimuth-thruster` visualization.
    4.  **Automation Control**: Official `obc-automation-button`.
    5.  **Pitch & Roll**: Custom implementation of an artificial horizon (official component unavailable in current package version).
-   **Data Binding**: Subscribes to Foxglove topics for real-time updates.
-   **Demo Mode**: Automatically animates instruments if no real data is present.
-   **Unit Switching**: Toggle between Degrees and Radians.

## Build & Install

### Prerequisites
-   Node.js (v16+)
-   npm

### Steps
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Build the extension**:
    ```bash
    npm run build
    ```
3.  **Install into Foxglove**:
    ```bash
    foxglove-extension install
    ```
    *Or manually load the `dist` folder in Foxglove Studio (Settings > Extensions).*

## Topics

The panel subscribes to the following topics:
-   `/navigation/thruster/angle` (`{ angle: number }`)
-   `/navigation/thruster/rpm` (`{ rpm: number }`)
-   `/automation/state` (`{ enabled: boolean }`)
-   `/vessel/attitude` (`{ pitch: number, roll: number }`)

## Usage

1.  Open the "OpenBridge Demo Panel" in Foxglove Studio.
2.  **Demo Mode**: By default, the panel runs in Demo Mode. Click "Demo Mode: ON" to switch to Live Data mode.
3.  **Units**: Click the "Units" button to toggle between Degrees/Radians.
4.  **Menu**: Click the Apps button (grid icon) in the top right to toggle the navigation menu.
