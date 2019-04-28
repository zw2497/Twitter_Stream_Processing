const svg = d3
  .select(".canvas1")
  .append("svg")
  .attr("width", 400)
  .attr("height", 400);
// const svg2 = d3
//   .select(".canvas2")
//   .append("svg")
//   .attr("width", 400)
//   .attr("height", 400);
const svg3 = d3
  .select(".canvas3")
  .append("svg")
  .attr("width", 400)
  .attr("height", 400);

// create margins and dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 50 };
const graphWidth = 400 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left},${margin.top})`);

const xAxisGroup = graph
  .append("g")
  .attr("transform", `translate(0, ${graphHeight})`);

xAxisGroup
  .selectAll("text")
  .attr("fill", "#a1887f")
  .attr("transform", "rotate(-40)")
  .attr("text-anchor", "end");

const yAxisGroup = graph.append("g");
//scales
const y = d3.scaleLinear().range([graphHeight, 0]);

const x = d3
  .scaleBand()
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);

const xAxis = d3.axisBottom(x);
const yAxis = d3
  .axisLeft(y)
  .ticks(3)
  .tickFormat(d => d + " times");

const t = d3.transition().duration(1500);

//update function
const update = data => {
  const rects = graph.selectAll("rect").data(data);

  rects.exit().remove();

  y.domain([0, d3.max(data, d => d.count)]);
  x.domain(data.map(item => item.tag));

  // update
  rects
    .attr("width", x.bandwidth)
    .attr("fill", "#e57373")
    .attr("x", d => x(d.tag));
  // .transition(t)
  //     .attr('height', d => graphHeight - y(d.count))
  //     .attr('y', d => y(d.count));

  rects
    .enter()
    .append("rect")
    .attr("height", 0)
    .attr("fill", "#e57373")
    .attr("x", d => x(d.tag))
    .attr("y", graphHeight)
    .merge(rects)
    .transition(t)
    .attrTween("width", widthTween)
    .attr("y", d => y(d.count))
    .attr("height", d => graphHeight - y(d.count));

  xGroup = xAxisGroup.call(xAxis);
  yGroup = yAxisGroup.call(yAxis);
  xGroup
    .selectAll("text")
    .attr("fill", "#e57373")
    .attr("transform", "rotate(-40)")
    .attr("text-anchor", "end");

  yGroup.selectAll("text").attr("fill", "#e57373");
};

// char 3

const graph3 = svg3
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left},${margin.top})`);
rect3 = svg3
  .append("rect")
  .attr("fill", "orange")
  .attr("width", 100)
  .attr("height", 100);

// chart 2
const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };

const svg2 = d3
  .select(".canvas2")
  .append("svg")
  .attr("width", 400)
  .attr("height", 400);

const graph2 = svg2
  .append("g")
  .attr("transform", `translate(${cent.x}, ${cent.y})`);

//return a function
const pie = d3
  .pie()
  .sort(null)
  .value(d => d.count);

// d3 generates the arc path for us
const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 4);

// var myColor = d3;
// .scaleSequential()
// .domain([1, 10])
// .interpolator(d3.interpolateViridis);

// var colour = d3.scaleOrdinal([
//   d3.interpolateRainbow(0.2),
//   d3.interpolateRainbow(0.25),
//   d3.interpolateRainbow(0.3),
//   d3.interpolateRainbow(0.4),
//   d3.interpolateRainbow(0.5)
// ]);

const colour = d3.scaleOrdinal(d3["schemeSet2"]);

const legendGroup = svg2
  .append("g")
  .attr("transform", `translate(${dims.width + 40}, 10)`);

const legend = d3
  .legendColor()
  .shape("path", d3.symbol().type(d3.symbolCircle)())
  .shapePadding(10)
  .scale(colour);

//update function
const update2 = data => {
  // update colour scale domin
  colour.domain(data.map(d => d.tag));

  legendGroup.call(legend);
  legendGroup.selectAll("text").attr("fill", "black");
  // join enhenced (pie) data to path elements
  const paths = graph2.selectAll("path").data(pie(data));
  //handle the exit selection
  paths
    .exit()
    .transition()
    .duration(750)
    .attrTween("d", arcTweenExit)
    .remove();

  //handle the current DOM path updates
  paths
    .attr("d", arcPath)
    .transition()
    .duration(750)
    .attrTween("d", arcTweenUpdate);
  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", d => colour(d.data.tag))
    .each(function(d) {
      this._current = d;
    })
    .transition()
    .duration(750)
    .attrTween("d", arcTweenEnter);
};

//data array for firestore
// var data2 = [];

// db.collection("test-topic").onSnapshot(res => {
//   res.docChanges().forEach(change => {
//     const doc = { ...change.doc.data(), id: change.doc.id };
//     switch (change.type) {
//       case "added":
//         data2.push(doc);
//         break;
//       case "modified":
//         const index = data2.findIndex(item => item.id == doc.id);
//         data2[index] = doc;
//         break;
//       case "removed":
//         data2 = data2.filter(item => item.id != doc.id);
//         break;
//       default:
//         break;
//     }
//   });

//   update2(data2);
// });

const arcTweenEnter = d => {
  var i = d3.interpolate(d.endAngle, d.startAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = d => {
  var i = d3.interpolate(d.startAngle, d.endAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

// use function keyword to allow use of this
function arcTweenUpdate(d) {
  // interpolate between the two objects
  var i = d3.interpolate(this._current, d);
  //update the current prop with new updated data
  this._current = i(1);

  return function(t) {
    return arcPath(i(t));
  };
}

var data = [];
var totalData = [];

db.collection("topk1")
  .orderBy("count", "desc")
  .onSnapshot(res => {
    res.docChanges().forEach(change => {
      const doc = { ...change.doc.data(), id: change.doc.id };

      switch (change.type) {
        case "added":
          totalData.push(doc);
          break;

        case "modified":
          const index = totalData.findIndex(item => item.id == doc.id);
          totalData[index] = doc;
          break;

        case "removed":
          totalData = totalData.filter(item => item.id !== doc.id);
          break;

        default:
          break;
      }
    });
    data = totalData.slice(0, 5);
    update(data);
    update2(data);
  });

const widthTween = d => {
  let i = d3.interpolate(0, x.bandwidth());

  return function(t) {
    return i(t);
  };
};
