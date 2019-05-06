const t = d3.transition().duration(2500);

const svg = d3
  .select('.canvas1')
  .append('svg')
  .attr('width', 700)
  .attr('height', 450);

// create margins and dimensions
const margin = { top: 20, right: 20, bottom: 40, left: 150 };
const graphWidth = 700 - margin.left - margin.right;
const graphHeight = 450 - margin.top - margin.bottom;

const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left},${margin.top})`);

const yAxisGroup = graph.append('g');
const texts = graph.append('g');

const x = d3.scaleLinear().range([0, graphWidth]);

const y = d3
  .scaleBand()
  .range([0, graphHeight])
  .paddingInner(0.2)
  .paddingOuter(0.2);

const yAxis = d3.axisLeft(y);

yGroup = yAxisGroup.call(yAxis);

yGroup
  .selectAll('text')
  .attr('fill', 'black')
  .attr('transform', 'rotate(-20)')
  .attr('text-anchor', 'end');

// update the data
const update = data => {
  const rects = graph.selectAll('rect').data(data);
  const text = texts.selectAll('text').data(data);
  // text = text.selectAll("text").data(data);

  y.domain(data.map(item => item.tag));
  x.domain([0, d3.max(data, d => d.count)]);

  // console.log(y.bandwidth);

  rects.exit().remove();
  text.exit().remove();

  rects
    .attr('height', y.bandwidth)
    .attr('fill', d => {
      if (d.sentiment > 0.5) {
        return '#b3e5fc';
      } else if (d.sentiment < 0.5) {
        return '#01579b';
      } else {
        return '#03a9f4';
      }
      // return inter(d.sentiment).colors[0];
    })
    .transition(t)
    .attr('width', d => x(d.count));

  rects
    .enter()
    .append('rect')
    .attr('fill', d => {
      if (d.sentiment > 0.5) {
        return '#b3e5fc';
      } else if (d.sentiment < 0.5) {
        return '#01579b';
      } else {
        return '#03a9f4';
      }
      // return inter(d.sentiment).colors[0];
    })
    .attr('height', y.bandwidth)
    .attr('width', 0)
    .attr('x', 0)
    .attr('y', d => y(d.tag))
    .merge(rects)
    .transition(t)
    .attrTween('height', heightTween)
    .attr('width', d => x(d.count));

  text
    .text(d => d.count)
    .attr('fill', 'black')
    .attr('font-size', 20);

  text
    .enter()
    .append('text')
    .attr('fill', 'black')
    .merge(text)
    .transition(t)
    .text(d => d.count)
    .attr('x', d => x(d.count))
    .attr('y', d => {
      return y(d.tag) + 20;
    })
    .attr('font-size', 20);

  yGroup = yAxisGroup.call(yAxis);

  yGroup
    .selectAll('text')
    .attr('font-size', 15)
    .attr('fill', 'black')
    .attr('transform', 'rotate(-20)')
    .attr('text-anchor', 'end');
};

var totalData = [];

db.collection('topk1').onSnapshot(res => {
  res.docChanges().forEach(change => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
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

  totalData.sort(function(a, b) {
    return b.count - a.count;
  });
  update(totalData);
  updateList(totalData);
});

const heightTween = d => {
  let i = d3.interpolate(0, y.bandwidth());

  return function(t) {
    return i(t);
  };
};

function updateList(topicData) {
  var listView = document.getElementById('table-body-1');
  for (let i in topicData) {
    var listStr = `<tr>
    <td>${topicData[i].tag}</td>
    <td>${topicData[i].count}</td>
   
    </tr>`;
    listView.innerHTML += listStr;
    document.getElementById('list-topics').scrollTop = listView.scrollHeight;
  }
}
