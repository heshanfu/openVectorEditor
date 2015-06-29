var baobab = require('baobab');
var sequenceData = require('./sequenceData');
var ObjectID = require("bson-objectid");
var prepareRowData = require('./prepareRowData');
var findOrfsFromSequence = require('./findOrfsFromSequence');
var computeRowRepresentationOfSequence = require('./computeRowRepresentationOfSequence');
var validateAndTidyUpSequenceData = require('./validateAndTidyUpSequenceData');

//tnr: this is used to generate a very large, multi-featured sequence
var string = "atgtgtgatg";
var reallyLongFakeSequence = "";
for (var i = 0; i < 1000; i++) {
	reallyLongFakeSequence += string;
	if (i % 100 === 0) {
		sequenceData.features[i] = {
			id: i,
			start: i,
			end: i + 100,
			name: 'cooljim',
			color: 'green',
			forward: true,
			annotationType: "feature"
		};
	}
}
sequenceData.sequence = reallyLongFakeSequence;


// var fakeSequences = makeFakeSequences(20);
// console.log(fakeSequences);

// function makeFakeSequences(numberOfFakesSequencesToGenerate) {
// 	var fakeSequences = {};
// 	for (var i = 0; i < numberOfFakesSequencesToGenerate; i++) {
// 		console.log(ObjectID().str);
// 		fakeSequences[ObjectID().str] = sequenceData;
// 	}
// 	return fakeSequences;
// 	console.log(fakeSequences);
// }

// sequenceData.features = {};
// sequenceData.parts = {};

var tree = new baobab({
	vectorEditorState: {
		topSpacerHeight: 0,
		bottomSpacerHeight: 0,
		averageRowHeight: 100,
		// preloadBasepairStart: 300,
		charWidth: 15,
		CHAR_HEIGHT: 15,
		// FONT_SIZE: 14,
		ANNOTATION_HEIGHT: 15,

		SPACE_BETWEEN_ANNOTATIONS: 3,
		preloadRowStart: 0,
		// preloadRowEnd: 9,
		showOrfs: true,
		showCutsites: true,
		showParts: true,
		showFeatures: true,
		showAxis: true,
		showReverseSequence: true,
		viewportDimensions: {
			height: 500, //come back and make these dynamic
			width: 400
		},
		selectionLayer: {
			start: 20,
			end: 19,
			sequenceSelected: true,
		},
		mouse: {
			isDown: false,
			isSelecting: false,
		},
		caretPosition: 8,
		visibleRows: {
			start: 0,
			end: 0,
		},
		sequenceData: validateAndTidyUpSequenceData(sequenceData),
	},
	// // sequencesMegaStore: fakeSequences,
	// partsMegaStore: { //
	// 	//tnrtodo: make a fake part generator
	// },
	// designMegaStore: {
	// 	//tnrtodo: make a fake design generator
	// },
	// assemblyMakerState: {

	// },
}, {
	syncwrite: true,
	validate: function (tree, gaga) {
	},
	facets: {
		orfData: {
			cursors: {
				sequence: ['vectorEditorState', 'sequenceData', 'sequence'],
				isCircular: ['vectorEditorState', 'sequenceData', 'isCircular'], //decide on what to call this..
			},
			get: function(state) {
				return findOrfsFromSequence(state.sequence, state.isCircular);
			}
		},
		bpsPerRow: {
			cursors: {
				viewportDimensionsWidth: ['vectorEditorState', 'viewportDimensions', 'width'],
				charWidth: ['vectorEditorState', 'charWidth'],
			},
			get: function(state) {
				return Math.floor(state.viewportDimensionsWidth / state.charWidth);
			}
		},
		sequenceLength: {
			cursors: {
				sequenceData: ['vectorEditorState', 'sequenceData'],
			},
			get: function(state) {
				return state.sequenceData.sequence ? state.sequenceData.sequence.length : 0;
			}
		},
		rowData: {
			cursors: {
				sequenceData: ['vectorEditorState', 'sequenceData'],
			},
			facets: {
				bpsPerRow: 'bpsPerRow',
			},
			get: function(state) {
				// var self = this;
				// setTimeout(function (argument) {
				// var previousVisibleRows = this.tree.select('vectorEditorState', 'visibleRows').get();
				// this.tree.select('vectorEditorState', 'visibleRows').set(previousVisibleRows);
				// this.tree.commit();

				// }, 10);
				return prepareRowData(state.sequenceData, state.bpsPerRow);
			}
		},
		totalRows: {
			facets: {
				rowData: 'rowData',
			},
			get: function(state) {
				if (state.rowData) {
					return state.rowData.length;
				}
			}
		},
		visibleRowsData: {
			cursors: {
				visibleRows: ['vectorEditorState', 'visibleRows']
			},
			facets: {
				rowData: 'rowData'
			},
			get: function(state) {
				// debugger;
					console.log('state: ' + state.visibleRows.start + "  " + state.visibleRows.end);
				if (state.rowData && state.visibleRows) {
					return state.rowData.slice(state.visibleRows.start, state.visibleRows.end);
				}
			}
		}
	}
});

module.exports = tree;