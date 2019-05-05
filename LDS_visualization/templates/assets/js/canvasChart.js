window.onload = function() {
  var historyTopics = {};

  var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Twitter Trend"
    },
    legend: {
      cursor: "pointer",
      fontSize: 15,
      itemclick: toggleDataSeries
    },
    axisX: {
      interval: 1,
      interlacedColor: "#F8F1E4",
      labelFontSize: 0
    },
    axisY: {
      maximum: 15,
      interval: 2,
      gridThickness: 0.5,
      labelFontSize: 0
    },
    toolTip: {
      shared: true
    },
    data: [
      {
        dataPoints: [
          {
            x: 0,
            y: 0
          }
        ]
      }
    ]
  });
  chart.render();

  var xVal = 0;
  var dataLength = 20; // number of dataPoints visible at any point

  var xhr = new XMLHttpRequest();
  var url = "http://localhost:6789/gettrend";

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 3) {
      var respArr = xhr.responseText.split("}");
      var curResp = JSON.parse(respArr[respArr.length - 2] + "}");

      for (let c in curResp) {
        var dps = historyTopics[c] || [];

        dps.push({
          x: xVal,
          y: new Number(curResp[c]) * Math.pow(10, 12)
        });

        historyTopics[c] = dps;
      }

      for (let c in historyTopics) {
        var dps = historyTopics[c];
        if (dps[dps.length - 1].x != xVal) {
          if (
            dps.length > 2 &&
            dps[dps.length - 1].y === 0.0 &&
            dps[dps.length - 2].y === 0.0 &&
            dps[dps.length - 3].y === 0.0
          ) {
            delete historyTopics[c];
          } else {
            dps.push({
              x: xVal,
              y: 0
            });
          }
        }

        if (dps.length > dataLength) {
          dps.shift();
        }
      }

      xVal += 1;

      var curTopicData = [];
      for (let c in historyTopics) {
        curTopicData.push({
          name: c,
          type: "line",
          showInLegend: true,
          dataPoints: historyTopics[c]
        });
      }

      chart.options.data = curTopicData;
      chart.render();
    }
  };

  xhr.open("GET", url);
  xhr.send();
};

function toggleDataSeries(e) {
  if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }
}
