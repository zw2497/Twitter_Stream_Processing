function sendQuery() {
  var startDate = document.getElementById('startTime');
  var endDate = document.getElementById('endTime');

  var xhr = new XMLHttpRequest();
  var url = 'http://localhost:6789/getquery';
  var params = new FormData();
  params.append('start', startDate.value);
  params.append('end', endDate.value);

  xhr.onreadystatechange = function() {};

  xhr.open('POST', url, true);
  xhr.send(params);
}
