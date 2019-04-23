// create the svg in js file
//var instance = M.Tabs.init(el, options);
const svg = d3.select('.canvas')
    .append('svg')
        .attr('width', 400)
        .attr('height', 400);

// create margins and dimensions
const margin = {top: 20, right: 20, bottom: 100, left: 50};
const graphWidth = 400 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

const graph = svg.append('g')
                .attr('width', graphWidth)
                .attr('height', graphHeight)
                .attr('transform', `translate(${margin.left},${margin.top})`);

const xAxisGroup = graph.append('g')
                        .attr('transform', `translate(0, ${graphHeight})`);

xAxisGroup.selectAll('text')
    .attr('fill', '#a1887f')
    .attr('transform', 'rotate(-40)')
    .attr('text-anchor', 'end');

const yAxisGroup = graph.append('g');

//scales
const y = d3.scaleLinear()
    .range([graphHeight, 0]);

const x = d3.scaleBand()
    .range([0, graphWidth])
    .paddingInner(0.2)
    .paddingOuter(0.2);

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
    .ticks(3)
    .tickFormat(d => d + ' times');


const t = d3.transition().duration(1500);

//update function
const update = (data) => {

    const rects = graph.selectAll('rect')
                    .data(data);

    rects.exit().remove();
    
    y.domain([0, d3.max(data, d => d.count)]);
    x.domain(data.map(item => item.tag));



    // update 
    rects.attr('width', x.bandwidth)
        .attr('fill', '#b71c1c')
        .attr('x',  d => x(d.tag));
        // .transition(t)
        //     .attr('height', d => graphHeight - y(d.count))
        //     .attr('y', d => y(d.count));

    rects.enter()
        .append('rect')
        .attr('height', 0)
        .attr('fill', '#e57373')
        .attr('x',  d => x(d.tag))
        .attr('y', graphHeight)
        .merge(rects)
        .transition(t)
            .attrTween('width', widthTween)
            .attr('y', d => y(d.count))
            .attr('height', d => graphHeight - y(d.count));

    
    xGroup = xAxisGroup.call(xAxis);
    yGroup = yAxisGroup.call(yAxis);
    xGroup.selectAll('text')
    .attr('fill', '#a1887f')
    .attr('transform', 'rotate(-40)')
    .attr('text-anchor', 'end');

    yGroup.selectAll('text')
    .attr('fill', '#a1887f');
    
};

var data = [];
var totalData = [];

db.collection('topics').orderBy("count", "desc").onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = {...change.doc.data(), id: change.doc.id};

        switch(change.type) {
            case 'added':
                totalData.push(doc);
                break;

            case 'modified':
                const index = totalData.findIndex(item => item.id == doc.id);
                totalData[index] = doc;
                break;

            case 'removed':
                totalData = totalData.filter(item => item.id !== doc.id);
                break;

            default:
                break;
        }
    });
    data = totalData.slice(0,5);
    update(data);
});

const widthTween = (d) => {

    // 0 is the starting position and x.bandwidth is the ending postition
    let i = d3.interpolate(0, x.bandwidth());

    return function(t) {
        return i(t);
    }
}