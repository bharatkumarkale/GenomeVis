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
        
        highlightEdges: false,
        highlightGroup: "",
        highlightGroupName: "",
        highlightedEdges: [],

        edgeWidthScale: null,
        edgeColorScale: null,
        edgeWeightAttr: "",

        root: null,
        line: null,
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
        self.data = deepCopy(data);
        return this;

    }

    function highlight(group, name) {
        if (group=="") {
            self.highlightEdges = false;
            self.highlightGroup = "";
            self.highlightGroupName = "";
        } else {
            self.highlightEdges = true;
            self.highlightGroup = group;
            self.highlightGroupName = name;
        }
        return this;
    }

    function getHighlightedEdges() {
        return self.highlightedEdges;
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
        self.highlightedEdges = [];
        if (self.highlightEdges) {
            self.targetG.selectAll(`.${self.edgeClass}`)
                .attr("stroke", "#fc8d62" );

            if (self.highlightGroup=='protein') {
                self.targetG.selectAll(`.src_${self.highlightGroupName}`)
                    .attr("stroke", "#666" )
                    .attr("stroke-opacity", "0.5")
                    .each(function(){
                        this.parentNode.appendChild(this);
                        let curData = d3.select(this).datum();
                        self.highlightedEdges.push({'source': curData.source.data.name, 'target': curData.target.data.name})
                      });
                self.targetG.selectAll(`.tgt_${self.highlightGroupName}`)
                    .attr("stroke", "#666" )    
                    .attr("stroke-opacity", "0.5")
                    .each(function(){
                        this.parentNode.appendChild(this);
                        let curData = d3.select(this).datum();
                        self.highlightedEdges.push({'source': curData.source.data.name, 'target': curData.target.data.name})
                      });
                
            } else if (self.highlightGroup=='orf') {
                self.targetG.selectAll(`.src_${self.highlightGroupName}`)
                    .attr("stroke", "#666" )
                    .attr("stroke-opacity", "0.5")
                    .each(function(){
                        this.parentNode.appendChild(this);
                        let curData = d3.select(this).datum();
                        self.highlightedEdges.push({'source': curData.source.data.name, 'target': curData.target.data.name})
                      });
                self.targetG.selectAll(`.tgt_${self.highlightGroupName}`)
                    .attr("stroke", "#666" )    
                    .attr("stroke-opacity", "0.5")
                    .each(function(){
                        this.parentNode.appendChild(this);
                        let curData = d3.select(this).datum();
                        self.highlightedEdges.push({'source': curData.source.data.name, 'target': curData.target.data.name})
                      });
            }
        } else {
            self.targetG.selectAll(`.${self.edgeClass}`)
                .attr("stroke", "#fc8d62" ) 
        }
    }

    // Draw is called to create the visualization for the first time.
    function draw() {
        let cluster = d3.cluster()
                        .size([360, self.outerRadius]);

        self.line = d3.radialLine()
                        .curve(d3.curveBundle.beta(0.95))
                        .radius(function(d) { return d.y; })
                        .angle(function(d) { return d.x / 180 * Math.PI; });

        self.root = packageHierarchy(self.data).sum(function(d) { return d.size; });
        cluster(self.root);

        let edges = self.targetG.selectAll(`.${self.edgeClass}`)
                        .data(getEdges(self.root.leaves()));
                        
        edges.exit().remove();

        edges.enter().append("path")
            .each(function(d) { d.source = d[0], d.target = d[d.length - 1] })
                // .attr("id", (d,i) => `${d[self.edgeClass]}_${d.id}`)
                .attr("class", d => {
                    return `${self.edgeClass} src_${d.source.data.name.split('.')[1].split('_')[0]} tgt_${d.target.data.name.split('.')[1].split('_')[0]}`;
                })
                .attr("d", self.line)
                .attr("stroke", "#fc8d62" )    
                .attr("stroke-opacity", "0.1");
        
    }

    /******************************* Private Functions ***********************************/
    // Lazily construct the package hierarchy from class names.
    function packageHierarchy(classes) {
        var map = {};
    
        function find(name, data) {
        var node = map[name], i;
        if (!node) {
            node = map[name] = data || {name: name, children: []};
            if (name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
            }
        }
        return node;
        }
    
        classes.forEach(function(d) {
        find(d.name, d);
        });
    
        return d3.hierarchy(map[""]);
    }
    
    // Return a list of imports for the given array of nodes.
    function getEdges(nodes) {
        var map = {},
        connections = [];
    
        // Compute a map from name to node.
        nodes.forEach(function(d) {
        map[d.data.name] = d;
        });
    
        // For each import, construct a link from the source to target node.
        nodes.forEach(function(d) {
        if (d.data.connects) d.data.connects.forEach(function(i) {
            connections.push(map[d.data.name].path(map[i]));
        });
        });
    
        return connections;
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

    return {
        id,
        targetSvg,
        targetG,
        draw,
        update,

        data,
        highlight,
        edgeClassName,
        outerRadius,
        setRadialScale,
        setScaleAttr,
        setEdgeWidthScale,
        setEdgeColorScale,
        setEdgeWeightAttr,
        
        deletePlot,
        getHighlightedEdges
    };

}