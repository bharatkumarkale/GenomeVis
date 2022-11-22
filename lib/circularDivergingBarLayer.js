// Custom radial diverging bar chart using d3.js

/* Authors: Bharat Kale <bkale@niu.edu>
   Version: 1.0.0
   Date: Sept 25 2022
*/

"use strict"

let CircularDivergingBarChart = function() {
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

    // delete the plot
    function deletePlot() {
        self.targetSvg.remove();
        return this;

    }

    // Update is called when there is any kind of change that needs the visualization to be updated.
    function update() {
        draw();
        return this;
    }

    // Draw is called to create the visualization for the first time.
    function draw() {
        self.arc = d3.arc()
                    .innerRadius(d => {
                        if (self.dataYAttr!="") {
                            if (d[self.dataYAttr]>=0) {
                                return self.y_scale(0);
                            }
                            return self.y_scale(d[self.dataYAttr]);
                        }
                        return self.innerRadius;
                    })
                    .outerRadius(d => {
                        if (self.dataYAttr!="") {
                            if (d[self.dataYAttr]<=0) {                                        
                                return self.y_scale(0);
                            }
                            return self.y_scale(d[self.dataYAttr]);
                        }
                        return self.outerRadius;
                    })
                    .startAngle(d => self.x_scale(`${d[self.dataXAttr]}_${d.id}`))
                    .endAngle(d => self.x_scale(`${d[self.dataXAttr]}_${d.id}`) + self.x_scale.bandwidth())

        let bars = self.targetG.selectAll(`.${self.barClass}`)
                        .data(self.data)
        bars.enter().append("path")
            .attr("id", d => `${d[self.dataXAttr]}_${d.id}`)
            .attr("class", self.barClass)
            .attr("fill", d => {
                if (self.colorByAttr!="") {
                    return self.colorScale(d[self.colorByAttr]);
                }
                return self.color;
            })
            .attr("d", self.arc)
            .on('mouseover', function(event, d) {
                d3.select(this).classed("mouseOver", true);
            })
            .on('mouseout', function(event, d) {
                d3.select(this).classed("mouseOver", false);
            })

        bars.exit().remove();
        bars.transition()
            .duration(1000)
            .attrTween("d", arcTween);
        
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
        
        deletePlot,
    };

}