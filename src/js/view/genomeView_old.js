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
		targetEle: null,
		tooltip_div: null,
        totalWidth: 0,
        totalHeight: 0,
        width: 0,
        height: 0,

        data: null,
		ORFs: [{'name': 'ORF1a', 'size':13218, 'overlap': true},
				{'name': 'ORF1ab', 'size':21290, 'overlap': false},
				{'name': 'ORF2(S)', 'size':3822, 'overlap': false},
				{'name': 'ORF3a', 'size':828, 'overlap': false},
				{'name': 'ORF4(E)', 'size':228, 'overlap': false},
				{'name': 'ORG5(M)', 'size':669, 'overlap': false},
				{'name': 'ORF6', 'size':186, 'overlap': false},
				{'name': 'ORF7a', 'size':366, 'overlap': false},
				{'name': 'ORF7b', 'size':132, 'overlap': false},
				{'name': 'ORF8', 'size':366, 'overlap': false},
				{'name': 'ORF9(N)', 'size':1260, 'overlap': false},
				{'name': 'ORF10', 'size':117, 'overlap': false}],
        xScale: d3.scaleBand().padding(0),
        yScale: d3.scaleRadial(),
		colorScale: d3.scaleSequential(d3.interpolateReds).domain([0, 1]),
		yStart: 100,
		barheight: 30,
		verticalBarPadding: 3,
        
        margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        
        fontFamily: "Arial, Helvetica, sans-serif",
        labelColor: "#000",
        labelFontSize: "10px",
		index: d3.local(),

		magnifiedCodons: 3,
		magnifiedCodonSize: 20,
    	outerRadius: 0,
	}

	init();

	function init() {	
		self.targetID = targetID;
	}

	function data(data) {
		self.data=data;
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
                'bottom':self.totalHeight*0.005
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
		self.targetEle = self.targetSvg.append("g")
							.attr("transform", `translate(${self.margin.left + self.width/2},${self.margin.top + self.height/2})`);

		self.xScale.range([0, 2*Math.PI])
			.domain(self.data.sequence.map((d,i) => `${d}_${i}`));
		
		self.yScale.range([self.outerRadius-self.barheight,self.outerRadius])
			.domain([0,1])
	}

	function draw() {
		initTarget();
		
		self.rects = self.targetEle.selectAll('.codon')
						.data(self.data.sequence)
						.enter().append("path")
							.attr("id", (d,i) => `${d}_${i}`)
							.attr("class", "codon")
							.attr("fill", (d,i) => self.colorScale(self.data.probability[i][d]))
							.attr("d", d3.arc()
										.innerRadius(self.outerRadius-self.barheight)
										.outerRadius(self.outerRadius)
										.startAngle((d,i) => self.xScale(`${d}_${i}`))
										.endAngle((d,i) => self.xScale(`${d}_${i}`) + self.xScale.bandwidth())
										.padAngle(0.01)
										.padRadius(0))
							.on('mouseover', function(event, d) {
								d3.select(this).classed("mouseOver", true);
							})
							.on('mouseout', function(event, d) {
								d3.select(this).classed("mouseOver", false);
							})
	}

	return{
		data,
		draw,
	};
}
// /* Authors: Bharat Kale <bkale@niu.edu>
//    Version: 1.0.0
//    Date: 09-01-2022
// */
// "use strict"

// var App = App || {};

// let GenomeView = function(targetID) {
// 	let self = {
// 		targetID: "",
// 		targetContainer: null,
//         targetSvg: null,
// 		targetEle: null,
// 		tooltip_div: null,
//         totalWidth: 0,
//         totalHeight: 0,
//         width: 0,
//         height: 0,

//         data: null,
//         xScale: d3.scaleBand().padding(0),
//         xScale_left: null,
//         xScale_right: null,
//         // y: d3.scaleLinear(),
// 		colorScale: d3.scaleSequential(d3.interpolateReds).domain([0, 1]),
// 		yStart: 100,
// 		barheight: 20,
// 		verticalBarPadding: 5,
        
//         margin: {
//             top: 0,
//             right: 0,
//             bottom: 0,
//             left: 0,
//         },
        
//         fontFamily: "Arial, Helvetica, sans-serif",
//         labelColor: "#000",
//         labelFontSize: "10px",
// 		index: d3.local(),

// 		magnifiedCodons: 3,
// 		magnifiedCodonSize: 15,
// 	}

// 	init();

// 	function init() {	
// 		self.targetID = targetID;
// 	}

// 	function data(data) {
// 		self.data=data;
// 		return this;
// 	}

// 	function initTarget() {
// 		self.targetContainer = d3.select(self.targetID);

// 		self.totalWidth = self.targetContainer.node().getBoundingClientRect().width;
//         self.totalHeight = self.targetContainer.node().getBoundingClientRect().height;
        
//         self.margin = {
//                 'left':self.totalWidth*0.01, 
//                 'right':self.totalWidth*0.01, 
//                 'top':self.totalHeight*0.05, 
//                 'bottom':self.totalHeight*0.05
//               };

//         self.width = self.totalWidth-self.margin.left-self.margin.right;
//         self.height = self.totalHeight-self.margin.top-self.margin.bottom;

//         self.targetSvg = self.targetContainer.append("svg")
// 				            .attr("shape-rendering", "geometricPrecision")
// 				            .attr("x", 0)
// 				            .attr("y", 0)
// 				            .attr("width", self.totalWidth)
// 				            .attr("height", self.totalHeight);

// 		self.targetEle = self.targetSvg.append("g")
// 							.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
		
// 		self.xScale.range([0, self.width])
// 					.domain(self.data.sequence.map((d,i) => `${d}_${i}`));

// 		self.tooltip_div = d3.select("body").append("div")	
// 								.attr("class", "tooltip")				
// 								.style("opacity", 0);
// 	}

