import { createComponent } from "@lit/react";
import { ObcAzimuthThruster as ObcAzimuthThrusterElement } from "@oicl/openbridge-webcomponents/dist/navigation-instruments/azimuth-thruster/azimuth-thruster.js";
import * as React from "react";

export const ObcAzimuthThruster = createComponent({
  react: React,
  tagName: "obc-azimuth-thruster",
  elementClass: ObcAzimuthThrusterElement,
  events: {},
});
