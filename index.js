// Initialize map
var map = L.map('map').setView([25.795865,-80.287046], 11);
var test = false; // Whether in test mode or online
var debug = false; // Enable console debug messages

// Load MapBox map
var accessToken = 'pk.eyJ1IjoicXRyYW5kZXYiLCJhIjoiSDF2cGNjZyJ9.D1ybOKe77AQDPHkxCCEpJQ';
L.tileLayer('https://{s}.tiles.mapbox.com/v4/qtrandev.lc0i743k/{z}/{x}/{y}.png?access_token=' + accessToken, {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>'
}).addTo(map);
// Set up layers to allow user to control map display
var busLayer = new L.LayerGroup();
var busStopsLayer = new L.LayerGroup();
var poiLayer = new L.LayerGroup();
var trolleyLayer = new L.LayerGroup();
var trolleyStopsLayer = new L.LayerGroup();
L.control.layers({},{
    'Miami-Dade Transit Live Buses': busLayer,
    'Miami-Dade Transit Bus Stops': busStopsLayer,
    'Points of Interest': poiLayer,
    'Miami Trolleys': trolleyLayer,
    'Miami Trolley Stops': trolleyStopsLayer
}).addTo(map);
// Add certain layers as default to be shown
busLayer.addTo(map);
poiLayer.addTo(map);
trolleyLayer.addTo(map);