// 	function draw() {
// 		initTarget();
// 		console.log(self.data);
// 		self.rects = self.targetEle.selectAll('.codon')
// 						.data(self.data.sequence)
// 						.enter().append("rect")
// 							.attr("transform", (d,i) => {
// 									return `translate(${self.xScale(`${d}_${i}`)},${self.yStart})`;
// 								})
// 							.attr("id", (d,i) => `${d}_${i}`)
// 							.attr("class", "codon")
// 							.attr("height", self.barheight)
// 							.attr("width", self.xScale.bandwidth())
// 							.attr("fill", (d,i) => self.colorScale(self.data.probability[i][d]))
// 							.each(function(d, i) {
// 								self.index.set(this, i);
// 							  })
// 							.on('mouseover', function(event, d) {
// 								d3.select(this).classed("mouseOver", true);
// 								let cur_index = self.index.get(this),
// 									magnifiedAreaWidth = self.magnifiedCodonSize*self.xScale.bandwidth(),
// 									leftCount = cur_index,
// 									rightCount = self.data.sequence.length-cur_index-1,
// 									leftW = (self.width-magnifiedAreaWidth)*leftCount/(leftCount+rightCount);
// 								self.xScale_left = d3.scaleBand().padding(0)
// 													.range([0, leftW])
// 													.domain(self.data.sequence.slice(0,cur_index).map((d,j) => `${d}_${j}`)); 
// 								self.xScale_right = d3.scaleBand().padding(0)
// 													.range([leftW+magnifiedAreaWidth, self.width])
// 													.domain(self.data.sequence.slice(cur_index+1).map((d,j) => `${d}_${j+cur_index+1}`)); 
// 								updateCodons(cur_index);	
// 							})
// 							.on('mouseout', function(event, d) {
// 								d3.select(this).classed("mouseOver", false);
// 								self.xScale_left = null;
// 								self.xScale_right = null;
// 								updateCodons(self.index.get(this));
// 							})
// 	}

// 	function updateCodons(selectedCodonIndex) {
// 		let alternatives = self.data.probability[selectedCodonIndex],
// 			magnifiedAreaWidth = self.magnifiedCodonSize*self.xScale.bandwidth(),
// 			magnifiedAreaHeight = self.verticalBarPadding + Object.keys(alternatives).length*(self.barheight + self.verticalBarPadding);
// 		if (null==self.xScale_left && null==self.xScale_right) {
// 			self.targetEle.selectAll('.codon')
// 				.attr("transform", (d,i) => {
// 					return `translate(${self.xScale(`${d}_${i}`)},${self.yStart})`;
// 				})
// 				.attr("height", self.barheight)
// 				.attr("width", self.xScale.bandwidth())
// 				updateMagnifiedCodon([]);
// 		} else {
// 			let alternatives_arr = Object.entries(alternatives).sort((a,b) => b[1]-a[1]),
// 				match_idx, start_y;
// 			self.targetEle.selectAll('.codon')
// 				.attr("transform", (d,i) => {
// 					if (i==selectedCodonIndex) {
// 						match_idx = alternatives_arr.findIndex(a => a[0]==self.data.sequence[selectedCodonIndex])
// 						start_y = self.yStart- (self.verticalBarPadding + (match_idx)*(self.barheight + self.verticalBarPadding))
// 						return `translate(${self.xScale_left.range()[1]},${start_y})`;
// 					} else if(i<selectedCodonIndex) {
// 						return `translate(${self.xScale_left(`${d}_${i}`)},${self.yStart})`;
// 					} else {
// 						return `translate(${self.xScale_right(`${d}_${i}`)},${self.yStart})`;
// 					}
					
// 				})
// 				.attr("height", (d,i) => {
// 					if (i==selectedCodonIndex) {
// 						return magnifiedAreaHeight;
// 					}
// 					return self.barheight;
// 				})
// 				.attr("width", (d,i) => {
// 					if (i==selectedCodonIndex) {
// 						return magnifiedAreaWidth;
// 					} else if(i<selectedCodonIndex) {
// 						return self.xScale_left.bandwidth()
// 					} else {
// 						return self.xScale_right.bandwidth()
// 					}
// 				})
// 			updateMagnifiedCodon(alternatives_arr, 
// 				self.xScale_left.range()[1], start_y, 
// 				magnifiedAreaWidth, self.barheight, 
// 				self.xScale_left.bandwidth(), match_idx);
// 		}
// 	}

// 	function updateMagnifiedCodon(alternatives, start_x=0, start_y=0, bar_width=0, bar_height=0, pad_x=0, match=0) {
// 		self.targetEle.selectAll('.magnifiedCodon.rect')
// 		.data(alternatives)
// 		.join('rect')
// 			.attr('class', 'magnifiedCodon rect')
// 			.attr('x', start_x)
// 			.attr('y', (d,i) => start_y + self.verticalBarPadding + i*(self.barheight + self.verticalBarPadding))
// 			.attr('width', bar_width)
// 			.attr('height', bar_height)
// 			.attr('fill', (d,i) => {
// 				if (i==match) {
// 					return self.colorScale(d[1]);
// 				}
// 				return 'lightgray';
// 			})

// 		self.targetEle.selectAll('.magnifiedCodon.text')
// 			.data(alternatives)
// 			.join('text')
// 				.attr('class', 'magnifiedCodon text')
// 				.attr('x', start_x + pad_x)
// 				.attr('y', (d,i) => start_y + self.verticalBarPadding + 
// 									i*(self.barheight + self.verticalBarPadding)
// 									+ bar_height/2)
// 				.text(d => `${d[0]} ${d[1]}`)
// 	}

// 	return{
// 		data,
// 		draw,
// 	};
// }