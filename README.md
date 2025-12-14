# Lemvos_Internship

# OpenBridge Foxglove Extension

A custom Foxglove Studio panel extension that integrates OpenBridge Web Components for maritime navigation and automation visualization.

## 📋 Overview

This extension provides a professional maritime interface within Foxglove Studio, featuring:
- **Azimuth Thruster Control** - Real-time thruster angle and RPM visualization
- **Automation Control** - Autopilot status monitoring
- **Top Bar Navigation** - Application-wide navigation and controls
- **Navigation Menu** - Quick access to panel features
- **Demo Mode** - Automatic animation when no live data is available
- **Unit Switching** - Toggle between degrees and radians

## 🎯 Features

### Core Functionality
- ✅ Real-time data binding from Foxglove topics
- ✅ Graceful fallback to demo mode when no data is present
- ✅ Unit conversion (degrees ↔ radians)
- ✅ Professional maritime UI using OpenBridge Design System
- ✅ Fully typed TypeScript implementation
- ✅ Responsive layout

### Bonus Features
- 🎬 **Demo Mode**: Automatically animates instruments when no topics are available
- 🔄 **Unit Switching**: Toggle between degrees and radians for angle display
- 📊 **Live Status Indicators**: Shows current data source (live vs simulated)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Foxglove Studio (latest version)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Install in Foxglove Studio**
   - Open Foxglove Studio
   - Go to Extensions (Ctrl/Cmd + Shift + E)
   - Click "Install Extension"
   - Select the `my-extension` folder

## 📖 Usage

### Adding the Panel
1. Open Foxglove Studio
2. Add a new panel
3. Select "OpenBridge" from the panel list
4. The panel will start in **Demo Mode** automatically

### Demo Mode
When no data topics are available, the extension automatically enters demo mode:
- Thruster angle rotates smoothly
- RPM fluctuates realistically
- Automation state toggles periodically

Click the "Demo Mode: ON" button to toggle between demo and live data modes.

### Topic Subscriptions
The extension subscribes to the following topics:
- `/navigation/thruster/angle` - Thruster angle in degrees
- `/navigation/thruster/rpm` - Thruster RPM value
- `/automation/state` - Automation system status

### Unit Switching
Click the "Units" button to toggle between:
- **Degrees** (0° - 360°)
- **Radians** (0 - 2π)

## 🏗️ Project Structure

```
my-extension/
├── src/
│   ├── components/
│   │   ├── automation.tsx          # Automation button wrapper
│   │   ├── azimuth_thruster.tsx    # Thruster component wrapper
│   │   └── navigation_menu.tsx     # Navigation menu component
│   ├── App.css                     # Main styles
│   ├── ExamplePanel.tsx            # Main panel component
│   └── index.ts                    # Extension entry point
├── package.json
├── tsconfig.json
├── webpack.config.js               # Webpack configuration (if custom)
└── README.md
```

## 🔧 Development

### Build Commands
```bash
# Development build (watch mode)
npm run watch

# Production build
npm run build

# Type checking
npm run typecheck
```

### Code Quality
The project follows strict TypeScript and ESLint rules:
- Full type safety with `strict` mode
- ESLint with Prettier integration
- No implicit `any` types
- Consistent code formatting

## 📦 Dependencies

### Core Dependencies
- `@foxglove/studio` - Foxglove Studio API
- `@oicl/openbridge-webcomponents` - OpenBridge Web Components
- `@oicl/openbridge-webcomponents-react` - React wrappers for OpenBridge
- `react` & `react-dom` - UI framework
- `@lit/react` - Lit to React integration

### Development Dependencies
- `typescript` - Type safety
- `eslint` - Code linting
- `prettier` - Code formatting
- `webpack` - Module bundling

## 🎨 Customization

### Theming
The extension uses OpenBridge's night theme by default. Modify in `ExamplePanel.tsx`:
```typescript
document.documentElement.setAttribute("data-obc-theme", "night");
```

Available themes: `night`, `day`, `dusk`

### Adding Components
To add more OpenBridge components:

1. Import the component:
   ```typescript
   import "@oicl/openbridge-webcomponents/dist/path/to/component.js";
   ```

2. Create a TypeScript declaration:
   ```typescript
   declare global {
     namespace JSX {
       interface IntrinsicElements {
         "obc-component-name": {
           prop?: type;
         };
       }
     }
   }
   ```

3. Use in JSX:
   ```tsx
   <obc-component-name prop={value} />
   ```

## 🐛 Troubleshooting

### Components appear as dark boxes
- Ensure Noto Sans font is loaded (check browser console)
- Verify `data-obc-theme` is set on `<html>` element
- Check that web components are properly registered

### Build errors about missing extensions
If you see errors like "Can't resolve '../../icons/icon-name'":
- Create `webpack.config.js` with `fullySpecified: false`
- Or use patch-package to fix the imports

### TypeScript errors
Run type checking to see detailed errors:
```bash
npm run typecheck
```

## 📝 License

This project is part of a development challenge and is provided as-is for evaluation purposes.

## 👥 Author

Created as part of the Lemvos Internship Software Development Challenge.

## 🙏 Acknowledgments

- [Foxglove Studio](https://foxglove.dev/) - Robotics visualization platform
- [OpenBridge](https://www.openbridge.no/) - Maritime design system
- [Open Innovation Center Lab](https://oicl.io/) - OpenBridge Web Components maintainers
