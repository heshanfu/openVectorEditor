import React from "react";
import withHover from "../../helperComponents/withHover";
import PositionAnnotationOnCircle from "../PositionAnnotationOnCircle";
import getAnnotationNameAndStartStopString from "../../utils/getAnnotationNameAndStartStopString";
import Part from "./Part";

export default withHover(function({
  hoverActions,
  hoverProps: { className },
  startAngle,
  endAngle,
  onClick,
  onContextMenu,
  annotation,
  totalAngle,
  annotationColor,
  annotationRadius,
  partHeight
}) {
  return (
    <g
      {...hoverActions}
      className={className}
      onContextMenu={onContextMenu}
      onClick={onClick}
    >
      <title>
        {getAnnotationNameAndStartStopString(annotation, { isPart: true })}
      </title>
      <PositionAnnotationOnCircle
        sAngle={startAngle}
        eAngle={endAngle}
        forward={!annotation.forward}
      >
        <Part
          totalAngle={totalAngle}
          color={annotationColor}
          radius={annotationRadius}
          annotationHeight={partHeight}
        />
      </PositionAnnotationOnCircle>
    </g>
  );
});