// Intialize bus icon
var myIcon = L.icon({
    iconUrl: 'mapIcon-Bus-Stop.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

// Trolley icon
var trolleyIcon = L.icon({
    iconUrl: 'trolley.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

// Keep track of each route ID, trip ID and its shape ID, and color of the route.
var tripRouteShapeRef = []; // Format is {tripId: "", routeId: "", shapeId: "", color: ""}

// Track which shape ID and the corresponding has already been displayed
var displayedShapeIds = [];

// Track all routes and their directions
var routeDirections = []; // Format is {routeId: "", "direction"}

// Track bus stops of each route-direction that has already been displayed
var displayedBusStops = [];

// Keep track of scope to refresh the page after data is received
var scope;

// Hold bus routes in array map to zoom when selecting route in bus stops table
var polylineMapping = [];

// Hold POIs in array map to allow zoom to a specifc POI
var poiMapping = [];

// Hold buses in array map to allow zoom to a specific bus
var busMapping = [];

if (!test) {
  // Bypass cross-origin remote server access linmitation using anyorigin.com - can set up a proxy web server instead
  angular.module('transitApp', []).controller('transitController', ['$scope', function($scope) {
    scope = $scope;
    $scope.tripRouteShapeRef = tripRouteShapeRef;
    }
  ]);
  setTimeout(
    function(data){
      var dataSource = "http://198.74.52.26/bus/livebus.php";
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.open("GET",dataSource,false);
      xmlhttp.send();
      xmlData=xmlhttp.responseText;
      $xml = $(xmlData)
      if ($xml.find("BusID").length > 0) {
        loadOnlineData(xmlData);
      } else {
        loadLocalData();
      }
    }, 0);
} else {
  loadLocalData();
}

// Run when data is available from the transit website
function loadOnlineData(xmlData) {
  generateBusList(xmlData, "REAL-TIME");
  loadRouteColors(); // Bus list must be loaded first
  displayRoutesFromTripId(tripRouteShapeRef); // Bus list must be loaded first to have the trip IDs
  showPOIs();
  getTrolleyData(scope);
  loadTrolleyRoutes();
  getTrolleyStops(scope);
}

// Load local data from Buses.xml file for local testing or when online data is unavailable
function loadLocalData() {
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET","Buses.xml",false);
  xmlhttp.send();
  xmlData=xmlhttp.responseXML;
  generateBusList(xmlData, "SAMPLE");
  loadRouteColors(); // Bus list must be loaded first
  displayRoutesFromTripId(tripRouteShapeRef); // Bus list must be loaded first to have the trip IDs
  showPOIs();
  getTrolleyData(scope);
  loadTrolleyRoutes();
  getTrolleyStops(scope);
  if (!test) {
    alert("Real-time data is unavailable. Check the Miami Transit website. Using sample data.");
  }
}

// Create buses list from Miami Transit XML file
function generateBusList(xmlDoc, realText) {
  storeLiveBuses(scope, xmlDoc);
  $xml = $( xmlDoc );
  $BusID = $xml.find("BusID");
  $BusName = $xml.find("BusName");
  $Latitude = $xml.find("Latitude");
  $Longitude = $xml.find("Longitude");
  $TripHeadsign = $xml.find("TripHeadsign");
  $LocationUpdated = $xml.find("LocationUpdated");
  $TripID = $xml.find("TripID");
  $RouteID = $xml.find("RouteID");
  $ServiceDirection = $xml.find("ServiceDirection");
  if (debug) console.log("BusID List length = "+$BusID.length);
  var i = 0;
  for (i = 0; i < $BusID.length; i++) {
    // Add each bus to the map
    addBusMarker(
      busLayer,
      $Latitude[i].textContent,
      $Longitude[i].textContent,
      $BusName[i].textContent,
      $TripHeadsign[i].textContent,
      $BusID[i].textContent,
      $LocationUpdated[i].textContent,
      realText
    );
    // Add to the global trip-route-shape list
    //console.log("Adding Trip ID to list: "+tripList[i].childNodes[0].nodeValue+" Trip list size = "+tripRouteShapeRef.length);
    tripRouteShapeRef[tripRouteShapeRef.length] = {
      tripId: $TripID[i].textContent,
      routeId: $RouteID[i].textContent,
      shapeId: ""
    };
    addRouteDirection($RouteID[i].textContent,$ServiceDirection[i].textContent);
  }
  scope.$apply();
}


function addRouteDirection(route, serviceDirection) {
  if (routeDirections.length > 0) {
    if (debug) console.log("routeDirections.length = "+routeDirections.length);
    var allowAdd = true;
    var i = 0;
    for (i = 0; i < routeDirections.length; i++) {
      if ((routeDirections[i].routeId == route) && (routeDirections[i].direction == serviceDirection)) {
        allowAdd = false;
        break;
      }
    }
    if (allowAdd) {
      routeDirections[routeDirections.length] = {routeId: route, direction: serviceDirection}; // Add if not a duplicate
      if (debug) console.log("Added route: "+route+" and direction: "+serviceDirection);
    }
  } else {
    routeDirections[0] = {routeId: route, direction: serviceDirection};
    scope.routeDir = route+' '+serviceDirection; // Set the first bus stop route-direction to show
    if (debug) console.log("Added route: "+route+" and direction: "+serviceDirection);
  }
}


function loadRouteColors() {
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET","BusRoutes.xml",false);
  xmlhttp.send();
  xmlData=xmlhttp.responseXML;

  storeBusRoutes(scope, xmlData);
  $xml = $( xmlData );
  $RouteID = $xml.find("RouteID");
  $RouteColor = $xml.find("RouteColor");
  var i = 0;
  for (i = 0; i < $RouteID.length; i++) {
    // Add to global ref list
    // Data format is {tripId: "", routeId: "", shapeId: "", color: ""}
    var route = $RouteID[i].textContent;
    for (j = 0; j < tripRouteShapeRef.length; j++) {
      if (tripRouteShapeRef[j].routeId == route) {
        tripRouteShapeRef[j].color = $RouteColor[i].textContent;
      }
    }
  }
  scope.$apply();
}

function addBusMarker(layer, lat, lon, name, desc, id, time, realText) {
  var marker = L.marker([lat, lon], {icon: myIcon}).bindPopup(
      realText+' ('+name+') Bus # '+desc+
      ' (ID: '+id+') <br /> Location Updated: '+time,
      { offset: new L.Point(0, -16) });
  marker.addTo(layer);
  busMapping[id] = marker;
}

function displayRoutesFromTripId(tripRefs) {
  if (debug) console.log("Trip refs length = "+tripRefs.length);
  var i = 0;
  for (i = 0; i < tripRefs.length; i++) {
    // Send the request to get the shape ID for each trip ID
    //if (debug) console.log("Sending request for shape ID with trip ID: "+tripRefs[i].tripId);
    var source = 'http://www.miamidade.gov/transit/WebServices/BusRouteShapesByTrip/?TripID='+tripRefs[i].tripId;
    $.getJSON(
         'http://anyorigin.com/dev/get?url='+source+'&callback=?',
         (function(thistripId) {
            return function(data) {
              var shapeId = $.parseXML(data.contents).getElementsByTagName("ShapeID")[0].childNodes[0].nodeValue;
        //if (debug) console.log("Shape ID retrieved: "+shapeId);
        var routeId;
        // Add shape ID into global trip reference list
        // Data format is {tripId: "", routeId: "", shapeId: "", color: ""}
        for (i = 0; i < tripRouteShapeRef.length; i++) {
          if (tripRouteShapeRef[i].tripId == thistripId) {
            tripRouteShapeRef[i].shapeId = shapeId;
            routeId = tripRouteShapeRef[i].routeId;
            //if (debug) console.log("Updated shape ID into global list for trip ID: "+tripRouteShapeRef[i].tripId);
            break; // Can break since a separate request is sent for each trip ID
          }
        }
        displayFromShapeId(shapeId, routeId);
            };
         }(tripRefs[i].tripId))
      );
  }
}

// Retrieve lat/long list for each route's shape ID
function displayFromShapeId(shapeId, routeId) {
  var source = 'http://www.miamidade.gov/transit/WebServices/BusRouteShape/?ShapeID='+shapeId;
  $.getJSON(
       'http://anyorigin.com/dev/get?url='+source+'&callback=?',
       (function(thisshapeId, thisRouteId) {
          return function(data) {
            //if (debug) console.log("Data received. Displaying route from the Shape ID: "+thisshapeId);
            // Find the color for the route
      var color = "";
      for (i = 0; i < tripRouteShapeRef.length; i++) {
        if (tripRouteShapeRef[i].shapeId == thisshapeId) {
          color = tripRouteShapeRef[i].color;
          break;
        }
      }

      if (displayedShapeIds.length == 0) { // Display the first shape ID
        addRoutePoints(busLayer, '#'+color, $.parseXML(data.contents), thisRouteId);
        addDisplayedShapeId(thisshapeId);
      } else { // Check for any duplicate shape ID and not display
        for (displayed in displayedShapeIds) {
          if (displayed == thisshapeId) break;
          addRoutePoints(busLayer, '#'+color, $.parseXML(data.contents), thisRouteId);
          addDisplayedShapeId(thisshapeId);
          break;
          //if (debug) console.log("Added new shapeId: "+thisshapeId);
        }
      }
      if (debug) console.log("tripRouteShapeRef length = "+tripRouteShapeRef.length);
      if (debug) console.log("displayedShapeIds length = "+displayedShapeIds.length);
          };
       }(shapeId, routeId))
    );
}

// Add all the route lines and colors to the map for each shape point list
function addRoutePoints(layer, routeColor, xmlDoc, routeId) {
  //if (debug) console.log("Added route points to map with color: "+routeColor);
  var latList = xmlDoc.getElementsByTagName("Latitude");
  var lonList = xmlDoc.getElementsByTagName("Longitude");
  var latlngs = [];
  if (debug) console.log("latList length = "+latList.length);
  for (i = 0; i < latList.length; i++) {
    //L.marker([latList[i].childNodes[0].nodeValue, lonList[i].childNodes[0].nodeValue], {icon: myIcon2}).addTo(map).bindPopup(
      //	'Route # '+route,
      //	{ offset: new L.Point(0, -20) });
    latlngs[latlngs.length] = (L.latLng(latList[i].childNodes[0].nodeValue, lonList[i].childNodes[0].nodeValue));
  }

  var markerLine = L.polyline(latlngs, {color: routeColor});
  markerLine.addTo(layer);
  polylineMapping[routeId] = markerLine;
}

// Track which shape ID has already been displayed
function addDisplayedShapeId(shapeId) {
  displayedShapeIds[displayedShapeIds.length] = shapeId;
  requestBusStops(shapeId);
}

function requestBusStops(shapeId) {
  if (debug) console.log("Requesting bus stops for "+shapeId);
  if (debug) console.log("tripRouteShapeRef length = "+tripRouteShapeRef.length);
  var i = 0;
  for (i = 0; i < tripRouteShapeRef.length; i++) {
    //if (debug) console.log("Inspecting item shape ID: "+tripRouteShapeRef[i].shapeId+" trip ID: "+tripRouteShapeRef[i].tripId);
    if (shapeId == tripRouteShapeRef[i].shapeId) {
      if (debug) console.log("Shape ID matched tripRouteShapeRef "+shapeId+" at index "+i+" of "+tripRouteShapeRef.length);
      if (debug) console.log("routeDirections.length = "+routeDirections.length);
      var j = 0;
      for (j = 0; j < routeDirections.length; j++) {
        var route = routeDirections[j].routeId;
        if (debug) console.log("Comparing routeDirections list route "+route+" against trip Ref list route: "+tripRouteShapeRef[i].routeId);
        if (route === tripRouteShapeRef[i].routeId) {
          if (debug) console.log("Route ID found "+route+ " at index "+j+" of "+routeDirections.length);
          sendBusStopRequest(route, routeDirections[j].direction);
          // break; Keep looking for Eastbound/Southbound and Clockwise/CntrClockwise
        }
      }
      break;
    }
  }

}

function sendBusStopRequest(route, direction) {
  if (debug) console.log("Requesting data for "+route+" and "+direction);

  // Ignore requested routes and directions
  if (displayedBusStops.indexOf(route+""+direction) > -1) {
    if (debug) console.log("Ignore "+route+" "+direction+" since it has already been requested.");
    return;
  }
  displayedBusStops[displayedBusStops.length] = route+""+direction;

  var source = "http://www.miamidade.gov/transit/WebServices/BusRouteStops/?RouteID="+route+"&Dir="+direction;
  //var source = "http://www.miamidade.gov/transit/WebServices/BusRouteStops/?RouteID=123&Dir=Clockwise"; // HARDCODE
  $.getJSON(
       'http://anyorigin.com/dev/get?url='+source+'&callback=?',
       (function(thisRoute, thisDirection) {
          return function(data) {
            if (debug) console.log("Data received. Displaying route bus stops for: "+thisRoute);

            var xmlDoc = $.parseXML(data.contents)
            if (xmlDoc.getElementsByTagName("Latitude").length == 0) {
              if (debug) console.log("No data on bus stops received for "+thisRoute+" "+thisDirection+". Getting local cached data.");
              var xmlhttp=new XMLHttpRequest();
        xmlhttp.open("GET","./localdata/"+thisRoute+thisDirection+".xml",false);
        xmlhttp.send();
        if (xmlhttp.status!=200) {
          console.log("No local file exists for "+thisRoute+" "+thisDirection+". Not displaying bus stops.");
          return;
        }
        xmlDoc=xmlhttp.responseXML;
        storeBusStop(scope, xmlDoc, thisRoute+" "+thisDirection);
        scope.$apply();
            }

            var latList = xmlDoc.getElementsByTagName("Latitude");
      var lonList = xmlDoc.getElementsByTagName("Longitude");
      var nameList = xmlDoc.getElementsByTagName("StopName");
      if (debug) console.log("latList.length = "+ nameList.length);
      var i = 0;
      for (i = 0; i < latList.length; i++) {
        // Add each bus stop to the map
        //if (debug) console.log("Add stop: "+nameList[i].childNodes[0].nodeValue);
        addBusStopMarker(
          busStopsLayer,
          latList[i].childNodes[0].nodeValue,
          lonList[i].childNodes[0].nodeValue,
          nameList[i].childNodes[0].nodeValue,
          thisRoute
        );
      }
          };
       }(route, direction))
    );
}

function addBusStopMarker(layer, lat, lon, name, route) {
  var marker = L.circleMarker(L.latLng(lat, lon), {color: 'green', radius: 8}).bindPopup(
      'Route: '+route+' Bus Stop: '+name,
      { offset: new L.Point(0, 0) });
  marker.addTo(layer);
  /*
  L.marker([lat, lon], {icon: myIcon2}).addTo(map).bindPopup(
      'Bus Stop: '+name+' Route: '+ route,
      { offset: new L.Point(0, -20) });
  // */
}

function showPOIs() {
  var source = 'http://www.miamidade.gov/transit/WebServices/PointsOfInterest/?PointID=';
  $.getJSON(
       'http://anyorigin.com/dev/get?url='+source+'&callback=?',
       (function(input) {
          return function(data) {

            if (debug) console.log("POI Data received.");
            var xmlDoc = $.parseXML(data.contents);
            storePOIs(scope, xmlDoc);
            scope.$apply();

            var latList = xmlDoc.getElementsByTagName("Latitude");
            var lonList = xmlDoc.getElementsByTagName("Longitude");
            var nameList = xmlDoc.getElementsByTagName("PointName");
            var idList = xmlDoc.getElementsByTagName("PointID");
            var catList = xmlDoc.getElementsByTagName("CategoryID");
            if (debug) console.log("latList.length = "+ nameList.length);
            var i = 0;
            for (i = 0; i < latList.length; i++) {
              // Add each bus stop to the map
              //if (debug) console.log("Add stop: "+nameList[i].childNodes[0].nodeValue);
              addPOIMarker(
                poiLayer,
                latList[i].childNodes[0].nodeValue,
                lonList[i].childNodes[0].nodeValue,
                nameList[i].childNodes[0].nodeValue,
                idList[i].childNodes[0].nodeValue,
                catList[i].childNodes[0].nodeValue
              );
            }
          };
       }("POI"))
    );
}

function addPOIMarker(layer, lat, lon, name, poiId, catId) {
  var poiIcon = L.icon({
      iconUrl: 'icons/icon-POI-'+catId+'.png',
      iconSize: [33, 33], // Normal size is 44x44
      iconAnchor: [16, 33]
  });
  var marker = L.marker([lat, lon], {icon: poiIcon, zIndexOffset: -1000}).bindPopup(
      name,
      { offset: new L.Point(0, -16) });
  layer.addLayer(marker);
  poiMapping[poiId] = marker;
}
