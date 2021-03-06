import React from "react";
import { connect } from "react-redux";
import AddOrEditPrimerDialog from "../helperComponents/AddOrEditPrimerDialog";
import AddOrEditFeatureDialog from "../helperComponents/AddOrEditFeatureDialog";
import AddOrEditPartDialog from "../helperComponents/AddOrEditPartDialog";
import _AddAdditionalEnzymes from "../AddAdditionalEnzymes";
import { withDialog } from "teselagen-react-components";
import { addYourOwnEnzymeClose } from "../redux/addYourOwnEnzyme";
import { AlignmentToolInner } from "../ToolBar/alignmentTool";

const AddAdditionalEnzymes = withDialog({
  title: "Add Additional Enzymes"
})(_AddAdditionalEnzymes);

const CreateAlignmentDialog = withDialog({
  title: "Create New Alignment"
})(AlignmentToolInner);

export default connect(
  state => {
    return {
      addYourOwnEnzymeIsOpen: state.VectorEditor.addYourOwnEnzyme.isOpen
    };
  },
  {
    addYourOwnEnzymeClose
  }
)(({ editorName, addYourOwnEnzymeIsOpen, addYourOwnEnzymeClose }) => {
  return (
    <div>
      <AddAdditionalEnzymes
        noTarget
        dialogProps={{
          isOpen: addYourOwnEnzymeIsOpen,
          onClose: addYourOwnEnzymeClose
        }}
      />
      <CreateAlignmentDialog
        editorName={editorName}
        dialogName="CreateAlignmentDialog"
        noTarget
      />
      <AddOrEditFeatureDialog
        editorName={editorName}
        dialogName="AddOrEditFeatureDialog"
        noTarget
      />
      <AddOrEditPartDialog
        editorName={editorName}
        dialogName="AddOrEditPartDialog"
        noTarget
      />
      <AddOrEditPrimerDialog
        editorName={editorName}
        dialogName="AddOrEditPrimerDialog"
        noTarget
      />
    </div>
  );
});
