import { Icon } from "@blueprintjs/core";
import React from "react";
import { Checkbox } from "@blueprintjs/core";
// import show_orfs from "./veToolbarIcons/show_orfs.png";
import InfoCircle from "react-icons/lib/fa/info-circle";

export default {
  updateKeys: [
    "annotationVisibility",
    "annotationVisibilityToggle",
    "useAdditionalOrfStartCodonsToggle",
    "useAdditionalStartCodons",
    "useAdditionalOrfStartCodons",
    "isOpen"
  ],
  itemProps: ({
    annotationVisibilityToggle,
    annotationVisibility = {},
    isOpen
  }) => {
    return {
      Icon: <Icon icon="circle" />,
      onIconClick: function() {
        annotationVisibilityToggle("orfs");
        annotationVisibilityToggle("orfTranslations");
      },
      toggled: annotationVisibility.orfs,
      tooltip: "Show Open Reading Frames",
      tooltipToggled: "Hide Open Reading Frames",
      Dropdown: OrfToolDropdown,
      dropdowntooltip:
        (!isOpen ? "Show" : "Hide") + " Open Reading Frame Options"
    };
  }
};

// function OrfTool({ annotationVisibilityToggle }) {
//   return (
//     <div
//       onClick={function() {
//         annotationVisibilityToggle("orfs");
//         annotationVisibilityToggle("orfTranslations");
//       }}
//     >
//       <img src={show_orfs} alt="Show Open Reading Frames" />
//     </div>
//   );
// }

function OrfToolDropdown({
  sequenceLength,
  minimumOrfSizeUpdate,
  minimumOrfSize,
  useAdditionalOrfStartCodons,
  useAdditionalOrfStartCodonsToggle,
  annotationVisibility,
  annotationVisibilityToggle
}) {
  return (
    <div className={"veToolbarOrfOptionsHolder"}>
      <div style={{ display: "flex" }}>
        Minimum ORF Size:
        <input
          type="number"
          className="minOrfSizeInput"
          onChange={function(event) {
            let minimumOrfSize = parseInt(event.target.value, 10);
            if (!(minimumOrfSize > -1)) return;
            if (minimumOrfSize > sequenceLength) return;
            minimumOrfSizeUpdate(minimumOrfSize);
          }}
          value={minimumOrfSize}
        />
      </div>
      <div className="vespacer" />
      <Checkbox
        onChange={function() {
          annotationVisibilityToggle("orfTranslations");
        }}
        checked={annotationVisibility.orfTranslations}
        label={"Show ORF translations"}
      />
      <Checkbox
        onChange={useAdditionalOrfStartCodonsToggle}
        checked={useAdditionalOrfStartCodons}
        label={"Use GTG and CTG as start codons"}
      />
      <div className="vespacer" />
      <InfoCircle />
      <span className={"translateInfoSpan"}>
        To translate an arbitrary area, right click a selection.
      </span>
    </div>
  );
}
