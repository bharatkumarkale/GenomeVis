// Custom radial bar chart using d3.js

/* Authors: Bharat Kale <bkale@niu.edu>
   Version: 1.0.0
   Date: Sept 10 2022
*/

"use strict"

let EdgeBundle = function() {
    let self = {
        targetSvg: null,
        targetG: null,
        id: "",

        data: null,
        edgeClass: "edge",
        radialScale: null,
        scaleAttr: "",
        outerRadius: 0,

        edgeWidthScale: null,
        edgeColorScale: null,
        edgeWeightAttr: "",
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

    function setRadialScale(scale) {
        self.radialScale = scale;
        return this;
    }

    function setScaleAttr(attr) {
        self.scaleAttr = attr;
        return this;
    }

    function outerRadius(r) {
        self.outerRadius = r;
        return this;
    }

    function edgeClassName(name) {
        self.edgeClass = name;
        return this;
    }

    function setEdgeWidthScale(scale) {
        self.edgeWidthScale = scale;
        return this;
    }
    
    function setEdgeColorScale(scale) {
        self.edgeColorScale = scale;
        return this;
    }
    
    function setEdgeWeightAttr(attr) {
        self.edgeWeightAttr = attr;
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
    }

    // Draw is called to create the visualization for the first time.
    function draw() {
        let edges = self.targetG.selectAll(`.${self.edgeClass}`)
                        .data(self.data, d=>d.id)
        
        edges.enter()
            .append("path")
            .attr("id", (d,i) => `${d[self.edgeClass]}_${d.id}`)
            .attr("class", self.edgeClass)
            .attr("d", d => line(d))
            .attr('stroke', d => self.edgeColorScale(d[self.edgeWeightAttr]))
            .attr('stroke-width', d => self.edgeWidthScale(d[self.edgeWeightAttr]));

        edges.exit().remove();
        edges
            .attr("d", d => line(d));
        
    }

    /******************************* Private Functions ***********************************/
    function line(d) {
        let s_theta = self.radialScale(`${d.source[self.scaleAttr]}_${d.source.id}`),
            t_theta = self.radialScale(`${d.target[self.scaleAttr]}_${d.target.id}`),
            s_x = self.outerRadius * Math.sin(s_theta),
            s_y = self.outerRadius * Math.cos(s_theta),
            t_x = self.outerRadius * Math.sin(t_theta),
            t_y = self.outerRadius * Math.cos(t_theta);

        var lineData = [
        {
            x: Math.round(t_x),
            y: Math.round(t_y)
        }, {
            x: Math.round(t_x) - Math.round(t_x)/3,
            y: Math.round(t_y) - Math.round(t_y)/3
        }, 
        {
            x: Math.round(s_x) - Math.round(s_x)/3,
            y: Math.round(s_y) - Math.round(s_y)/3
        },{
            x: Math.round(s_x),
            y: Math.round(s_y)
        }];
        return `M${lineData[0].x},${lineData[0].y}C${lineData[1].x},${lineData[1].y},${lineData[2].x},${lineData[2].y},${lineData[3].x},${lineData[3].y} `;
    }

    return {
        id,
        targetSvg,
        targetG,
        draw,
        update,

        data,
        edgeClassName,
        outerRadius,
        setRadialScale,
        setScaleAttr,
        setEdgeWidthScale,
        setEdgeColorScale,
        setEdgeWeightAttr,
        
        deletePlot,
    };

}