import { ExtensionContext } from "@foxglove/studio";

import { initOpenBridgePanel } from "./ExamplePanel";

import "@oicl/openbridge-webcomponents/src/palettes/variables.css";

// Set theme on the <html> element
document.documentElement.setAttribute("data-obc-theme", "day");

// Set component size on the <body> element
document.body.classList.add("obc-component-size-regular");

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({
    name: "openbridge-panel",
    initPanel: initOpenBridgePanel,
  });
}
