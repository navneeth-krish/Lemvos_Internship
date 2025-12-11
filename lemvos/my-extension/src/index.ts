import { ExtensionContext } from "@foxglove/studio";

import { initOpenBridgePanel } from "./ExamplePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({
    name: "openbridge-panel",
    initPanel: initOpenBridgePanel,
  });
}
