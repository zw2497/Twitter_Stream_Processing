var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3.8,
    center: { lat: 37, lng: -98 },
    //draggable: false
    //mapTypeId: 'hybrid'
    zoomControl: false,
    scaleControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.country',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'administrative.province',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'administrative.province',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'administrative.locality',
        elementType: 'geometry.stroke',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }]
      }
    ]
  });

  // Create a <script> tag and set the USGS URL as the source.
  var script = document.createElement('script');

  script.src = 'assets/js/geoData.js';
  document.getElementsByTagName('head')[0].appendChild(script);
}

function eqfeed_callback(results) {
  var heatmapData = [];

  for (var i = 0; i < results.length; i++) {
    var lat = results[i].lat;
    var lng = results[i].lng;
    var latLng = new google.maps.LatLng(lat, lng);
    heatmapData.push(latLng);
  }
  appendList(results);

  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    dissipating: false,
    map: map,
    radius: 1,
    gradient: [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 0, 223, 1)',
      'rgba(0, 0, 191, 1)',
      'rgba(0, 0, 159, 1)',
      'rgba(0, 0, 127, 1)'
    ]
  });
}

function appendList(results) {
  var tweetList = document.getElementById('tweetList');
  var locInfo = {};

  for (var i = 0; i < results.length; i++) {
    var listStr = `<li class="list-group-item list-group-item-action" 
                    id="${results[i].tid}">
                      ${results[i].text}
                   </li>`;
    locInfo[results[i].tid] = {
      lng: results[i].lng,
      lat: results[i].lat
    };
    tweetList.innerHTML = tweetList.innerHTML + listStr;
  }

  tweetList.addEventListener(
    'mouseover',
    function(event) {
      var curId = event.target.id;
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(
          locInfo[curId].lat,
          locInfo[curId].lng
        ),
        map: map
      });
    },
    false
  );
}
