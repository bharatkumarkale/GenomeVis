// Custom pie chart using d3.js

/* Authors: Bharat Kale <bkale@niu.edu>
   Version: 1.0.0
   Date: Sept 10 2022
*/

"use strict"

let DonutChart = function() {
    let self = {
        targetElement: null,
        targetSvg: null,
        targetG: null,
        id: "",

        data: null,
        dataArcAttr: "",
        dataTextAttr: "",
        arcClassName: "",
        
        showLabels: false,
        labelFontFamily: "Calibri",
        labelFontSize: 10,
        labelFontWeight: "normal",
        labelColor: "#555",

        colorScale: null,
        colorByAttr: "",
        color: "",

        pie: d3.pie().sort(null),
        arc: d3.arc(),
        startAngle: 0,
        endAngle: 2* Math.PI,
        innerRadius: 0,
        outerRadius: 0,

        arcStroke: true,
        arcStrokeColor: "#777",
        arcStrokeWidth:1,
        arcTextThreshold:0,
        onClickArc: function() {},
        onMouseoverArc: function() {},
        onMouseoutArc: function() {},

        highlight: false,
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

    function highlight(name) {
        if (name=="") {
            self.highlight = false;
        } else {
            self.highlight = true;
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
    
    function dataTextAttribute(attr) {
        self.dataTextAttr = attr
        return this;
    }
    
    function dataArcAttribute(attr) {
        self.dataArcAttr = attr
        self.pie.value(d => d[attr]);
        return this;
    }

    function arcClassName(name) {
        self.arcClassName = name;
        return this;
    }

    function setArcAngles(angles) {
        self.startAngle = angles[0];
        self.endAngle = angles[1];
        self.pie.startAngle(self.startAngle).endAngle(self.endAngle);
        return this;
    }

    function innerRadius(r) {
        self.innerRadius = r;
        self.arc.innerRadius(r);
        return this;
    }

    function outerRadius(r) {
        self.outerRadius = r;
        self.arc.outerRadius(r);
        return this;
    }

    function arcStroke(stroke) {
        self.arcStroke = stroke;
        return this;
    }
    
    function arcStrokeColor(c) {
        self.arcStrokeColor = c;
        return this;
    }
    
    function arcStrokeWidth(w) {
        self.arcStrokeWidth = w;
        return this;
    }

    function arcTextThreshold(l) {
        self.arcTextThreshold = l;
        return this;
    }

    // set the callback function to be called when we click on current measure's title.
    function setOnClickArc(customFunc) {
        self.onClickArc = customFunc;
        return this;
    }

    function setOnMouseOverArc(customFunc) {
        self.onMouseoverArc = customFunc;
        return this;
    }

    function setOnMouseOutArc(customFunc) {
        self.onMouseoutArc = customFunc;
        return this;
    }

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
        if (self.highlight) {
            
        } else {
            d3.selectAll(`.arc_${self.arcClassName}`).classed("selected_donut_arc", false);
            self.targetG.selectAll(`.text_${self.arcClassName}`).classed(`selected_text_${self.arcClassName}`, false)
        }
    }

    // Draw is called to create the visualization for the first time.
    function draw() {
        let arcs = self.targetG.selectAll(`.arc_${self.arcClassName}`)
                        .data(self.pie(self.data), d=>d.data.id)
        
        arcs.enter().append("path")
            .attr("id", d => `arc_${self.arcClassName}_${d.data.id}`)
            .attr("class", d => `arc_${self.arcClassName} ${d.data[self.dataTextAttr]}`)
            .attr("fill", d => {
                if (d.data[self.dataTextAttr]=='empty') {
                    return "none";
                }
                if (self.colorByAttr!="") {
                    return self.colorScale(d[self.colorByAttr]);
                }
                return self.color;
            })
            .attr("d", self.arc)
            // .each(d => {this._current = d})
            .attr("stroke", (d) => {
                if (d.data[self.dataTextAttr]=='empty') {
                    return "none";
                }
                if (self.arcStroke) {
                    return self.arcStrokeColor;
                }
                return "none";
            })
            .attr("stroke-width", (d) => {
                if (d.data[self.dataTextAttr]=='empty') {
                    return 0;
                }
                if (self.arcStroke) {
                    return self.arcStrokeWidth;
                }
                return 0;
            })
            .on('mouseover', function(event, d) {
                d3.select(this).classed("mouseOver", true);
                // self.onMouseoverArc(d.data);
                // d3.select(`#text_${self.arcClassName}_${d.data.id}`).classed("mouseOverArcLabel", true);
            })
            .on('mouseout', function(event, d) {
                d3.select(this).classed("mouseOver", false);
                // self.onMouseoutArc();
                // d3.select(`#text_${self.arcClassName}_${d.data.id}`).classed("mouseOverArcLabel", false);
            })
            .on('click', function(event, d) {
                d3.selectAll(`.arc_${self.arcClassName}`).classed("selected_donut_arc", false);
                d3.select(this).classed("selected_donut_arc", true);
                self.targetG.selectAll(`.text_${self.arcClassName}`).classed(`selected_text_${self.arcClassName}`, false)
                self.targetG.select(`#text_${self.arcClassName}_${d.data.id}`).classed(`selected_text_${self.arcClassName}`, true)
                self.onClickArc(d.data);                
            })

        arcs.exit().remove();
        arcs.transition()
            .duration(1000)
            .attrTween("d", arcTween);

        if (self.showLabels) {
            let labels = self.targetG.selectAll(`.text_${self.arcClassName}`)
                            .data(self.pie(self.data), d=>d.data.id)
            labels.enter().append("text")
                    .attr("id", d => `text_${self.arcClassName}_${d.data.id}`)
                    .attr("class", `text_${self.arcClassName}`)
                    .attr("dy", 10) //20
                    .attr("fill", '#333')
                    .append("textPath")
                        .attr("xlink:href", d => `#arc_${self.arcClassName}_${d.data.id}`)
                        .attr("startOffset","30%")
                        .style("text-anchor","end")
                        .text(d => {
                            if (d.data[self.dataTextAttr]=='empty') {
                                return "";
                            }
                            if (d.endAngle-d.startAngle >= self.arcTextThreshold) {
                                return d.data[self.dataTextAttr];                                
                            }
                        })

            labels.exit().remove();
            self.targetG.selectAll('textPath').data(self.pie(self.data), d=>d.data.id).transition()
                .duration(1000)
                    .text(d => {
                        if (d.data[self.dataTextAttr]=='empty') {
                            return "";
                        }
                        if (d.endAngle-d.startAngle >= self.arcTextThreshold) {
                            return d.data[self.dataTextAttr];                                
                        }
                    })
                
        }
        
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
        dataTextAttribute,
        dataArcAttribute,
        arcClassName,
        colorByAttribute,
        colorScale,
        fillColor,
        setArcAngles,
        innerRadius,
        outerRadius,

        arcStroke,
        arcStrokeColor,
        arcStrokeWidth,
        arcTextThreshold,
        setOnClickArc,
        setOnMouseOverArc,
        setOnMouseOutArc,
        
        highlight,
        deletePlot,
    };

}