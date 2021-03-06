import React from "react";
import { onlyUpdateForKeys, withProps, withHandlers } from "recompose";
import { compose } from "redux";

// import withEditorProps from "../withEditorProps";
import ToolbarItem from "./ToolbarItem";
import withEditorProps from "../withEditorProps";
import "./style.css";

import downloadTool from "./downloadTool";
import importTool from "./importTool";
import cutsiteTool from "./cutsiteTool";
import featureTool from "./featureTool";
import oligoTool from "./oligoTool";
import orfTool from "./orfTool";
// import viewTool from "./viewTool";
import editTool from "./editTool";
import findTool from "./findTool";
import inlineFindTool from "./inlineFindTool";
import alignmentTool from "./alignmentTool";
import saveTool from "./saveTool";
import visibilityTool from "./visibilityTool";
// import propertiesTool from "./propertiesTool";
import undoTool from "./undoTool";
import redoTool from "./redoTool";
// import fullScreenTool from "./fullScreenTool";

const allTools = {
  downloadTool,
  importTool,
  cutsiteTool,
  alignmentTool,
  featureTool,
  oligoTool,
  orfTool,
  // viewTool,
  editTool,
  findTool,
  inlineFindTool,
  saveTool,
  visibilityTool,
  // propertiesTool,
  undoTool,
  redoTool
  // fullScreenTool
};

// import get from 'lodash/get'

export class ToolBar extends React.Component {
  state = {
    openItem: -1
  };

  toggleOpen = index => {
    if (this.state.openItem === index) {
      this.setState({
        openItem: -1
      });
    } else {
      this.setState({
        openItem: index
      });
    }
  };

  render() {
    const {
      modifyTools,
      toolList = [
        "saveTool",
        "downloadTool",
        "importTool",
        "undoTool",
        "redoTool",
        "cutsiteTool",
        "featureTool",
        // "oligoTool",
        "orfTool",
        "alignmentTool",
        // "viewTool",
        "editTool",
        // "findTool",
        "inlineFindTool",
        "visibilityTool"
        // "fullScreenTool"
        // "propertiesTool"
      ],
      ...rest
    } = this.props;

    let items = toolList
      .map(toolName => {
        const tool = allTools[toolName];
        if (!tool) {
          console.error(
            "You're trying to load a tool that doesn't appear to exist: " +
              toolName
          );
          return false;
        }
        return tool;
      })
      .filter(tool => tool);

    if (modifyTools) {
      items = modifyTools(items);
    }

    let content = items.map((item, index) => {
      const updateKeys = item.updateKeys || [];
      const itemProps = item.itemProps || item;
      const WrappedItem = compose(
        withProps({
          ...rest,
          isOpen: index === this.state.openItem,
          toggleOpen: this.toggleOpen,
          index
        }),
        withHandlers({
          toggleDropdown: () => () => {
            this.toggleOpen(index);
          }
        }),
        withEditorProps,
        onlyUpdateForKeys([
          ...updateKeys,
          "isOpen",
          "toggleOpen",
          "editorName"
        ]),
        withProps(itemProps)
      )(ToolbarItem);
      WrappedItem.displayName = toolList[index];
      return <WrappedItem key={index} />;
    });

    return <div className={"veToolbar"}>{content}</div>;
  }
}

export default withEditorProps(
  onlyUpdateForKeys("modifyTools", "toolList")(ToolBar)
);
// export default withEditorProps(ToolBar);
