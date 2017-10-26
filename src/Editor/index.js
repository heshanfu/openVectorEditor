import React from "react";
import { compose } from "redux";
// import Dimensions from "react-dimensions";
import ContainerDimensions from 'react-container-dimensions';
import VeToolBar from "../VeToolBar";
import CircularView from "../CircularView";
import RowView from "../RowView";
import StatusBar from "../StatusBar";
import FindBar from "../FindBar";
import withEditorProps from "../withEditorProps";
import DropHandler from "./DropHandler";
import "./style.css";

export class Editor extends React.Component {
  render() {
    const {
      VeToolBarProps = {},
      StatusBarProps = {},
      containerWidth: width,
      containerHeight,
      editorName,
      updateSequenceData,
      ...rest
    } = this.props;
    console.log('containerHeight:',containerHeight)
    const sharedProps = {
      editorName,
      ...rest
    };

    return (
      
      <DropHandler
        updateSequenceData={updateSequenceData}
        style={{ width: "100%", height: "100%" }}
        className={"veEditor"}
      >
        <VeToolBar {...sharedProps} {...VeToolBarProps} />
        <div style={{ width: "100%", height: "100%" }}>
          <ContainerDimensions>

          <EditorInner {...{sharedProps}} {...rest} />
          </ContainerDimensions>
        </div>
        <StatusBar {...sharedProps} {...StatusBarProps} />
      </DropHandler>
    );
  }
}

export default compose(withEditorProps, /* Dimensions() */)(Editor);


class _EditorInner extends React.Component {
  render() {
    const {
      CircularViewProps = {},
      RowViewProps = {},
      FindBarProps = {},
      // containerWidth: width,
      // containerHeight,
      width,
      height,
      panelsShown = { circular: true, sequence: true },
      findTool = {},
      sharedProps
      // height = 500,
    } = this.props;

    // const height = containerHeight || 400;
    const showBoth = panelsShown.circular && panelsShown.sequence;
    let editorDimensions = {
      width: showBoth ? width / 2 : width,
      height
    };
    console.log("editorDimensions:", editorDimensions);

    return width ? (
      <div
        style={{ position: "relative" }}
        className="tg-editor-container"
        id="section-to-print"
      >
        {panelsShown.circular && (
          <div
            style={{ borderRight: showBoth ? "1px solid lightgrey" : "" }}
            className="CircularViewSide"
          >
            <CircularView
              {...sharedProps}
              {...CircularViewProps}
              {...{
                ...editorDimensions,
                hideName: true
              }}
            />
          </div>
        )}
        {panelsShown.sequence && (
          <div className="RowViewSide">
            <div>
              <RowView
                {...sharedProps}
                {...RowViewProps}
                {...{
                  ...editorDimensions
                }}
              />
            </div>
          </div>
        )}
        {findTool.isOpen && <FindBar {...sharedProps} {...FindBarProps} />}
      </div>
    ) : (
      <div style={{ height }} />
    );
  }
}

const EditorInner = _EditorInner;
// const EditorInner = Dimensions()(_EditorInner);