import { createComponent } from "@lit/react";
import { ObcNavigationMenu as ObcNavigationMenuElement } from "@oicl/openbridge-webcomponents/dist/components/navigation-menu/navigation-menu.js";
import * as React from "react";

export const ObcNavigationMenu = createComponent({
  react: React,
  tagName: "obc-navigation-menu",
  elementClass: ObcNavigationMenuElement,
  events: {},
});
