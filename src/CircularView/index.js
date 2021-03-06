import VeWarning from "../helperComponents/VeWarning";
// import PassThrough from "../utils/PassThrough";
import Labels from "./Labels";
import SelectionLayer from "./SelectionLayer";
import Caret from "./Caret";
import Axis from "./Axis";
import LineageLines from "./LineageLines";
import Orfs from "./Orfs";
import Features from "./Features";
import Primers from "./Primers";
import DeletionLayers from "./DeletionLayers";
import ReplacementLayers from "./ReplacementLayers";
import Cutsites from "./Cutsites";
import sortBy from "lodash/sortBy";
import PositionAnnotationOnCircle from "./PositionAnnotationOnCircle";
import getAngleForPositionMidpoint from "./getAngleForPositionMidpoint";
import {
  normalizePositionByRangeLength,
  getPositionFromAngle,
  getRangeLength
} from "ve-range-utils";
import React from "react";
import Draggable from "react-draggable";
import withEditorInteractions from "../withEditorInteractions";
import Parts from "./Parts";
import "./style.css";
import draggableClassnames from "../constants/draggableClassnames";
function noop() {}

// function toDegrees(radians) {
//     return radians / 2 / Math.PI * 360
// }

export class CircularView extends React.Component {
  getNearestCursorPositionToMouseEvent(event, sequenceLength, callback) {
    if (!event.clientX) {
      return;
    }
    let boundingRect = this.refs.circularView.getBoundingClientRect();
    //get relative click positions
    let clickX = event.clientX - boundingRect.left - boundingRect.width / 2;
    let clickY = event.clientY - boundingRect.top - boundingRect.height / 2;

    //get angle
    let angle = Math.atan2(clickY, clickX) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2; //normalize the angle if necessary
    let nearestCaretPos = normalizePositionByRangeLength(
      getPositionFromAngle(angle, sequenceLength, true),
      sequenceLength
    ); //true because we're in between positions

    callback({
      event,
      className: event.target.className.animVal,
      shiftHeld: event.shiftKey,
      nearestCaretPos,
      selectionStartGrabbed: event.target.classList.contains(
        draggableClassnames.selectionStart
      ),
      selectionEndGrabbed: event.target.classList.contains(
        draggableClassnames.selectionEnd
      )
    });
  }

