const svg2 = d3
  .select(".canvas2")
  .append("svg")
  .attr("width", 700)
  .attr("height", 450);

const t2 = d3.transition().duration(2500);

// create margins and dimensions
const margin2 = { top: 20, right: 20, bottom: 40, left: 150 };
const graph2Width = 700 - margin2.left - margin2.right;
const graph2Height = 450 - margin2.top - margin2.bottom;

const graph2 = svg2
  .append("g")
  .attr("width", graph2Width)
  .attr("height", graph2Height)
  .attr("transform", `translate(${margin2.left},${margin2.top})`);
const texts2 = graph2.append("g");

const yAxisGroup2 = graph2.append("g");
// .selectAll("text")
// .attr("fill", "black")
// .attr("transform", "rotate(-40)")
// .attr("text-anchor", "end");

const x2 = d3.scaleLinear().range([0, graph2Width]);

const y2 = d3
  .scaleBand()
  .range([0, graph2Height])
  .paddingInner(0.2)
  .paddingOuter(0.2);

const yAxis2 = d3.axisLeft(y2);

const update2 = data2 => {
  const rects2 = graph2.selectAll("rect").data(data2);
  const text2 = texts2.selectAll("text").data(data2);

  y2.domain(data2.map(item2 => item2.tag));
  x2.domain([0, d3.max(data2, d => d.count)]);

  rects2.exit().remove();
  text2.exit().remove();

  rects2
    .attr("height", y2.bandwidth)
    .attr("fill", d => {
      if (d.sentiment > 0.5) {
        return "#b3e5fc";
      } else if (d.sentiment < 0.5) {
        return "#01579b";
      } else {
        return "#03a9f4";
      }
      // return inter(d.sentiment).colors[0];
    })
    .transition(t2)
    .attr("width", d => x2(d.count));

  rects2
    .enter()
    .append("rect")
    .attr("fill", d => {
      if (d.sentiment > 0.5) {
        return "#b3e5fc";
      } else if (d.sentiment < 0.5) {
        return "#01579b";
      } else {
        return "#03a9f4";
      }
      // return inter(d.sentiment).colors[0];
    })
    .attr("height", y2.bandwidth)
    .attr("width", 0)
    .attr("x", 0)
    .attr("y", d => y2(d.tag))
    .merge(rects2)
    .transition(t2)
    .attrTween("height", heightTween2)
    .attr("width", d => x2(d.count));

  text2
    .text(d => d.count)
    .attr("fill", "black")
    .attr("x", d => x2(d.count))
    .attr("y", d => {
      return y2(d.tag) + 20;
    })
    .attr("font-size", 20);
  // .attr("transform", `translate(${0}, ${5})`);

  text2
    .enter()
    .append("text")
    .attr("fill", "black")
    .text(d => d.count)
    .attr("x", d => x2(d.count))
    .attr("y", d => {
      return y2(d.tag) + 20;
    })
    .attr("font-size", 20);

  yGroup2 = yAxisGroup2.call(yAxis2);

  yGroup2
    .selectAll("text")
    .attr("fill", "black")
    .attr("transform", "rotate(-20)")
    .attr("text-anchor", "end")
    .attr("font-size", 15);
};

var data2 = [];
var totalData2 = [];

db.collection("topk10").onSnapshot(res => {
  res.docChanges().forEach(change => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added":
        totalData2.push(doc);
        break;

      case "modified":
        const index = totalData2.findIndex(item => item.id == doc.id);
        totalData2[index] = doc;
        break;

      case "removed":
        totalData2 = totalData2.filter(item => item.id !== doc.id);
        break;

      default:
        break;
    }
  });
  totalData2.sort(function(a, b) {
    return b.count - a.count;
  });

  update2(totalData2);
});

const heightTween2 = d => {
  let i2 = d3.interpolate(0, y2.bandwidth());

  return function(t2) {
    return i2(t2);
  };
};
