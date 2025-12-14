import { createComponent } from "@lit/react";
import { ObcAutomationButton as ObcAutomationButtonElement } from "@oicl/openbridge-webcomponents/dist/automation/automation-button/automation-button.js";
import * as React from "react";

export const ObcAutomationButton = createComponent({
  react: React,
  tagName: "obc-automation-button",
  elementClass: ObcAutomationButtonElement,
  events: {
    onClick: "click",
    onChange: "change",
  },
});

// Type definition for better TypeScript support
export interface ObcAutomationButtonProps {
  label?: string;
  state?: "on" | "off" | "auto";
  disabled?: boolean;
}
