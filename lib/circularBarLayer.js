// Custom radial bar chart using d3.js

/* Authors: Bharat Kale <bkale@niu.edu>
   Version: 1.0.0
   Date: Sept 10 2022
*/

"use strict"

let CircularBarChart = function() {
    let self = {
        targetElement: null,
        targetSvg: null,
        targetG: null,
        id: "",

        data: null,
        dataXAttr: "",
        dataYAttr: "",
        barClass: "bar",
        
        showLabels: false,
        labelFontFamily: "Calibri",
        labelFontSize: 10,
        labelFontWeight: "normal",
        labelColor: "#777",

        colorScale: null,
        colorByAttr: "",
        color: "",

        y_scale: null,
        x_scale: null,
        innerRadius: 0,
        outerRadius: 0,

        arc:null,
        highlightCodons: false,
        codonToHighlight: {},
        // sendOnClickTitle: function() {},
        // sendOnClickVendor: function() {},

    };

    function id(id) {
        self.id = id;
        return this;

    }

    function targetSvg(svg) {
        self.targetSvg = svg;
        return this;

    }

    function targetG(gEle) {
        self.targetG = gEle;
        return this;

    }

    function data(data) {
        self.data = data;
        return this;

    }

    function highlight(nodes) {
        if (nodes!={}) {
            self.highlightCodons = true;
            self.codonToHighlight = nodes;
        } else {
            self.highlightCodons = false;
            self.codonToHighlight = {};
        }
        return this;
    }

    function labelFontSize(size) {
        self.labelFontSize = size;
        return this;

    }

    function labelFontFamily(params) {
        self.labelFontFamily = params[0];
        return this;

    }

    function labelFontWeight(weight) {
        self.labelFontWeight = weight;
        return this;

    }

    function showLabels(show) {
        self.showLabels = show;
        return this;

    }

    function labelColor(color) {
        self.labelColor = color;
        return this;

    }
    
    function colorScale(colorScale) {
        self.colorScale = colorScale
        return this;

    }

    function fillColor(c) {
        self.color=c;
        return this;
    }
    
    function colorByAttribute(attr) {
        self.colorByAttr = attr
        return this;

    }
    
    function dataXAttribute(attr) {
        self.dataXAttr = attr
        return this;
    }
    
    function dataYAttribute(attr) {
        self.dataYAttr = attr
        return this;
    }

    function setXScale(scale) {
        self.x_scale = scale;
        return this;
    }
    
    function setYScale(scale) {
        self.y_scale = scale;
        return this;
    }

    function innerRadius(r) {
        self.innerRadius = r;
        return this;
    }

    function outerRadius(r) {
        self.outerRadius = r;
        return this;
    }

    function barClassName(name) {
        self.barClass = name;
        return this;
    }

    // // set the callback function to be called when we click on current measure's title.
    // function setOnClickTitle(customFunc) {
    //     self.sendOnClickTitle = customFunc;
    //     return this;

    // }

    // // set the callback function to be called when we click on a vendor.
    // function setOnClickVendor(customFunc) {
    //     self.sendOnClickVendor = customFunc;
    //     return this;

    // }

    // delete the plot
    function deletePlot() {
        self.targetSvg.remove();
        return this;
    }

    // Update is called when there is any kind of change that needs the visualization to be updated.
    function update() {
        self.targetG.selectAll(`.${self.barClass}`)
            .attr("fill", d => {
                if (self.colorByAttr!="") {
                    return self.colorScale(d[self.colorByAttr]);
                }
                return self.color;
            })
            .attr("stroke", "none")
        if (self.highlightCodons) {        
            self.codonToHighlight.source.forEach(c => {
                self.targetG.selectAll(`#${self.dataXAttr}_${(+c)-5}`)
                    .attr("fill", "#40B0A6")
                    .attr("stroke", "#40B0A6")
                    .attr("stroke-width", 2)
            })
            self.codonToHighlight.target.forEach(c => {
                self.targetG.selectAll(`#${self.dataXAttr}_${(+c)-5}`)
                    .attr("fill", "#ffc20A")
                    .attr("stroke", "#ffc20A")
                    .attr("stroke-width", 2)
            })
        }
    }

    // Draw is called to create the visualization for the first time.
    function draw() {
        self.arc = d3.arc()
                    .innerRadius(self.innerRadius)
                    .outerRadius(d => {
                        if (self.dataYAttr!="") {
                            return self.y_scale(d[self.dataYAttr])
                        }
                        return self.outerRadius;
                    })
                    .startAngle(d => self.x_scale(`${self.dataXAttr}_${d.id}`))
                    .endAngle(d => self.x_scale(`${self.dataXAttr}_${d.id}`) + self.x_scale.bandwidth());

        let bars = self.targetG.selectAll(`.${self.barClass}`)
                        .data(self.data, d=>d.id)

        bars.enter().append("path")
            .attr("id", d => `${self.dataXAttr}_${d.id}`)
            .attr("class", d => {
                // console.log(d);
                return `${self.barClass}`;
            })
            .attr("fill", d => {
                if (self.colorByAttr!="") {
                    return self.colorScale(d[self.colorByAttr]);
                }
                return self.color;
            })
            .attr("stroke", "none")
            .attr("d", self.arc)
            .each(d => {this._current = d})
            // .on('mouseover', function(event, d) {
            //     d3.select(this).classed("mouseOver", true);
            // })
            // .on('mouseout', function(event, d) {
            //     d3.select(this).classed("mouseOver", false);
            // })

        bars.exit().remove();
        bars.transition()
            .duration(1000)
            .attrTween("d", arcTween);

//         bars.transition()
//             .duration(1000)
//             .attr("d", d3.arc()
//                             .innerRadius(self.innerRadius)
//                             .outerRadius(d => {
//                                 if (self.dataYAttr!="") {
//                                     return self.y_scale(d[self.dataYAttr])
//                                 }
//                                 return self.outerRadius;
//                             })
//                             .startAngle(d => self.x_scale(`${d[self.dataXAttr]}_${d.id}`))
//                             .endAngle(d => self.x_scale(`${d[self.dataXAttr]}_${d.id}`) + self.x_scale.bandwidth()))
        
    }

    /******************************* Private Functions ***********************************/
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return self.arc(i(t));
        };
    }

    return {
        id,
        targetSvg,
        targetG,
        draw,
        update,
        labelFontSize,
        labelFontFamily,
        labelFontWeight,
        showLabels,
        labelColor,

        data,
        barClassName,
        dataXAttribute,
        setXScale,
        dataYAttribute,
        setYScale,
        colorByAttribute,
        colorScale,
        fillColor,
        innerRadius,
        outerRadius,

        // setOnClickTitle,
        // setOnClickVendor,
        
        highlight,
        deletePlot,
    };

}