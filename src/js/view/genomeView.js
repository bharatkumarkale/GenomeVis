/* Authors: Bharat Kale <bkale@niu.edu>
   Version: 1.0.0
   Date: 09-01-2022
*/
"use strict"

var App = App || {};

let GenomeView = function(targetID) {
	let self = {
		targetID: "",
		targetContainer: null,
        targetSvg: null,
        totalWidth: 0,
        totalHeight: 0,
        width: 0,
        height: 0,

        data: null,
		xScales: [],
        yScales: [],
		colorScales: [],
        
        margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        
        fontFamily: "Calibri",
        labelColor: "#000",
        labelFontSize: "10px",
		index: d3.local(),

		barheight: 30,
    	outerRadius: 0,
		layerPadding: 5,
		startAngle: 0, 
		endAngle: 2*Math.PI,
		// startAngle: -Math.PI/4, 
		// endAngle: 7*Math.PI/4,

		layerCount: 0,
		attributeData: [],
		attributeData_filtered: [],
		edgeData: [],
		edgeData_filtered: [],
		orfLayer: null,
		orfLayerData: null,
		orfLayerData_filtered: null,
		proteinLayer: null,
		proteinLayerData: null,
		proteinLayerData_filtered: null,
		codonProbabilityLayer:null,
		codonScoreLayer:null,

		exportName: "genomeVis",
		exportFileName: "genomeVis.png"
	}

	init();

	function init() {	
		self.targetID = targetID;
	}

	function setExportFileName(name) {
		self.exportName = name;
		return this;
	}

	function data(data) {
		self.data=data;
		self.orfLayerData = App.models.data.getORFData();
		self.proteinLayerData = App.models.data.getProteinData();
		self.data.sequence.forEach((d,i) => {
			self.attributeData.push({'id':self.data['IDs'][i], 'codon': d, 'probability': self.data.probability[i]});
		});
		// self.data.interpair_attention.forEach(e => {
		// 	self.edgeData.push({'id':e.id,
		// 						'source':self.attributeData[e.pos1], 
		// 						'target':self.attributeData[e.pos2], 
		// 						'pos1': e.pos1,
		// 						'pos2': e.pos2,
		// 						'value':e.value});
		// })
		// self.edgeData = self.edgeData.filter((e,i) => i<=350);
		self.edgeData = self.data.interpair_attention;
		return this;
	}

	function initTarget() {
		self.targetContainer = d3.select(self.targetID);

		self.totalWidth = self.targetContainer.node().getBoundingClientRect().width;
        self.totalHeight = self.targetContainer.node().getBoundingClientRect().height;
        
        self.margin = {
                'left':self.totalWidth*0.01, 
                'right':self.totalWidth*0.01, 
                'top':self.totalHeight*0.01, 
                'bottom':self.totalHeight*0.01
              };

        self.width = self.totalWidth-self.margin.left-self.margin.right;
        self.height = self.totalHeight-self.margin.top-self.margin.bottom;
		self.outerRadius = Math.min(self.width, self.height) / 2;

        self.targetSvg = self.targetContainer.append("svg")
				            .attr("shape-rendering", "geometricPrecision")
				            .attr("x", 0)
				            .attr("y", 0)
				            .attr("width", self.totalWidth)
				            .attr("height", self.totalHeight)
							.on("dblclick", resetView)

		d3.selectAll('.btn').on('click', saveClicked)
	}

	function draw() {
		initTarget();
		let orfLayer_id = 'orfLayer',
			orfLayer_G = self.targetSvg.append("g")
							.attr("id", orfLayer_id)
							.attr("transform", `translate(${self.margin.left + self.width/2},${self.margin.top + self.height/2})`),
			innerR = self.outerRadius-0.5*self.barheight,
			outerR = self.outerRadius;

		self.orfLayerData.forEach(d => {
			d.size = d.end-d.start;
		})

		self.orfLayer = new DonutChart()
							.id(orfLayer_id)
							.targetSvg(self.targetSvg)
							.targetG(orfLayer_G)
							.showLabels(true)
							.data(self.orfLayerData)
							.dataTextAttribute('name_short')
							.dataArcAttribute('size')
							.arcClassName('ORF')
							.fillColor('#fff')
							.innerRadius(innerR)
							.outerRadius(outerR)
							.setArcAngles([self.startAngle, self.endAngle])
							.arcTextThreshold(0.15)
							.setOnClickArc(ORFSelected);
		self.orfLayer.draw();
		self.layerCount++;

		outerR = innerR - 0.5*self.layerPadding;
		innerR = outerR - 0.5*self.barheight;
		let proteinLayer_id = 'proteinLayer',
			proteinLayer_G = self.targetSvg.append("g")
							.attr("id", proteinLayer_id)
							.attr("transform", `translate(${self.margin.left + self.width/2},${self.margin.top + self.height/2})`);

		self.proteinLayerData.forEach(d => {
			d.size = d.end-d.start;
		})

		self.proteinLayer = new DonutChart()
								.id(proteinLayer_id)
								.targetSvg(self.targetSvg)
								.targetG(proteinLayer_G)
								.showLabels(true)
								.data(self.proteinLayerData)
								.dataTextAttribute('name')
								.dataArcAttribute('size')
								.arcClassName('Protein')
								.fillColor('#ddd')
								.innerRadius(innerR)
								.outerRadius(outerR)
								.setArcAngles([self.startAngle, self.endAngle])
								.arcTextThreshold(0.1)
								.setOnClickArc(proteinSelected);
		self.proteinLayer.draw();
		self.layerCount++;
		
		outerR = innerR - self.layerPadding;
		innerR = outerR - self.barheight;
		let codonProbabilityLayer_id = 'codonProbabilityLayer',
			codonProbabilityLayer_G = self.targetSvg.append("g")
										.attr("id", codonProbabilityLayer_id)
										.attr("transform", `translate(${self.margin.left + self.width/2},${self.margin.top + self.height/2})`),
			codonProbabilityLayer_xScale = d3.scaleBand()
											.range([self.startAngle, self.endAngle])
											.padding(0),
			codonProbabilityLayer_colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 1]);

		codonProbabilityLayer_xScale.domain(self.attributeData.map(d => `codon_${d.id}`))

		self.codonProbabilityLayer = new CircularBarChart()
										.id(codonProbabilityLayer_id)
										.targetSvg(self.targetSvg)
										.targetG(codonProbabilityLayer_G)
										.showLabels(false)
										.data(self.attributeData)
										.barClassName('codon')
										.dataXAttribute('codon')
										.setXScale(codonProbabilityLayer_xScale)
										.colorByAttribute('probability')
										.colorScale(codonProbabilityLayer_colorScale)
										.innerRadius(innerR)
										.outerRadius(outerR);
		self.codonProbabilityLayer.draw();
		self.layerCount++;
		
		// outerR = innerR - self.layerPadding;
		// innerR = outerR - 1.5*self.barheight;
		// let codonScoreLayer_id = 'divergingLayer1',
		// 	codonScoreLayer_G = self.targetSvg.append("g")
		// 						.attr("id", codonScoreLayer_id)
		// 						.attr("transform", `translate(${self.margin.left + self.width/2},${self.margin.top + self.height/2})`),
		// 	codonscoreLayer_xScale = d3.scaleBand()
		// 								.range([self.startAngle, self.endAngle])
		// 								.padding(0),
		// 	codonscoreLayer_yScale = d3.scaleLinear()
		// 								.range([innerR, outerR])
		// 								.domain([-1,1]),
		// 	codonScoreLayer_colorScale = d3.scaleDiverging(d3.interpolatePuOr).domain([-1,0,1]);

		// codonscoreLayer_xScale.domain(self.attributeData.map(d => `${d.codon}_${d.id}`))
		// self.codonScoreLayer = new CircularDivergingBarChart()
		// 								.id(codonScoreLayer_id)
		// 								.targetSvg(self.targetSvg)
		// 								.targetG(codonScoreLayer_G)
		// 								.showLabels(false)
		// 								.data(self.attributeData)
		// 								.barClassName('diverging1')
		// 								.dataXAttribute('codon')
		// 								.setXScale(codonscoreLayer_xScale)
		// 								.dataYAttribute('score')
		// 								.setYScale(codonscoreLayer_yScale)
		// 								.colorByAttribute('score')
		// 								.colorScale(codonScoreLayer_colorScale)
		// 								.innerRadius(innerR)
		// 								.outerRadius(outerR);
		// self.codonScoreLayer.draw();
		// self.layerCount++;

		outerR = innerR;
		let bundleLayer_id = 'edgeLayer',
			bundleLayer_G = self.targetSvg.append("g")
								.attr("id", bundleLayer_id)
								.attr("transform", `translate(${self.margin.left + self.width/2},${self.margin.top + self.height/2})`);
			// bundleLayer_colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 1]),
			// bundleLayer_widthScale = d3.scaleLinear().domain([0,1]).range([0,3]);

		self.bundleLayer = new EdgeBundle()
									.id(bundleLayer_id)
									.targetSvg(self.targetSvg)
									.targetG(bundleLayer_G)
									.data(self.edgeData)
									.setScaleAttr('codon')
									.setRadialScale(codonProbabilityLayer_xScale)
									.outerRadius(outerR)
									// .setEdgeWidthScale(bundleLayer_widthScale)
									// .setEdgeColorScale(bundleLayer_colorScale)
									.setEdgeWeightAttr('value');
		self.bundleLayer.draw();
		showLegend();
	}

	function updatelayers(highlightGroup, highlightGroupName) {
		self.orfLayer
			.highlight(highlightGroup)
			.update();
		self.proteinLayer
			.highlight(highlightGroup)
			.update();
		// let codonProbabilityLayer_xScale = d3.scaleBand()
		// 										.range([self.startAngle, self.endAngle])
		// 										.domain(attrData.map(d => `${d.codon}_${d.id}`))
		// 										.padding(0),
		// 	codonscoreLayer_xScale = d3.scaleBand()
		// 								.range([self.startAngle, self.endAngle])
		// 								.domain(attrData.map(d => `${d.codon}_${d.id}`))
		// 								.padding(0);

		self.bundleLayer
			.highlight(highlightGroup, highlightGroupName)
			.update();

		let source = self.bundleLayer.getHighlightedEdges().map(d => d.source.split(".").at(-1)),
			target = self.bundleLayer.getHighlightedEdges().map(d => d.target.split(".").at(-1));
		console.log(source, target);
		self.codonProbabilityLayer
			.highlight({'source': source, 'target': target})
			.update();
	}

	function ORFSelected(selectedORFData) {
		// self.attributeData_filtered = [];
		// let codon_start_idx = Math.floor(selectedORFData.start/3),
		// 	codon_end_idx = Math.ceil(selectedORFData.end/3)+1;

		// self.orfLayerData_filtered = self.orfLayerData.filter(d => d.name == selectedORFData.name);
		// self.proteinLayerData_filtered = self.proteinLayerData.filter(d => (d.start >= selectedORFData.start && d.end<=selectedORFData.end));
		// self.data_filtered = {'sequence': self.data.sequence.slice(codon_start_idx,codon_end_idx),
		// 					  'probability': self.data.probability.slice(codon_start_idx,codon_end_idx),
		// 					  'IDs': self.data.IDs.slice(codon_start_idx,codon_end_idx)};
		// self.data_filtered.sequence.forEach((d,i) => {
		// 	self.attributeData_filtered.push({'id':self.data_filtered['IDs'][i], 
		// 									  'codon': d, 
		// 									  'probability': self.data_filtered.probability[i][d]});
		// });
		
		// self.edgeData_filtered = deepCopy(self.edgeData);

		// self.edgeData_filtered = self.edgeData.filter(e => {
		// 	let src_parts = e.name.split('.'),
		// 		src_codon_idx = src_parts[src_parts.length-1];
		// 	return src_codon_idx>=codon_start_idx && src_codon_idx<=codon_end_idx;
		// })
		// self.edgeData_filtered.forEach(e => {
		// 	e.connects = e.connects.filter(tgt => {
		// 		let tgt_parts = tgt.split('.'),
		// 			tgt_codon_idx = tgt_parts[tgt_parts.length-1];
		// 		return tgt_codon_idx>=codon_start_idx && tgt_codon_idx<=codon_end_idx;
		// 	})
		// })
		// // updatelayers(self.attributeData_filtered, self.orfLayerData_filtered, self.proteinLayerData_filtered, self.edgeData_filtered);	
		
		
		updatelayers("orf", selectedORFData.name_short);	
	}

	function proteinSelected(selectedProteinData) {
		// self.attributeData_filtered = [];
		// let codon_start_idx = Math.floor(selectedProteinData.start/3),
		// 	codon_end_idx = Math.ceil(selectedProteinData.end/3)+1;

		// self.proteinLayerData_filtered = self.proteinLayerData.filter(d => d.name == selectedProteinData.name);
		// self.orfLayerData_filtered = self.orfLayerData.filter(d => (d.start <= selectedProteinData.start && d.end>=selectedProteinData.end));
		// self.data_filtered = {'sequence': self.data.sequence.slice(codon_start_idx,codon_end_idx),
		// 					 'probability': self.data.probability.slice(codon_start_idx,codon_end_idx),
		// 					 'IDs': self.data.IDs.slice(codon_start_idx,codon_end_idx)};
		// self.data_filtered.sequence.forEach((d,i) => {
		// 	self.attributeData_filtered.push({'id':self.data_filtered['IDs'][i], 
		// 									  'codon': d, 
		// 									  'probability': self.data_filtered.probability[i][d]});
		// });
		// self.edgeData_filtered = deepCopy(self.edgeData);
		
		// self.edgeData_filtered.forEach(e => {
		// 	let src_parts = e.name.split('.');
		// 	if (!src_parts[1].includes(selectedProteinData.name)) {
		// 		e.connects = []
		// 	}
		// })
		// // self.edgeData_filtered = self.edgeData.filter(e => {
		// // 	let src_parts = e.name.split('.'),
		// // 		src_codon_idx = src_parts[src_parts.length-1];
		// // 	return src_codon_idx>=codon_start_idx && src_codon_idx<=codon_end_idx;
		// // })
		// // self.edgeData_filtered.forEach(e => {
		// // 	e.connects = e.connects.filter(tgt => {
		// // 		let tgt_parts = tgt.split('.'),
		// // 			tgt_codon_idx = tgt_parts[tgt_parts.length-1];
		// // 		return tgt_codon_idx>=codon_start_idx && tgt_codon_idx<=codon_end_idx;
		// // 	})
		// // })
		// // updatelayers(self.attributeData_filtered, self.orfLayerData_filtered, self.proteinLayerData_filtered, self.edgeData_filtered);
		
		updatelayers("protein", selectedProteinData.name);	
	}

	function resetView() {
		self.attributeData_filtered = [];
		updatelayers("", "")	
	}

	function showLegend() {
		var colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0,1]),
			w = self.targetSvg.node().getBoundingClientRect().width,
			h = self.targetSvg.node().getBoundingClientRect().height,
			legRectHeight = 20,
			legRectWidth = 0.15*w;

		var gradient = self.targetSvg.append("defs")
							.append("linearGradient")
							.attr("id", 'linear_gradient_1')
							.attr("x1", "0%")
							.attr("y1", "0%")
							.attr("x2", "100%")
							.attr("y2", "0%")

		gradient.selectAll('stop')
			.data(colorScale.range())
			.enter()
				.append('stop')
				.style('stop-color', d=>d)
				.attr('offset', function (d,i) {
					return 100 * (i/(colorScale.range().length-1)) + '%';
				})

		self.targetSvg.append('text')
			.attr('class', 'legendTitle')
			.attr('x', 0.7*w)
			.attr('y', 0.05*h)
			.text('Token (Codon) Likelihood')

		self.targetSvg.append('rect')
			.attr('class', 'legendRect')
			.attr('x', 0.7*w+10)
			.attr('y', 0.05*h+10)
			.attr('width', legRectWidth)
			.attr('height', legRectHeight)
			.style('fill', 'url(#linear_gradient_1)')
		
		self.targetSvg.selectAll('.legendTick')
			.data([0,1])
			.enter()
				.append('text')
				.attr('class', 'legendTick')
				.attr('x', (d,i) => (i*legRectWidth)+(0.7*w+10))
				.attr('y',0.05*h+10+legRectHeight+2)
				.text(d => d)

	}

	function saveClicked(event, d) {
		let selectedID = d3.select(this).attr("id")

		if (selectedID.includes('PNG')) {
			self.exportFileName = `${self.exportName}.png`;
			svgString2Image( getSVGString(self.targetSvg.node()), 2*self.width, 2*self.height, 'png', save );
			// svgExport.downloadPng(
			// 	self.targetSvg.node(),
			// 	self.exportName, 
			// 	{ width: self.width, height: self.height }
			// );
		} else if (selectedID.includes('SVG')){
			self.exportFileName = `${self.exportName}.svg`;
			svgExport.downloadSvg(
				self.targetSvg.node(),
				self.exportName,
				{ width: self.width, height: self.height }
			);
		}
		
		// if (selectedID.includes('PNG')) {
		// 	self.exportFileName = `${self.exportName}.png`;
		// 	svgString2Image( getSVGString(self.targetSvg.node()), 2*self.width, 2*self.height, 'png', save );
		// } else if (selectedID.includes('SVG')){
		// 	self.exportFileName = `${self.exportName}.svg`;
		// 	svgString2Image( getSVGString(self.targetSvg.node()), 2*self.width, 2*self.height, 'svg', save );
		// }
		
		function save( dataBlob, filesize ){
			saveAs( dataBlob, self.exportFileName); // FileSaver.js function
		}
	}
	  
    function deepCopy(obj) {
        var output, v, key;
        output = Array.isArray(obj) ? [] : {};
        for (key in obj) {
            v = obj[key];
            output[key] = (typeof v === "object") ? deepCopy(v) : v;
        }
        return output;
    }

	// Below are the functions that handle actual exporting:
	// svgString2Image( getSVGString(svg.node()), 2*width, 2*height, 'png', save );
	function getSVGString( svgNode ) {
		svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
		var cssStyleText = getCSSStyles( svgNode );
		appendCSS( cssStyleText, svgNode );

		var serializer = new XMLSerializer();
		var svgString = serializer.serializeToString(svgNode);
		svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
		svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

		return svgString;

		function getCSSStyles( parentElement ) {
			var selectorTextArr = [];

			// Add Parent element Id and Classes to the list
			selectorTextArr.push( '#'+parentElement.id );
			for (var c = 0; c < parentElement.classList.length; c++)
					if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
						selectorTextArr.push( '.'+parentElement.classList[c] );

			// Add Children element Ids and Classes to the list
			var nodes = parentElement.getElementsByTagName("*");
			for (var i = 0; i < nodes.length; i++) {
				var id = nodes[i].id;
				if ( !contains('#'+id, selectorTextArr) )
					selectorTextArr.push( '#'+id );

				var classes = nodes[i].classList;
				for (var c = 0; c < classes.length; c++)
					if ( !contains('.'+classes[c], selectorTextArr) )
						selectorTextArr.push( '.'+classes[c] );
			}

			// Extract CSS Rules
			var extractedCSSText = "";
			for (var i = 0; i < document.styleSheets.length; i++) {
				var s = document.styleSheets[i];
				
				try {
					if(!s.cssRules) continue;
				} catch( e ) {
						if(e.name !== 'SecurityError') throw e; // for Firefox
						continue;
					}

				var cssRules = s.cssRules;
				for (var r = 0; r < cssRules.length; r++) {
					if ( contains( cssRules[r].selectorText, selectorTextArr ) )
						extractedCSSText += cssRules[r].cssText;
				}
			}
			

			return extractedCSSText;

			function contains(str,arr) {
				return arr.indexOf( str ) === -1 ? false : true;
			}

		}

		function appendCSS( cssText, element ) {
			var styleElement = document.createElement("style");
			styleElement.setAttribute("type","text/css"); 
			styleElement.innerHTML = cssText;
			var refNode = element.hasChildNodes() ? element.children[0] : null;
			element.insertBefore( styleElement, refNode );
		}
	}


	function svgString2Image( svgString, width, height, format, callback ) {
		var format = format ? format : 'png';

		var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");

		canvas.width = width;
		canvas.height = height;

		var image = new Image();
		image.onload = function() {
			context.clearRect ( 0, 0, width, height );
			context.drawImage(image, 0, 0, width, height);

			canvas.toBlob( function(blob) {
				var filesize = Math.round( blob.length/1024 ) + ' KB';
				if ( callback ) callback( blob, filesize );
			});

			
		};

		image.src = imgsrc;
	}


	return{
		data,
		draw,
		setExportFileName,
	};
}