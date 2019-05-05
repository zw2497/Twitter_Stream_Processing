function wordCloud() {
  var fill = d3.scale.category10();

  //Construct the word cloud's SVG element
  var svg = d3
    .select(".canvas2")
    .append("svg")
    .attr("width", 500)
    .attr("height", 500)
    .append("g")
    .attr("transform", "translate(150,250)");

  //Draw the word cloud
  function draw(words) {
    var cloud = svg.selectAll("g text").data(words, function(d) {
      return d.text;
    });

    //Entering words
    cloud
      .enter()
      .append("text")
      .style("font-family", "Impact")
      .style("fill", function(d, i) {
        return fill(i);
      })
      .attr("text-anchor", "middle")
      .attr("font-size", 1)
      .text(function(d) {
        return d.text;
      });

    //Entering and existing words
    cloud
      .transition()
      .duration(600)
      .style("font-size", function(d) {
        return d.size + "px";
      })
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .style("fill-opacity", 1);

    //Exiting words
    cloud
      .exit()
      .transition()
      .duration(200)
      .style("fill-opacity", 1e-6)
      .attr("font-size", 1)
      .remove();
  }

  return {
    update: function(words) {
      d3.layout
        .cloud()
        .size([500, 500])
        .words(words)
        .padding(5)
        .rotate(function() {
          return ~~(Math.random() * 2) * 90;
        })
        .font("Impact")
        .fontSize(function(d) {
          return d.size;
        })
        .on("end", draw)
        .start();
    }
  };
}

function getWords(words) {
  return words
    .replace(/[!\.,:;\?]/g, "")
    .split(" ")
    .map(function(d) {
      return { text: d, size: 10 + Math.random() * 60 };
    });
}
function showNewWords(vis) {
  var totalData = [];

  db.collection("topk10")
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
      var words2 = "";
      console.log(totalData);
      for (let i in totalData) {
        words2 += totalData[i].tag + " ";
      }
      //   console.log(words);
      vis.update(getWords(words2));
    });
}

//Create a new instance of the word cloud visualisation.
var myWordCloud = wordCloud();

//Start cycling through the demo data
showNewWords(myWordCloud);