  render() {
    let {
      //set defaults for all of these vars
      width = 400,
      height = 400,
      scale = 1,
      sequenceData = {},
      hideName = false,
      editorName,
      selectionLayer = { start: -1, end: -1 },
      annotationHeight = 15,
      spaceBetweenAnnotations = 2,
      annotationVisibility = {},
      annotationLabelVisibility = {},
      caretPosition = -1,
      circularAndLinearTickSpacing,
      editorDragged = noop,
      editorDragStarted = noop,
      editorClicked = noop,
      editorDragStopped = noop,
      featureClicked = noop,
      featureRightClicked = noop,
      partClicked = noop,
      partRightClicked = noop,
      orfClicked = noop,
      orfRightClicked = noop,
      primerClicked = noop,
      primerRightClicked = noop,
      selectionLayerRightClicked = noop,
      backgroundRightClicked = noop,
      deletionLayerClicked = noop,
      replacementLayerClicked = noop,
      cutsiteClicked = noop,
      cutsiteRightClicked = noop,
      featureOptions = {},
      additionalSelectionLayers = [],
      maxAnnotationsToDisplay = {},
      lineageLines = [],
      deletionLayers = {},
      replacementLayers = {},
      instantiated
      // modifyLayers = function (layers) {
      //   return layers
      // },
    } = this.props;
    let { sequence = "atgc" } = sequenceData;
    let sequenceLength = sequence.length;
    let sequenceName = hideName ? "" : sequenceData.name || "";
    circularAndLinearTickSpacing =
      circularAndLinearTickSpacing ||
      (sequenceLength < 10
        ? 1
        : sequenceLength < 50
          ? Math.ceil(sequenceLength / 5)
          : Math.ceil(sequenceLength / 100) * 10);
    let {
      features: showFeatures = true,
      primers: showPrimers = true,
      // translations: showTranslations = true,
      parts: showParts = true,
      orfs: showOrfs = true,
      cutsites: showCutsites = true,
      // firstCut: showFirstCut = true,
      axis: showAxis = true,
      lineageLines: showLineageLines = true,
      axisNumbers: showAxisNumbers = false
      // sequence: showSequence = true,
      // reverseSequence: showReverseSequence = true,
    } = annotationVisibility;
    let {
      features: showFeatureLabels = true,
      parts: showPartLabels = true,
      cutsites: showCutsiteLabels = true,
      primers: showPrimerLabels = true
    } = annotationLabelVisibility;
    let {
      features: maxFeaturesToDisplay = 50,
      primers: maxPrimersToDisplay = 50,
      // translations: maxTranslationsToDisplay = 50,
      parts: maxPartsToDisplay = 50,
      orfs: maxOrfsToDisplay = 50,
      cutsites: maxCutsitesToDisplay = 100
    } = maxAnnotationsToDisplay;
    let paredDownOrfs;
    let paredDownCutsites;
    let paredDownFeatures;
    let paredDownPrimers;
    let paredDownParts;

    const baseRadius = 80;
    let innerRadius = baseRadius - annotationHeight / 2; //tnr: -annotationHeight/2 because features are drawn from the center
    let radius = baseRadius;
    let annotationsSvgs = [];
    let labels = {};

    //RENDERING CONCEPTS:
    //-"Circular" annotations get a radius, and a curvature based on their radius:
    //<CircularFeature>
    //-Then we rotate the annotations as necessary (and optionally flip them):
    //<PositionAnnotationOnCircle>

    let layersToDraw = [
      { layer: drawSequenceChars, zIndex: 10, layerName: "SequenceChars" },
      {
        layer: drawFeatures,
        zIndex: 20,
        layerName: "Features",
        spaceBefore: 10
      },
      { layer: drawPrimers, zIndex: 20, layerName: "Primers" },
      {
        layer: drawAxis,
        zIndex: 0,
        layerName: "Axis",
        spaceBefore: 0,
        spaceAfter: 0
      },

      { layer: drawCaret, zIndex: 15, layerName: "Caret" },
      { layer: drawSelectionLayer, zIndex: 10, layerName: "SelectionLayer" },
      {
        layer: drawReplacementLayers,
        zIndex: 20,
        layerName: "ReplacementLayers",
        spaceAfter: 20
      },
      {
        layer: drawDeletionLayers,
        zIndex: 20,
        layerName: "DeletionLayers",
        spaceAfter: 20
      },
      { layer: drawLineageLines, zIndex: 0, layerName: "LineageLines" },
      { layer: drawCutsites, zIndex: 10, layerName: "Cutsites" },
      { layer: drawOrfs, zIndex: 20, layerName: "Orfs", spaceBefore: 10 },
      {
        layer: drawParts,
        zIndex: 20,
        layerName: "Parts",
        spaceBefore: 20
      },
      { layer: drawLabels, zIndex: 30, layerName: "Labels" }
    ];

    let output = layersToDraw
      .map(function({
        layer,
        // layerName,
        spaceBefore = 0,
        spaceAfter = 0,
        zIndex
      }) {
        //   console.warn('-------------------------------------')
        //   console.warn('layerName:',JSON.stringify(layerName,null,4))
        //   console.warn('radius before draw:',JSON.stringify(radius,null,4))
        radius += spaceBefore;
        let result = layer();
        if (!result) {
          radius -= spaceBefore;
          return null;
        }
        radius += spaceAfter;
        // console.warn('radius after draw:',JSON.stringify(radius,null,4))
        return {
          result,
          // layer({
          //   radius,
          //   baseRadius,
          //   innerRadius,
          //   labels,
          //   annotationsSvgs,
          // }),
          zIndex
        };
      })
      .filter(function(i) {
        return !!i;
      });

    annotationsSvgs = sortBy(output, "zIndex").reduce(function(
      arr,
      { result }
    ) {
      return arr.concat(result);
    },
    []);

    //debug hash marks
    // annotationsSvgs = annotationsSvgs.concat([0,50,100,150,190].map(function (pos) {
    //     return <text key={pos} transform={`translate(0,${-pos})`}>{pos}</text>
    // }))

    function drawFeatures() {
      //DRAW FEATURES
      if (showFeatures && sequenceData.features) {
        let [annotationsToPass, paredDown] = pareDownAnnotations(
          sequenceData.features,
          maxFeaturesToDisplay
        );
        paredDownFeatures = paredDown;
        let results = Features({
          showFeatureLabels,
          radius,
          featureClicked,
          featureRightClicked,
          features: annotationsToPass,
          annotationHeight,
          spaceBetweenAnnotations,
          sequenceLength,
          editorName,
          ...featureOptions
        });
        if (!results) return null;
        //update the radius, labels, and svg
        radius += results.height;
        labels = { ...labels, ...results.labels };
        return results.component;
      }
    }

    function drawParts() {
      if (showParts && sequenceData.parts) {
        const [annotationsToPass, paredDown] = pareDownAnnotations(
          sequenceData.parts,
          maxPartsToDisplay
        );
        paredDownParts = paredDown;

        const results = Parts({
          radius,
          showPartLabels,
          partClicked,
          partRightClicked,
          parts: annotationsToPass,
          partHeight: annotationHeight,
          spaceBetweenAnnotations,
          sequenceLength,
          editorName
        });
        if (!results) return null;
        //update the radius, labels, and svg
        radius += results.height;
        labels = { ...labels, ...results.labels };
        return results.component;
      }
    }

    function drawPrimers() {
      //DRAW FEATURES
      if (showPrimers && sequenceData.primers) {
        let [annotationsToPass, paredDown] = pareDownAnnotations(
          sequenceData.primers,
          maxPrimersToDisplay
        );
        paredDownPrimers = paredDown;
        let results = Primers({
          radius,
          primerClicked,
          showPrimerLabels,
          primerRightClicked,
          primers: annotationsToPass,
          annotationHeight,
          spaceBetweenAnnotations,
          sequenceLength,
          editorName
        });
        if (!results) return null;

        //update the radius, labels, and svg
        radius += results.height;
        labels = { ...labels, ...results.labels };
        return results.component;
      }
    }

    function drawDeletionLayers() {
      if (!deletionLayers || !deletionLayers.length) return null;
      let results = DeletionLayers({
        radius,
        deletionLayerClicked,
        deletionLayers,
        annotationHeight,
        spaceBetweenAnnotations,
        sequenceLength,
        editorName
      });
      if (!results) return null;
      //update the radius, labels, and svg
      radius += results.height;
      labels = { ...labels, ...results.labels };
      return results.component;
    }

    function drawReplacementLayers() {
      if (!replacementLayers || !replacementLayers.length) return null;
      let results = ReplacementLayers({
        radius,
        replacementLayerClicked,
        replacementLayers,
        annotationHeight,
        spaceBetweenAnnotations,
        sequenceLength,
        editorName
      });
      if (!results) return null;
      //update the radius, labels, and svg
      radius += results.height;
      labels = { ...labels, ...results.labels };
      return results.component;
    }

    function drawOrfs() {
      //DRAW FEATURES
      if (showOrfs && sequenceData.orfs) {
        let [annotationsToPass, paredDown] = pareDownAnnotations(
          sequenceData.orfs,
          maxOrfsToDisplay
        );
        paredDownOrfs = paredDown;
        let results = Orfs({
          radius,
          orfClicked,
          orfRightClicked,
          orfs: annotationsToPass,
          annotationHeight,
          spaceBetweenAnnotations,
          sequenceLength,
          editorName,
          ...featureOptions
        });
        if (!results) return null;

        //update the radius, labels, and svg
        radius += results.height;
        labels = { ...labels, ...results.labels };
        return results.component;
      }
    }

    function drawSequenceChars() {
      //DRAW CHARS (only if there are fewer than 85 of them)
      if (sequenceLength < 85 && sequenceData.sequence) {
        radius += 25;
        sequenceData.sequence.split("").forEach(function(bp, index) {
          let tickAngle = getAngleForPositionMidpoint(index, sequenceLength);
          return (
            <PositionAnnotationOnCircle
              key={index}
              sAngle={tickAngle}
              eAngle={tickAngle}
              height={radius}
            >
              <text
                transform={`rotate(180)`}
                style={{
                  textAnchor: "middle",
                  dominantBaseline: "central",
                  fontSize: "small"
                }}
              >
                {bp}
              </text>
            </PositionAnnotationOnCircle>
          );
        });
      }
    }

    function drawAxis() {
      if (showAxis) {
        let axisResult = Axis({
          showAxisNumbers,
          radius,
          sequenceLength,
          circularAndLinearTickSpacing
        });
        //update the radius, and svg
        radius += axisResult.height;
        return axisResult.component;
      }
    }

    function drawLineageLines() {
      if (showLineageLines && lineageLines && lineageLines.length) {
        let results = LineageLines({
          radius,
          sequenceLength,
          annotationHeight: 6,
          editorName,
          lineageLines
          // lineageLines: [{start: 10, end:2000,},{start: 201, end:9,}],
        });
        if (!results) return null;
        //update the radius, and svg
        radius += results.height;
        return results.component;
      }
    }

    function drawCutsites() {
      //DRAW CUTSITES
      if (showCutsites && sequenceData.cutsites) {
        let [annotationsToPass, paredDown] = pareDownAnnotations(
          sequenceData.cutsites,
          maxCutsitesToDisplay
        );
        paredDownCutsites = paredDown;
        let results = Cutsites({
          showCutsiteLabels,
          cutsites: annotationsToPass,
          radius,
          annotationHeight,
          sequenceLength,
          editorName,
          cutsiteClicked,
          cutsiteRightClicked
        });
        if (!results) return null;
        //update the radius, labels, and svg
        radius += results.height;
        labels = { ...labels, ...results.labels };
        return results.component;
      }
    }

    function drawSelectionLayer() {
      //DRAW SELECTION LAYER
      let selectionLayers = [
        ...additionalSelectionLayers,
        ...(Array.isArray(selectionLayer) ? selectionLayer : [selectionLayer])
      ];
      return selectionLayers
        .map(function(selectionLayer, index) {
          if (
            selectionLayer.start >= 0 &&
            selectionLayer.end >= 0 &&
            sequenceLength > 0
          ) {
            return (
              <SelectionLayer
                {...{
                  index,
                  isDraggable: true,
                  key: "veCircularViewSelectionLayer" + index,
                  selectionLayer,
                  selectionLayerRightClicked,
                  sequenceLength,
                  baseRadius,
                  radius,
                  innerRadius
                }}
              />
            );
          } else {
            return null;
          }
        })
        .filter(el => {
          return !!el;
        });
    }

    function drawCaret() {
      //DRAW CARET
      if (
        caretPosition !== -1 &&
        selectionLayer.start < 0 &&
        sequenceLength > 0
      ) {
        //only render if there is no selection layer
        return (
          <Caret
            {...{
              caretPosition,
              sequenceLength,
              innerRadius,
              outerRadius: radius,
              key: "veCircularViewCaret"
            }}
          />
        );
      }
    }
    function drawLabels() {
      let results = Labels({
        editorName,
        circularViewWidthVsHeightRatio: width / height,
        labels,
        outerRadius: radius
      });
      if (!results) return null;
      radius += results.height;
      return results.component;
    }
    //tnr: Make the radius have a minimum so the empty yellow axis circle doesn't take up the entire screen
    if (radius < 150) radius = 150;
    return (
      <div tabIndex="0" className={"veCircularView"}>
        <Draggable
          bounds={{ top: 0, left: 0, right: 0, bottom: 0 }}
          onDrag={event => {
            this.getNearestCursorPositionToMouseEvent(
              event,
              sequenceLength,
              editorDragged
            );
          }}
          onStart={event => {
            this.getNearestCursorPositionToMouseEvent(
              event,
              sequenceLength,
              editorDragStarted
            );
          }}
          onStop={editorDragStopped}
        >
          <div>
            {!hideName && (
              <div
                style={{
                  position: "absolute",
                  width,
                  height,
                  pointerEvents: "none"
                }}
              >
                <div
                  key="circViewSvgCenterText"
                  className={"veCircularViewMiddleOfVectorText"}
                  style={{ width: innerRadius, textAlign: "center" }}
                >
                  <span>{sequenceName} </span>
                  <br />
                  <span style={{ fontSize: 10 }}>
                    ({sequenceLength + " bps"})
                  </span>
                </div>
              </div>
            )}
            <svg
              key="circViewSvg"
              onClick={event => {
                instantiated &&
                  this.getNearestCursorPositionToMouseEvent(
                    event,
                    sequenceLength,
                    editorClicked
                  );
              }}
              onContextMenu={e => {
                this.getNearestCursorPositionToMouseEvent(
                  e,
                  sequenceLength,
                  backgroundRightClicked
                );
              }}
              style={{ overflow: "visible" }}
              width={width}
              height={height}
              ref="circularView"
              className={"circularViewSvg"}
              viewBox={`-${radius * scale} -${radius * scale} ${radius *
                2 *
                scale} ${radius * 2 * scale}`}
            >
              {annotationsSvgs}
            </svg>
            <div className={"veCircularViewWarningContainer1"}>
              {paredDownOrfs && (
                <VeWarning
                  message={`Warning: More than ${maxOrfsToDisplay} Open Reading Frames. Displaying only the largest ${maxOrfsToDisplay}`}
                />
              )}
              {paredDownCutsites && (
                <VeWarning
                  message={`Only the first ${maxCutsitesToDisplay} cut sites will be displayed. Filter the display by cut site by selecting your desired Restriction Enzyme type `}
                />
              )}
              {paredDownFeatures && (
                <VeWarning
                  message={`Warning: More than ${maxFeaturesToDisplay} Features. Displaying only the largest ${maxFeaturesToDisplay}`}
                />
              )}

              {paredDownParts && (
                <VeWarning
                  message={`Warning: More than ${maxPartsToDisplay} Parts. Displaying only the largest ${maxPartsToDisplay}`}
                />
              )}
              {paredDownPrimers && (
                <VeWarning
                  message={`Warning: More than ${maxPrimersToDisplay} Primers. Displaying only the largest ${maxPrimersToDisplay}`}
                />
              )}
            </div>
          </div>
        </Draggable>
      </div>
    );
  }
}

function pareDownAnnotations(annotations, max) {
  let annotationsToPass = annotations;
  let paredDown = false;
  if (Object.keys(annotations).length > max) {
    paredDown = true;
    let sortedAnnotations = sortBy(annotations, function(annotation) {
      return -getRangeLength(annotation);
    });
    annotationsToPass = sortedAnnotations
      .slice(0, max)
      .reduce(function(obj, item) {
        obj[item.id] = item;
        return obj;
      }, {});
  }
  return [annotationsToPass, paredDown];
}

// function (messages) {
//   messages.forEach(function ([displayMessage, message]) {
//     displayMessage &&
//   })
// }

export default withEditorInteractions(CircularView);
