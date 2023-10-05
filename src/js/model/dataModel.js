"use strict"

var App = App || {};

let DataModel = function(fielIndex) {
    let self = {
        data: null,
        ORFs: null,
        proteins: null,
        dataFileIndex: fielIndex
    };

    function loadData() {
        return Promise.all([d3.json(`./data/categorical_variants_viz_json/index${self.dataFileIndex}_sequence.json`, {credentials: 'same-origin'}),
                            d3.json(`./data/categorical_variants_viz_json/index${self.dataFileIndex}_position_probability.json`, {credentials: 'same-origin'}),
                            d3.json(`./data/categorical_variants_viz_json/index${self.dataFileIndex}_position_attention_1.json`, {credentials: 'same-origin'}),
                            // d3.json(`./data/four_strains_viz_json/TestData.json`, {credentials: 'same-origin'}),
                            d3.json("./data/ORFs.json", {credentials: 'same-origin'}),
                            d3.json("./data/proteinsequence.json", {credentials: 'same-origin'})])
            .then(files => {
                self.data = {'sequence': files[0].sequence, 'probability': files[1].position_probability, 'interpair_attention':files[2]};
                self.data['IDs'] = Array.from(Array(self.data.sequence.length).keys())
                self.data.interpair_attention.forEach((e,i) => e.id=i);
                self.ORFs = files[3];
                self.proteins = files[4];
                self.data.interpair_attention = transformToHierarchy();
                // console.log(d3.extent(files[1].position_probability));
            })
    }

    function getData() {
        return self.data;
    }

    function getORFData() {
        return self.ORFs;
    }

    function getProteinData() {
        return self.proteins;
    }

    function getDataFileIndex() {
        return self.dataFileIndex;
    }

    function transformToHierarchy() {
        let top = [], prev_i=-1; 
        
        self.proteins.forEach((p,k) => {
            if (p.name=='empty') {
                let orfs = self.ORFs.filter(o => o.start<=p.start && o.end>=p.end);
                if (orfs.length==1) {
                    for (let i = Math.ceil(p.start/3); i <= Math.floor(p.end/3); i++) {
                        if (prev_i>=i) continue;
                        top.push({"name":`gene.${orfs[0].name_short}_${k}.${self.data.IDs[i]}`, "connects":[], "weights":[]});
                        prev_i=i;
                    }
                }else {
                    orfs = self.ORFs.filter(o => p.start<=o.start && p.end>=o.end);
                    orfs.forEach((o,j) => {
                        for (let i = Math.ceil(o.start/3); i <= Math.floor(o.end/3); i++) {
                            if (prev_i>=i) continue;
                            if (i<self.data.IDs.length)
                                top.push({"name":`gene.${o.name_short}_${k}_${j}.${self.data.IDs[i]}`, "connects":[], "weights":[]});
                            prev_i=i;
                        }
                    })
                }
            } else {
                for (let i = Math.ceil(p.start/3); i <= Math.floor(p.end/3); i++) {
                    if (prev_i>=i) continue;
                    top.push({"name":`gene.${p.name}.${self.data.IDs[i]}`, "connects":[], "weights":[]});
                    prev_i=i;
                }
            }
        })

        self.data.interpair_attention.forEach(e => {
            let srcs = top[e.pos1].name.split('.'), tgts = top[e.pos2].name.split('.');
            if (srcs[1]!=tgts[1]) {
                top[e.pos1].connects.push(top[e.pos2].name);
                top[e.pos1].weights.push(e.value);
            }
        })
        // var a = document.createElement("a");
        // var file = new Blob([JSON.stringify(top)], {type: "text/plain"});
        // a.href = URL.createObjectURL(file);
        // a.download = "sample.json";
        // a.click();
        // console.log(top);
        return top;
    }

    return {
        loadData,
        getData,
        getORFData,
        getProteinData,
        getDataFileIndex,
    };
}