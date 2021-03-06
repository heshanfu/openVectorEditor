import { Icon } from "@blueprintjs/core";
import React from "react";
// import show_primers from "./veToolbarIcons/show_primers.png";

export default {
  updateKeys: ["annotationVisibilityToggle", "annotationVisibility"],
  itemProps: ({ annotationVisibilityToggle, annotationVisibility = {} }) => {
    return {
      Icon: <Icon icon="swap-horizontal" />,
      onIconClick: function() {
        annotationVisibilityToggle("primers");
      },
      toggled: annotationVisibility.primers,
      tooltip: "Show Primers",
      tooltipToggled: "Hide Primers"
    };
  }
};

// function OligoTool({ annotationVisibilityToggle }) {
//   return (
//     <div
//       onClick={function() {
//         annotationVisibilityToggle("primers");
//       }}
//     >
//       <img src={show_primers} alt="Show oligos" />
//     </div>
//   );
// }
