//./selectionLayer.js
import { createReducer } from "redux-act";
import createAction from "./utils/createMetaAction";
import omit from "lodash/omit";
import randomColor from "randomcolor";

// ------------------------------------
// Actions
// ------------------------------------
export const replacementLayerClear = createAction("replacementLayerClear");
export const replacementLayerUpdate = createAction("REPLACEMENT_LAYER_UPDATE");
export const replacementLayerDelete = createAction("REPLACEMENT_LAYER_DELETE");

// ------------------------------------
// Reducer
// ------------------------------------
export default createReducer(
  {
    [replacementLayerClear]: () => {
      return {};
    },
    [replacementLayerUpdate]: (state, payload) => {
      return {
        ...state,
        [payload.id]: {
          color: randomColor({ hue: "green", luminosity: "dark" }),
          id: payload.id,
          ...payload.range
        }
      };
    },
    [replacementLayerDelete]: (state, payload) => {
      return omit(state, payload.id);
    }
  },
  {}
);
