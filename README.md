
Congrats, you've made it to the repo for Teselagen's Open Source Vector Editor Component 
 - Built With React & Redux
 - Built for easy extensibility + embed-ibility 

## Issue Tracking Board: https://waffle.io/TeselaGen/openVectorEditor 

## Demo: http://teselagen.github.io/openVectorEditor/ 

# Table of Contents
<!-- TOC -->

  - [Issue Tracking Board: https://waffle.io/TeselaGen/openVectorEditor](#issue-tracking-board-httpswaffleioteselagenopenvectoreditor)
  - [Demo: http://teselagen.github.io/openVectorEditor/](#demo-httpteselagengithubioopenvectoreditor)
- [Table of Contents](#table-of-contents)
- [Upgrade Instructions for Major and Minor Versions](#upgrade-instructions-for-major-and-minor-versions)
- [Using this module in React](#using-this-module-in-react)
  - [Installation (react)](#installation-react)
  - [Code (react)](#code-react)
    - [Editor](#editor)
    - [CircularView/CircularViewUnconnected](#circularviewcircularviewunconnected)
    - [LinearView/LinearViewUnconnected](#linearviewlinearviewunconnected)
    - [RowView/RowViewUnconnected](#rowviewrowviewunconnected)
    - [EnzymeViewer](#enzymeviewer)
- [Using this module outside of react apps (Universal):](#using-this-module-outside-of-react-apps-universal)
  - [Installation (Universal)](#installation-universal)
    - [via npm:](#via-npm)
    - [Or via CDN:](#or-via-cdn)
  - [Code (Universal)](#code-universal)
  - [Demo (Universal): http://teselagen.github.io/openVectorEditor/](#demo-universal-httpteselagengithubioopenvectoreditor)
- [editorProps](#editorprops)
- [editorState](#editorstate)
- [Data Model](#data-model)
- [Alignments](#alignments)
  - [Integrating your own alignment data (only necessary if not using the built in alignment creation tool)](#integrating-your-own-alignment-data-only-necessary-if-not-using-the-built-in-alignment-creation-tool)
  - [Data Model](#data-model-1)
    - [Chromatogram Data](#chromatogram-data)
- [Development:](#development)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)

<!-- /TOC -->


# Upgrade Instructions for Major and Minor Versions
This repo follows semantic versioning (major/minor/patche)

The commit log can be seen here:
https://github.com/TeselaGen/openVectorEditor/commits/master 

Upgrade instructions for any major or minor change can be found here:
[Upgrade instructions](UPGRADE_INSTRUCTIONS.md)

# Using this module in React
## Installation (react)
```
yarn add install-peerdeps open-vector-editor
```
Add peer-dependencies: 
```
install-peerdeps open-vector-editor --dev --only-peers
```

## Code (react)
Require the following components like: 
```
import {Editor, RowView} from "open-vector-editor
```
### Editor
The `<Editor {...editorProps}/>` component gives you a full blown editor.
It takes in a list of editorProps as detailed below. 
### CircularView/CircularViewUnconnected
This gives you just the circular/plasmid map view. Either redux connected or unconnected (non-interactive)
### LinearView/LinearViewUnconnected
This gives you just the linear map view. Either redux connected or unconnected (non-interactive)
### RowView/RowViewUnconnected
This gives you just the detailed view of the sequence rows. Either redux connected or unconnected (non-interactive)
### EnzymeViewer
A component used for viewing enzymes 


# Using this module outside of react apps (Universal): 
The universal build can be used in any app with or without react. It corresponds to using the <Editor/> component in the React version. You will be able to customize the Editor just like in the react build, but you will not be able to use the individual components like <CircularView/> or <EnzymeViewer/>. For that you'll need to use React.
## Installation (Universal)
### via npm: 
```
npm install open-vector-editor
```
then add the links
```html
<link rel="stylesheet" type="text/css" href="your-path-to-node-modules/open-vector-editor/umd/main.css">
<script type="text/javascript" src="your-path-to-node-modules/open-vector-editor/umd/open-vector-editor.js"></script>
```

### Or via CDN: 
```html
<link rel="stylesheet" type="text/css" href="https://unpkg.com/open-vector-editor/umd/main.css"> 
<script type="text/javascript" src="https://unpkg.com/open-vector-editor/umd/open-vector-editor.js"></script>
```

## Code (Universal)

```html
<script>
const editor = window.createVectorEditor(yourDomNodeHere, editorProps);
editor.updateEditor(editorState);	
</script>
```

## Demo (Universal): http://teselagen.github.io/openVectorEditor/

# editorProps
These props consist of hooks and editor config options that can be passed like so: `<Editor {...editorProps}/>`  or as seen above like `window.createVectorEditor(yourDomNodeHere, editorProps);`
```js
{

	
	onSave: function(event, copiedSequenceData, editorState, onSuccessCallback) {
		console.log("event:", event);
		console.log("sequenceData:", copiedSequenceData);
		console.log("editorState:", editorState);
		// To disable the save button after successful saving
		// either call the onSuccessCallback or return a successful promise :)
		onSuccessCallback()
		//or 
		// return myPromiseBasedApiCall()
	},
	onCopy: function(event, copiedSequenceData, editorState) {
		//the copiedSequenceData is the subset of the sequence that has been copied in the teselagen sequence format
		console.log("event:", event);
		console.log("sequenceData:", copiedSequenceData);
		console.log("editorState:", editorState);
		const clipboardData = event.clipboardData;
		clipboardData.setData("text/plain", copiedSequenceData.sequence);
		clipboardData.setData(
			"application/json",
			JSON.stringify(copiedSequenceData)
		);
		event.preventDefault();
		//in onPaste in your app you can do:
		// e.clipboardData.getData('application/json')
	},
	onPaste: function(event, editorState) {
		//the onPaste here must return sequenceData in the teselagen data format
		const clipboardData = event.clipboardData;
		let jsonData = clipboardData.getData("application/json")
		if (jsonData) {
			jsonData = JSON.parse(jsonData)
			if (jsonData.isJbeiSeq) {
				jsonData = convertJbeiToTeselagen(jsonData)
			}
		}
		const sequenceData = jsonData || {sequence: clipboardData.getData("text/plain")}
		return sequenceData
	},
	//regular click overrides, eg: 
	featureClicked: ({annotation, event}) => {
		//do something here :)
	}
	// orf/primer/translation/cutsite/translationDouble/deletionLayer/replacementLayer/feature/part/searchLayer xxxxClicked can also be overridden

	rightClickOverrides: { //override what happens when a given feature/part/primer/translation/orf/cutsite/selectionLayer/lineageLine gets right clicked
		//the general format is xxxxRightClicked eg:
		selectionLayerRightClicked: (items, {annotation}, props) => {
			return [...items, { 
				//props here get passed directly to blueprintjs MenuItems
				text: "Create Part",
				onClick: () => console.log('hey!≈')
			}]
		}
	},
	PropertiesProps: { 
		// the list of tabs shown in the Properties panel
		propertiesList: [
			"general",
			"features",
			"parts",
			"primers",
			"translations",
			"cutsites",
			"orfs",
			"genbank"
		]
	},
	ToolBarProps: {
			//name the tools you want to see in the toolbar in the order you want to see them
			toolList: [
				"saveTool",
				"downloadTool",
				"importTool",
				"undoTool",
				"redoTool",
				"cutsiteTool",
				"featureTool",
				"oligoTool",
				"orfTool",
				"viewTool",
				"editTool",
				"findTool",
				"visibilityTool",
				"propertiesTool",
			]
		},
		onDigestSave: () => {} //tnr: NOT YET IMPLEMENTED
}
```
# editorState
These are the options to the `updateEditor()` action (the most generic redux action we have)) and will cause the editor state stored in redux to be updated. Only the subset of options that are passed will be updated. 
```js
{

	//note, sequence data passed here will be coerced to fit the Teselagen data model
	sequenceData: { Open Vector Editor data model
		sequence: "atagatagagaggcccg",
		features: [
			{
				start: 0, //start and end are 0-based inclusive for all annotations
				end: 10,
				id: 'yourUniqueID',
				forward: true //strand
			}
		],
		parts: []
	},
	annotationVisibility: {
		features: false
	},
	panelsShown: [
		[
			{
				id: "sequence",
				name: "Sequence Map",
				active: true
			}
		],
		[
			{
				id: "circular",
				name: "Plasmid",
				active: true
			},
			{
				id: "rail",
				name: "Linear Map",
				active: false
			},
			{
				id: "properties",
				name: "Properties",
				active: false
			}
		]
	],
	caretPosition: 10,
	...additional editor props can be passed here [Example Editor State](./editorStateExample.js)
}
```

# Data Model 
The data model can be interactively inspected by installing the redux devtools for your browser: [devtools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
Here is the top level editor state:
[Example Editor State](./editorStateExample.js)

# Alignments
## Integrating your own alignment data (only necessary if not using the built in alignment creation tool)
Add a panel to the panelsShown prop like so: 
```js
panelsShown: [
          [
            {
              id: "jbeiAlignment1",
              type: "alignment", //panel must be of type alignment
              name: "Jbei Alignment p1243124",
              active: true
						}
          ],
```
After calling `editor.updateEditor(...)` call
```js
editor.addAlignment({
        id: "jbeiAlignment1", //this id must match the id of the panel in panelsShown (see above)
        alignmentTracks: [
          {alignment Track Data Here}, //see Data Model below for specs
          {alignment Track Data Here},
          {alignment Track Data Here},
        ]
      });
```


## Data Model
Note: `alignmentData.sequence` is assumed to be the same length for EVERY track within an alignemnt run!

`alignmentData` can contain "-" characters, whereas sequenceData should not. Sequence Data is the "raw" data of the sequence being aligned with features/parts/etc. 

```js
{
        id: "jbeiAlignment1", //the unique ID of the alignment run
        alignmentTracks: [ //the array of tracks within the alignment run
          {
            //JBEI sequence 'GFPuv54'
            // chromatogramData: ab1ParsedGFPuv54,
            sequenceData: {
              id: "1",
							name: "GFPuv54",
							features: [{start: 12, end: 15, name: "Ha1", id: "myFeat1"}]
							// parts
              sequence:
                "CAGAAAGCGTCACAAAAGATGGAATCAAAGCTAACTTCAAAATTCGCCACAACATTGAAGATGGATCTGTTCAACTAGCAGACCATTATCAACAAAATACTCCAATTGGCGATGGCCCTGTCCTTTTACCAGACAACCATTACCTGTCGACACAATCTGCCCTTTCGAAAGAT"
            },
            alignmentData: {
              id: "1",
              sequence:
                "---CAGAAAGCGTCACAAAAGATGGAATCAAAGCTAACTTCAAAATTCGCCACAACATTGAAG---ATGGATCTGTTCAACTAGCAGACCATTATCAACAAAATACTCCAATTGGCGATGGCCCTGTCCTTTTACCAGACAACCA---TTACCTGTCGACACAATCTGCCCTTTCGAAAGAT"
            }
          },
          {
            //JBEI sequence 'GFPuv58'
            // chromatogramData: ab1ParsedGFPuv58,
            sequenceData: {
              id: "2",
              name: "GFPuv58",
              sequence:
                "GTTCAATGCTTTTCCCGTTATCCGGATCATATGAAACGGCATGACTTTTTCAAGAGTGCCATGCCCGAAGGTTATGTACAGGAACGCACTATATCTTTCAAAGATGACGGGAACTACAAGACGCGTGCTGAAGTCAAGTTTGAAGGTGATACCCTTGTTAATCGTATCGAGTT"
            },
            alignmentData: {
              id: "2",
              sequence:
                "GTTCAA--TGCTTTTCCCGTTATCCGGATCATATGAAACGGCATGACTTTTTCAAGAGTGCCATGCCCGAAGGTTATGTACA---GGAACGCACTATATCTTTCAAAGATGACGGGAACTACAAGACGCGTGCTGAAGTCAAGTTTGAAGGTGATAC--CCTTGTTAATCGTATCGAGTT--"
            }
          },
          ...more tracks can go here
        ]
		}
```

### Chromatogram Data 
```
"chromatogramData": { //only if parsing in an ab1 file
      "aTrace": [], //same as cTrace but for a
      "tTrace": [], //same as cTrace but for t
      "gTrace": [], //same as cTrace but for g
      "cTrace": [0,0,0,1,3,5,11,24,56,68,54,30,21,3,1,4,1,0,0, ...etc], //heights of the curve spaced 1 per x position (aka if the cTrace.length === 1000, then the max basePos can be is 1000)
      "basePos": [33, 46, 55,], //x position of the bases (can be unevenly spaced)
      "baseCalls": ["A","T", ...etc],
      "qualNums": [],
    },
```

# Development: 
## Prerequisites

[Node.js](http://nodejs.org/) >= v4 must be installed.

## Installation
```
yarn
yarn start
```

