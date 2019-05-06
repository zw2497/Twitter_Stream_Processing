function sendQuery() {
  var startDate = document.getElementById('startTime');
  var endDate = document.getElementById('endTime');

  var xhr = new XMLHttpRequest();
  var url = 'http://localhost:6789/getquery';
  var params = new FormData();
  params.append('start', startDate.value);
  params.append('end', endDate.value);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        alert('Getting data from Bigquery!');
      }
    }
  };

  xhr.open('POST', url, true);
  xhr.send(params);
}
