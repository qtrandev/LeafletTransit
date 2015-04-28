// Initialize map
var map = L.map('map').setView([25.795865,-80.287046], 11);
var test = false; // Whether in test mode or online
var debug = false; // Enable console debug messages

// Load MapBox map
var accessToken = 'pk.eyJ1IjoicXRyYW5kZXYiLCJhIjoiSDF2cGNjZyJ9.D1ybOKe77AQDPHkxCCEpJQ';
var osmLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/qtrandev.lc0i743k/{z}/{x}/{y}.png?access_token=' + accessToken, {
  maxZoom: 20,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>'
});
osmLayer.addTo(map);

// Set up Google Maps layers
var googleRoadmap = new L.Google('ROADMAP', { maxZoom: 20 });
var googleHybrid = new L.Google('HYBRID', { maxZoom: 20 });
var googleTraffic = new L.GoogleTraffic('ROADMAP', { maxZoom: 20 });

// Set up layers to allow user to control map display
var busLayer = new L.LayerGroup();
var busStopsLayer = new L.LayerGroup();
var metroRailLayer = new L.LayerGroup();
var poiLayer = new L.LayerGroup();
var trolleyLayer = new L.LayerGroup();
var trolleyStopsLayer = new L.LayerGroup();
var bikeLayer = new L.LayerGroup();
var nearbyLayer = new L.LayerGroup();
var doralTrolleyLayer = new L.LayerGroup();
var miamiBeachTrolleyLayer = new L.LayerGroup();
var miamiTransitAPILayer = new L.LayerGroup();
L.control.layers({'Open Street Map':osmLayer, 'Google Maps':googleRoadmap, 'Google Maps Satellite':googleHybrid, 'Google Maps Traffic':googleTraffic},{
    'Miami-Dade Transit Live Buses': busLayer,
    'Miami-Dade Transit Bus Stops': busStopsLayer,
    'Miami-Dade Transit Metro Rail': metroRailLayer,
    'Points of Interest': poiLayer,
    'Miami Trolleys': trolleyLayer,
    'Miami Trolley Stops': trolleyStopsLayer,
    'Miami Beach Trolleys': miamiBeachTrolleyLayer,
    'Doral Trolleys': doralTrolleyLayer,
    'Citi Bikes': bikeLayer,
    'Miami Transit API Bus GPS': miamiTransitAPILayer,
}).addTo(map);
// Add certain layers as default to be shown
busLayer.addTo(map);
metroRailLayer.addTo(map);
poiLayer.addTo(map);
trolleyLayer.addTo(map);
bikeLayer.addTo(map);
nearbyLayer.addTo(map);
doralTrolleyLayer.addTo(map);
miamiBeachTrolleyLayer.addTo(map);
//miamiTransitAPILayer.addTo(map);

// Button to allow user to locate current position
L.control.locate({ locateOptions: { maxZoom: 15 }}).addTo(map);

// Intialize bus icon
var busIcon = L.icon({
    iconUrl: 'icons/icon-Bus-Tracker.png',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
});

// Intialize blue bus icon
var busIconBlue = L.icon({
    iconUrl: 'icons/icon-Bus-Tracker-blue.png',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
});

// Intialize aqua bus icon
var busIconAqua = L.icon({
    iconUrl: 'icons/icon-Bus-Tracker-aqua.png',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
});

// Intialize bus stop icon
var busStopIcon = L.icon({
    iconUrl: 'icons/icon-Bus-Stop.png',
    iconSize: [22, 22],
    iconAnchor: [11, 22]
});

// Intialize Metrorail icon
var metroRailIcon = L.icon({
    iconUrl: 'icons/icon-Rail-Tracker.png',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
});

// Intialize Metrorail station icon
var metroRailStationIcon = L.icon({
    iconUrl: 'icons/icon-Rail-Station.png',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

// Trolley icon
var trolleyIcon = L.icon({
    iconUrl: 'icons/icon-Trolley-Tracker.png',
    iconSize: [44, 44],
    iconAnchor: [22, 44]
});

// Trolley stop icon
var trolleyStopIcon = L.icon({
    iconUrl: 'icons/icon-Trolley-Stop.png',
    iconSize: [22, 22],
    iconAnchor: [11, 22]
});

// Citi bike icon
var bikeIcon = L.icon({
    iconUrl: 'icons/citibikepin.png',
    iconSize: [33, 42],
    iconAnchor: [16, 42]
});

// POI icon
var poiIcon = L.icon({
    iconUrl: 'icons/icon-POI.png',
    iconSize: [44, 44],
    iconAnchor: [22, 38]
});

// Doral trolley icon
var doralTrolleyIcon = L.icon({
    iconUrl: 'icons/doral-bus.png',
    iconSize: [28, 45],
    iconAnchor: [14, 45]
});

// Doral trolley route icon
var TSOTrolleyrouteIcon = L.icon({
    iconUrl: 'icons/doral-bus-stop.png',
    iconSize: [15, 15],
    iconAnchor: [7, 15]
});

// Miami Beach trolley icon
var miamiBeachTrolleyIcon = L.icon({
    iconUrl: 'icons/miamibeach-bus.png',
    iconSize: [28, 45],
    iconAnchor: [14, 45]
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

// Cache nearby markers to remove later
var nearbyCache = [];

// Track the city to receive trolley information
var cityTrolley = "";

// Refresh time for Miami Transit API
var refreshTime = 5000;

// Cache Miami Transit API markers
var miamiTransitAPIMarkers = [];

// Base URL for API server
var apiURL = 'https://miami-transit-api.herokuapp.com/';

if (!test) {
  // Bypass cross-origin remote server access linmitation using anyorigin.com - can set up a proxy web server instead
  angular.module('transitApp', []).controller('transitController', ['$scope', function($scope) {
    scope = $scope;
    $scope.tripRouteShapeRef = tripRouteShapeRef;
    $scope.refreshTime = refreshTime;
    }
  ]);
  setTimeout(
    function(data){
      var dataSource = apiURL + 'api/Buses.xml';
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.open("GET",dataSource,false);
      try {
        xmlhttp.send();
        xmlData=xmlhttp.responseText;
        $xml = $(xmlData);
        if ($xml.find("BusID").length > 0) {
          loadOnlineData(xmlData);
        } else {
          loadLocalData();
        }
      }
      catch(err) {
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
  getCitiBikes();
  addDoralTrolleys();
  addDoralTrolleyRoutes();
  addMetroRail();
  addMetroRailRoutes();
  addMetroRailStations();
  addMiamiBeachTrolleys();
  addMiamiBeachTrolleyRoutes();
  // Refresh Miami Transit API data every 5 seconds
  setInterval(function() {
    callMiamiTransitAPI();
  }, refreshTime);
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
  getCitiBikes();
  addDoralTrolleys();
  addDoralTrolleyRoutes();
  addMetroRail();
  addMetroRailRoutes();
  addMetroRailStations();
  addMiamiBeachTrolleys();
  addMiamiBeachTrolleyRoutes();
  // Refresh Miami Transit API data every 5 seconds
  setInterval(function() {
    callMiamiTransitAPI();
  }, refreshTime);
  if (!test) {
    alert("Real-time data is unavailable. Check the Miami Transit website. Using sample data.");
  }
}

function callMiamiTransitAPI() {
  if (miamiTransitAPIMarkers.length > 0) {
    var i = 0;
    for (i = 0; i < miamiTransitAPIMarkers.length; i++) {
      map.removeLayer(miamiTransitAPIMarkers[i]);
    }
    miamiTransitAPIMarkers.length = 0; // Clear array
  }
  setTimeout(function(){
    // Wait 1 second before adding back the markers on the map
    loadBusTrackingGPSData();
    loadMiamiTransitAPIBuses();
  },1000);
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
  var marker = L.marker([lat, lon], {icon: busIcon}).bindPopup(
      realText+' ('+name+') Bus # '+desc+
      ' (ID: '+id+') <br /> Location Updated: '+time,
      { offset: new L.Point(0, 0) });
  marker.addTo(layer);
  busMapping[id] = marker;

  var marker2 = L.circleMarker(L.latLng(lat, lon), {color: 'aqua', radius: 23});
  marker2.addTo(layer);
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

      if (displayedShapeIds.length === 0) { // Display the first shape ID
        addRoutePoints(busLayer, '#'+color, $.parseXML(data.contents), thisRouteId);
        addDisplayedShapeId(thisshapeId);
      } else { // Check for any duplicate shape ID and not display
        for (var displayed in displayedShapeIds) {
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

            var xmlDoc = $.parseXML(data.contents);
            if (xmlDoc.getElementsByTagName("Latitude").length === 0) {
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
  // var marker = L.circleMarker(L.latLng(lat, lon), {color: 'green', radius: 8}).bindPopup(
  //    'Route: '+route+' Bus Stop: '+name,
  //    { offset: new L.Point(0, 0) });

  var marker = L.marker([lat, lon], {icon: busStopIcon, zIndexOffset: -100}).bindPopup(
    'Route: '+route+' Bus Stop: '+name,
    { offset: new L.Point(0, 0) });
  marker.addTo(layer);
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

            $xml = $( xmlDoc );
            $PointID = $xml.find("PointID");
            $CategoryID = $xml.find("CategoryID");
            $CategoryName = $xml.find("CategoryName");
            $PointName = $xml.find("PointName");
            $Address = $xml.find("Address");
            $City = $xml.find("City");
            $State = $xml.find("State");
            $Zip = $xml.find("Zip");
            $Latitude = $xml.find("Latitude");
            $Longitude = $xml.find("Longitude");
            $svLatitude = $xml.find("svLatitude");
            $svLongitude = $xml.find("svLongitude");
            $svHeading = $xml.find("svHeading");

            var i = 0;
            for (i = 0; i < $Latitude.length; i++) {
              var address =
                $Address[i].textContent + '<br>' +
                $City[i].textContent + ', ' +
                $State[i].textContent + ' ' +
                $Zip[i].textContent;
              addPOIMarker(
                poiLayer,
                $Latitude[i].textContent,
                $Longitude[i].textContent,
                $PointName[i].textContent,
                $PointID[i].textContent,
                $CategoryID[i].textContent,
                $CategoryName[i].textContent,
                address
              );
            }
          };
       }("POI"))
    );
}

function addPOIMarker(layer, lat, lon, name, poiId, catId, catName, address) {
  var poiIcon = L.icon({
      iconUrl: 'icons/icon-POI-'+catId+'.png',
      iconSize: [33, 33], // Normal size is 44x44
      iconAnchor: [16, 33]
  });
  var marker = L.marker([lat, lon], {icon: poiIcon, zIndexOffset: -1000}).bindPopup(
      '<strong>' + catName + '</strong><br><br>' + name + '<br>' +  address,
      { offset: new L.Point(0, -16) });
  layer.addLayer(marker);
  poiMapping[poiId] = marker;
}

/* Stores all data from xml files in the scope */

function storeLiveBuses(scope, xmlDoc) {

  $xml = $( xmlDoc );
  $BusID = $xml.find("BusID");
  $BusName = $xml.find("BusName");
  $Latitude = $xml.find("Latitude");
  $Longitude = $xml.find("Longitude");
  $RouteID = $xml.find("RouteID");
  $TripID = $xml.find("TripID");
  //$Direction = $xml.find("Direction");
  $ServiceDirection = $xml.find("ServiceDirection");
  $Service = $xml.find("Service");
  $ServiceName = $xml.find("ServiceName");
  $TripHeadsign = $xml.find("TripHeadsign");
  $LocationUpdated = $xml.find("LocationUpdated");

  var count = $BusID.length;
  var buses = [];
  var uniqueBusRoutes = [];
  for (i = 0; i < count; i++) {
    // Add each bus to the list
    buses[i] = {
      BusID : $BusID[i].textContent,
      BusName : $BusName[i].textContent,
      Latitude : $Latitude[i].textContent,
      Longitude : $Longitude[i].textContent,
      RouteID : $RouteID[i].textContent,
      TripID : $TripID[i].textContent,
      //Direction : $Direction[i].textContent,
      ServiceDirection : $ServiceDirection[i].textContent,
      Service : $Service[i].textContent,
      ServiceName : $ServiceName[i].textContent,
      TripHeadsign : $TripHeadsign[i].textContent,
      LocationUpdated : $LocationUpdated[i].textContent
    };

    // Filter out unique buses to display in bus stops table dropdown
    var routeId = $RouteID[i].textContent;
    var serviceDirection = $ServiceDirection[i].textContent;
    var unique = true;
    if (uniqueBusRoutes.length > 0) {
      var j =0;
      for (j = 0; j < uniqueBusRoutes.length; j++) {
        if ((uniqueBusRoutes[j].RouteID === routeId) && (uniqueBusRoutes[j].ServiceDirection === serviceDirection)) {
          // Found duplicate, don't add
          unique = false;
          break;
        }
      }
    }
    if (unique) {
      uniqueBusRoutes.push({
        RouteID : routeId,
        ServiceDirection : serviceDirection
      });
    }
  }
  scope.buses = buses;
  scope.uniqueBusRoutes = uniqueBusRoutes;
}

function storeBusRoutes(scope, xmlDoc) {

  $xml = $( xmlDoc );
  $RouteID = $xml.find("RouteID");
  $RouteAlias = $xml.find("RouteAlias");
  $RouteAliasLong = $xml.find("RouteAliasLong");
  $RouteDescription = $xml.find("RouteDescription");
  $RouteColor = $xml.find("RouteColor");
  $Bike = $xml.find("Bike");
  $Wheelchair = $xml.find("Wheelchair");
  $Metrorail = $xml.find("Metrorail");
  $Airport = $xml.find("Airport");
  $SortOrder = $xml.find("SortOrder");
  var count = $RouteID.length;
  var routes = [];
  for (i = 0; i < count; i++) {
    // Add each bus route to the scope
    routes[i] = {
      RouteID : $RouteID[i].textContent,
      RouteAlias : $RouteAlias[i].textContent,
      RouteAliasLong : $RouteAliasLong[i].textContent,
      RouteDescription : $RouteDescription[i].textContent,
      RouteColor : $RouteColor[i].textContent,
      Bike : $Bike[i].textContent,
      Wheelchair : $Wheelchair[i].textContent,
      Metrorail : $Metrorail[i].textContent,
      Airport : $Airport[i].textContent,
      SortOrder : $SortOrder[i].textContent
    };
  }
  scope.routes = routes;
}

function storePOIs(scope, xmlDoc) {

  $xml = $( xmlDoc );
  $PointID = $xml.find("PointID");
  $CategoryID = $xml.find("CategoryID");
  $CategoryName = $xml.find("CategoryName");
  $PointName = $xml.find("PointName");
  $Address = $xml.find("Address");
  $City = $xml.find("City");
  $State = $xml.find("State");
  $Zip = $xml.find("Zip");
  $Latitude = $xml.find("Latitude");
  $Longitude = $xml.find("Longitude");
  $svLatitude = $xml.find("svLatitude");
  $svLongitude = $xml.find("svLongitude");
  $svHeading = $xml.find("svHeading");

  var count = $PointID.length;
  var POIs = [];
  for (i = 0; i < count; i++) {
    // Add each POI to the array in the scope
    POIs[i] = {
      PointID : $PointID[i].textContent,
      CategoryID : $CategoryID[i].textContent,
      CategoryName : $CategoryName[i].textContent,
      PointName : $PointName[i].textContent,
      Address : $Address[i].textContent,
      City : $City[i].textContent,
      State : $State[i].textContent,
      Zip : $Zip[i].textContent,
      Latitude : $Latitude[i].textContent,
      Longitude : $Longitude[i].textContent,
      svLatitude : $svLatitude[i].textContent,
      svLongitude : $svLongitude[i].textContent,
      svHeading : $svHeading[i].textContent
    };
  }
  scope.POIs = POIs;
}

function storeBusStop(scope, xmlDoc, routeDir) {

  if (!scope.busStops) scope.busStops = [];

  $xml = $( xmlDoc );
  $StopID = $xml.find("StopID");
  $StopName = $xml.find("StopName");
  $Sequence = $xml.find("Sequence");
  var count = $StopID.length;
  var stops = [];
  for (i = 0; i < count; i++) {
    // Add each POI to the array in the scope
    stops[i] = {
      StopID : $StopID[i].textContent,
      StopName : $StopName[i].textContent,
      Sequence : $Sequence[i].textContent
    };
  }
  scope.busStops[routeDir] = stops;
}

function getTrolleyData(scope) {
  var source = "http://miami.etaspot.net/service.php?service=get_vehicles&includeETAData=1&orderedETAArray=1&token=TESTING";
  $.getJSON(
       'http://anyorigin.com/dev/get?url='+source+'&callback=?',
       (function(thisScope) {
          return function(data) {
            var trolleys = data.contents.get_vehicles;
            var count = trolleys.length;
            for (i = 0; i < count; i++) {
              trolleys[i].receiveTime = (new Date(trolleys[i].receiveTime)).toLocaleString();
              addTrolleyMarker(
                trolleyLayer,
                trolleys[i].lat,
                trolleys[i].lng,
                trolleys[i].equipmentID,
                trolleys[i].routeID,
                trolleys[i].receiveTime
              );
            }
            scope.trolleys = trolleys;
          };
       }(scope))
    );
}

function addTrolleyMarker(layer, lat, lng, equipmentID, routeID, receiveTime) {
  var marker = L.marker([lat, lng], {icon: trolleyIcon}).bindPopup(
      'Trolley # '+equipmentID+
      '<br />Route: '+routeID+
      '<br />Received Time: '+receiveTime,
      { offset: new L.Point(0, -22) });
  marker.addTo(layer);
}

function loadTrolleyRoutes() {
  $.getJSON('routeCoords.json',
  function(data) {
    var i = 1;
    for (i = 1; i < 8; i++) {
      var color = data[i].color.normal;
      displayTrolleyRouteColors(trolleyLayer, color, data[i].coords);
    }
  });
}

function displayTrolleyRouteColors(layer, color, coords) {
  var latlngs = [];
  for (i = 0; i < coords.length; i++) {
    latlngs.push(L.latLng(coords[i][1], coords[i][0]));
  }

  var lineMarker = L.polyline(latlngs, {color: '#'+color});
  lineMarker.addTo(layer);
}

function getTrolleyStops(scope) {
  var source = "http://miami.etaspot.net/service.php?service=get_stops&includeETAData=1&orderedETAArray=1&token=TESTING";
  $.getJSON(
       'http://anyorigin.com/dev/get?url='+source+'&callback=?',
       (function(thisScope) {
          return function(data) {
            var stops = data.contents.get_stops;
            var count = stops.length;
            for (i = 0; i < count; i++) {
              addTrolleyStopMarker(
                trolleyStopsLayer,
                stops[i].lat,
                stops[i].lng,
                stops[i].name,
                stops[i].id
              );
            }
            scope.stops = stops;
          };
       }(scope))
    );
}

function addTrolleyStopMarker(layer, lat, lon, name, id) {
  var marker = L.marker([lat, lon], {icon: trolleyStopIcon, zIndexOffset: -110}).bindPopup(
    'Stop ID: '+id+'<br />Stop Name: '+name,
    { offset: new L.Point(0, 0) });
  marker.addTo(layer);
}

function routeChanged(rd) {
  scope.routeDir = rd;
  scope.$apply();
  var routeId = rd.split(" ")[0];
  focusRoute(routeId);
}

function focusPOI(poiIdLatLng) {
  var array = poiIdLatLng.split(",");
  var poiId = array[0];
  var lat = array[1];
  var lng = array[2];
  map.fitBounds(L.latLngBounds([poiMapping[poiId].getLatLng()]));
  poiMapping[poiId].openPopup();
  window.scrollTo(0, 0);
  getNearBy(poiId,lat,lng);
}

function focusRoute(routeId) {
  map.fitBounds(polylineMapping[routeId].getBounds());
  window.scrollTo(0, 0);
}

function focusBus(busId) {
  map.fitBounds(L.latLngBounds([busMapping[busId].getLatLng()]));
  busMapping[busId].openPopup();
  window.scrollTo(0, 0);
}

function getCitiBikes() {
  var source = "http://citibikemiami.com/downtown-miami-locations.xml";
  $.getJSON(
       'http://anyorigin.com/dev/get?url='+source+'&callback=?',
       (function(thisScope) {
        return function(data) {
          var xmlDoc = $.parseXML(data.contents);
          $xml = $( xmlDoc );

          $Id = $xml.find("Id");
          $Address = $xml.find("Address");
          $Distance = $xml.find("Distance");
          $Latitude = $xml.find("Latitude");
          $Longitude = $xml.find("Longitude");
          $Bikes = $xml.find("Bikes");
          $Dockings = $xml.find("Dockings");
          var i = 0;
          for (i = 0; i < $Id.length; i++) {
            addBikeMarker(
              bikeLayer,
              $Latitude[i].textContent,
              $Longitude[i].textContent,
              $Id[i].textContent,
              $Address[i].textContent,
              $Bikes[i].textContent,
              $Dockings[i].textContent
            );
          }
        };
      }(scope))
  );
}

function addBikeMarker(layer, lat, lng, id, address, bikes, dockings) {
  var marker = L.marker([lat, lng], {icon: bikeIcon, zIndexOffset: -500}).bindPopup(
      '<strong>Citi Bike Station ID: ' + id + '</strong><br><br>Address: ' + address + '<br>Bikes: ' +  bikes + '<br>Dockings: ' +  dockings,
      { offset: new L.Point(0, -21) });
  layer.addLayer(marker);
}

function getNearBy(poiId, lat, lng) {
  var source = "http://www.miamidade.gov/transit/WebServices/Nearby/?Lat="+lat+"&Long="+lng;
  //var source = "http://www.miamidade.gov/transit/WebServices/PointsOfInterestTransit/?PointID="+poiId;
  console.log("POI ID: "+poiId);
  console.log(source);
  processCachedNearby(poiId, lat, lng); //temp
  return; //temp
  $.getJSON(
    'http://anyorigin.com/dev/get?url='+source+'&callback=?',
    (function(thisScope, thisPOI) {
      return function(data) {
        console.log(data.contents);
        var xmlDoc = $.parseXML(data.contents);
        $xml = $( xmlDoc );

        $NearbyID = $xml.find("NearbyID");
        if ($NearbyID.length > 0) {
          console.log("Exit since we don't have code yet");
          return;
        } else {
          processCachedNearby(thisPOI, lat, lng);
        }
      };
    }(scope, poiId))
  );
}

function processCachedNearby(poiId, lat, lng) {
  var i = 0;
  if (nearbyCache.length > 0) {
    for (i = 0; i < nearbyCache.length; i++) {
      map.removeLayer(nearbyCache[i]);
    }
  }
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET","./nearby/"+poiId+".xml",false);
  xmlhttp.send();
  if (xmlhttp.status!=200) {
    console.log("No local file exists for POI ID "+poiId+". Not displaying POI info.");
    return;
  }
  xmlDoc=xmlhttp.responseXML;
  $xml = $( xmlDoc );

  $NearbyID = $xml.find("NearbyID");
  $NearbyName = $xml.find("NearbyName");
  $NearbyType = $xml.find("NearbyType");
  $Descr = $xml.find("Descr");
  $Distance = $xml.find("Distance");
  $Latitude = $xml.find("Latitude");
  $Longitude = $xml.find("Longitude");
  nearbyCache = [];
  var bounds = [];
  i = 0;
  for (i = 0; i < $NearbyID.length; i++) {
    addNearByMarker(
      nearbyLayer,
      $NearbyID[i].textContent,
      $NearbyName[i].textContent,
      $NearbyType[i].textContent,
      $Descr[i].textContent,
      $Distance[i].textContent,
      $Latitude[i].textContent,
      $Longitude[i].textContent,
      lat,
      lng
    );
    bounds[i] = [$Latitude[i].textContent,$Longitude[i].textContent];
  }
  map.fitBounds(bounds);
}

function addNearByMarker(layer, NearbyID, NearbyName, NearbyType, Descr, Distance, Latitude, Longitude, sourceLat, sourceLng) {
  var marker = L.marker([Latitude, Longitude], {icon: poiIcon, zIndexOffset: 10}).bindPopup(
    '<strong>'+NearbyType+'</strong><br /><br />'+
    'Name: '+NearbyName+
    '<br />Description: '+Descr+
    '<br />Distance: <strong>'+Distance+'</strong>'+
    '<br />Nearby ID: '+NearbyID,
    { offset: new L.Point(0, -22) });
  marker.on('mouseover', function (e) {
    this.openPopup();
  });
  marker.addTo(layer);
  nearbyCache.push(marker);
  var latlngs = [L.latLng(Latitude, Longitude), L.latLng(sourceLat, sourceLng)];
  var markerLine = L.polyline(latlngs, {color: 'aqua'});
  markerLine.addTo(layer);
  nearbyCache.push(markerLine);
}

function addDoralTrolleys() {
  var api = 'http://rest.tsoapi.com/';
  var controller = 'MappingController';
  var methodName = 'GetUnitFromRouteAntibunching';

  var data = [];
  var doraltkn = '582EB861-9C13-4C89-B491-15F0AFBF9F47';
  data[0] = { tkn: doraltkn, geofencesid: '35929', lan: 'en' };
  data[1] = { tkn: doraltkn, geofencesid: '36257', lan: 'en' };
  data[2] = { tkn: doraltkn, geofencesid: '36270', lan: 'en' };

  sendTSOTrolleyRequest(api, controller, methodName, data[0], handleDoralTrolleyCallback);
  sendTSOTrolleyRequest(api, controller, methodName, data[1], handleDoralTrolleyCallback);
  sendTSOTrolleyRequest(api, controller, methodName, data[2], handleDoralTrolleyCallback);
}

function sendTSOTrolleyRequest(api, controller, methodName, data, callback) {
  $.ajax({
    url: api + "/" + controller + "/" + methodName,
    data: data,
    type: "POST",
    contentType: "application/javascript",
    dataType: "jsonp",
    success: function (data, textStatus) {
        //console.log(data);
        callback(data);
    },
    error: function (xhr, status, errorThrown) {
        console.log(xhr.statusText);
    }
  });
}

function handleDoralTrolleyCallback(data) {
  var obj = jQuery.parseJSON(data);
  var trolleys = obj.Units;
  var i = 0;
  for (i = 0; i < trolleys.length; i++) {
    addDoralTrolleyMarker(
      doralTrolleyLayer,
      trolleys[i].MarkerID,
      trolleys[i].MarkerName,
      trolleys[i].Latitude,
      trolleys[i].Longitude,
      trolleys[i].Direction,
      trolleys[i].Heading
    );
  }
}

function addDoralTrolleyMarker(layer, MarkerID, MarkerName, Latitude, Longitude, Direction, Heading) {
  var marker = L.marker([Latitude, Longitude], {icon: doralTrolleyIcon, zIndexOffset: 100}).bindPopup(
      '<strong>Doral Trolley ' + MarkerName + '</strong><br><br>ID: ' + MarkerID + '<br>Direction: ' +  Direction,
      { offset: new L.Point(0, -22) });
  layer.addLayer(marker);
}

function addMiamiBeachTrolleyRoutes() {
  // Add delay since there's a sharing bug with Doral route-getting code
  setTimeout(
    function(){
      cityTrolley = "Miami Beach";
      addTSOTrolleyRoutes('825894C5-2B5F-402D-A055-88F2297AF99A');
    }, 2000);
}

function addDoralTrolleyRoutes() {
  cityTrolley = "Doral";
  addTSOTrolleyRoutes('582EB861-9C13-4C89-B491-15F0AFBF9F47');
}

function addTSOTrolleyRoutes(tkn) {
  var api = 'http://rest.tsoapi.com/';
  var controller = 'Routes';
  var methodName = 'GetRouteFromToken';

  var data = { tkn: tkn, routeId: '-1'};

  sendTSOTrolleyRequest(api, controller, methodName, data, handleTSORoutesCallback);
}

function handleTSORoutesCallback(data) {
  var obj = jQuery.parseJSON(data);

  /** Example:
  "ID": "662978",
  "ContactID": "2047762",
  "StopNumber": "3001",
  "Street": "7701 Northwest 79th Avenue 7701 Northwest 79th Avenue",
  "City": "Miami",
  "State": "FL",
  "PostalCode": "33166",
  "CountryCode": "US",
  "Sequence": "1",
  "Latitude": "25.843700",
  "Longitude": "-80.323900",
  "Description": "Palmetto Metrorail Station, Transfers to Route 2, MDT MetroRail Green Line & Route 87",
  "RouteId": "36270"
  */
  var stops = obj.stops;

  /** Example:
  "Name": "Doral Transportation",
  "MapType": "MAP",
  "MapImageURL": "MapImage_CityOfDoral.png",
  "RouteId": "35929",
  "ShowAutomatically": "True",
  "Name1": "Public Doral Route #1",
  "LineColor": "#3A77C7",
  "RoutePath": "oxj|CnijiNF..."
  */
  var routes = obj.routes;

  /** Example:
  "Id": "166461",
  "RouteId": "36257",
  "Lat": "25.8443000000",
  "Lng": "-80.3237000000",
  "Direction": "W ",
  "Angle": "-90.000000",
  "StopA": "729094",
  "StopB": "729095",
  "Seq": "0",
  "DesignerStopID": "729094",
  "OriginalLat": "25.8443000000",
  "OriginalLng": "-80.3237000000",
  "AudioID": "156"
  */
  var points = obj.points;

  var layer = doralTrolleyLayer;
  if (cityTrolley === "Miami Beach") {
    layer = miamiBeachTrolleyLayer;
  }

  var i = 0;
  for (i = 0; i < stops.length; i++) {
    addTSOTrolleyRouteStops(layer, stops[i], routes);
  }

  addTSOTrolleyRouteLines(layer, points, routes);
}

function addTSOTrolleyRouteStops(layer, stop, routes) {
  // Match the stop with the route
  var routeLineColor;
  var routeName;
  var i = 0;
  for (i = 0; i < routes.length; i++) {
    if (stop.RouteId == routes[i].RouteId) {
      routeLineColor = routes[i].LineColor;
      routeName = routes[i].Name1;
      break;
    }
  }

  var marker = L.marker([stop.Latitude, stop.Longitude], {icon: TSOTrolleyrouteIcon, zIndexOffset: -100}).bindPopup(
      '<strong>' + cityTrolley + ' Trolley Stop ' + stop.StopNumber + '</strong>' +
      '<br><br>' + stop.Description +
      '<br><br>' + stop.Street +
      '<br>' + stop.City + ', ' + stop.State + ' ' + stop.PostalCode +
      '<br><span style="color:'+ routeLineColor +'">Route ID: ' + stop.RouteId + "</span>" +
      '<br><span style="color:'+ routeLineColor +'">Route Name: ' + routeName + "</span>" +
      '<br>Sequence: ' + stop.Sequence +
      '<br>ID: ' + stop.ID +
      '<br>ContactID: ' + stop.ContactID,
      { offset: new L.Point(0, 0) });
  layer.addLayer(marker);
}

function addTSOTrolleyRouteLines(layer, points, routes) {
  // Map the RouteId with the color for easy lookup
  var routeColorMap = [];
  var i = 0;
  for (i = 0; i < routes.length; i++) {
    routeColorMap[routes[i].RouteId] = {LineColor: routes[i].LineColor, Points: []};
  }

  // Separate points for each route
  i = 0;
  for (i = 0; i < points.length; i++) {
    routeColorMap[points[i].RouteId].Points.push(L.latLng(points[i].Lat, points[i].Lng));
  }

  for (var routeId in routeColorMap) {
    var markerLine = L.polyline(routeColorMap[routeId].Points, {color: routeColorMap[routeId].LineColor});
    layer.addLayer(markerLine);
  }
}

function addMetroRail() {
  $.getJSON(apiURL + 'api/Trains.json',
  function(data) {
    var records = data.RecordSet.Record;
    var i = 0;
    for (i = 0; i < records.length; i++) {
      addMetroRailMarker(
        metroRailLayer,
        records[i].Latitude,
        records[i].Longitude,
        records[i].TrainID,
        records[i].LineID,
        records[i].Cars,
        records[i].Direction,
        records[i].ServiceDirection,
        records[i].LocationUpdated
        );
    }
  });
}

function addMetroRailMarker(layer, Latitude, Longitude, TrainID, LineID, Cars, Direction, ServiceDirection, LocationUpdated) {
  var marker = L.marker([Latitude, Longitude], {icon: metroRailIcon, zIndexOffset: 100}).bindPopup(
      '<strong>Metro Rail Train ' + TrainID +
      '<br>Line: ' + LineID +
      '</strong><br><br>Cars: ' + Cars +
      '<br>Direction: ' +  Direction +
      '<br>Service Direction: ' + ServiceDirection +
      '<br>Location Updated: ' + LocationUpdated,
      { offset: new L.Point(0, 0) });
  layer.addLayer(marker);
}

function addMetroRailRoutes() {
  $.getJSON(apiURL + 'api/TrainMapShape.json',
  function(data) {
    var records = data.RecordSet.Record;
    var greenLineLatLngs = [];
    var orangeLineLatLngs = [];
    var i = 0;
    for (i = 0; i < records.length; i++) {
      if (records[i].LineID === "GRN") {
        greenLineLatLngs.push(L.latLng(records[i].Latitude, records[i].Longitude));
      } else {
        orangeLineLatLngs.push(L.latLng(records[i].Latitude, records[i].Longitude));
      }
    }
    addMetroRailRouteColors(
      metroRailLayer,
      greenLineLatLngs,
      "green"
    );
    addMetroRailRouteColors(
      metroRailLayer,
      orangeLineLatLngs,
      "orange"
    );
  });
}

function addMetroRailRouteColors(layer, latlngs, color) {
  var lineMarker = L.polyline(latlngs, {color: color});
  lineMarker.addTo(layer);
}

function addMetroRailStations() {
  $.getJSON(apiURL + 'api/TrainStations.json',
  function(data) {
    var records = data.RecordSet.Record;
    var i = 0;
    for (i = 0; i < records.length; i++) {
      addMetroRailStationMarker(
        metroRailLayer,
        records[i].Latitude,
        records[i].Longitude,
        records[i].StationIDshow,
        records[i].Station,
        records[i].Address + "<br>" + records[i].City + ", " + records[i].State + " " + records[i].Zip,
        records[i].Parking,
        records[i].ConnectingOther,
        records[i].PlacesOfInterest,
        records[i].Other,
        records[i].Airport,
        records[i].TriRail,
        records[i].LongTermParking,
        records[i].svLatitude,
        records[i].svLongitude,
        records[i].svHeading
        );
    }
  });
}

function addMetroRailStationMarker(
    layer,
    Latitude,
    Longitude,
    StationIDshow,
    Station,
    Address,
    Parking,
    ConnectingOther,
    PlacesOfInterest,
    Other,
    Airport,
    TriRail,
    LongTermParking,
    svLatitude,
    svLongitude,
    svHeading) {
  var marker = L.marker([Latitude, Longitude], {icon: metroRailStationIcon, zIndexOffset: -100}).bindPopup(
      '<strong>' + StationIDshow +
      '<br>' + Station +
      '</strong><br><br>' + Address +
      '<br><br>Parking: ' +  Parking +
      '<br>Long-Term Parking: ' + LongTermParking +
      '<br>Airport: ' + Airport +
      '<br>TriRail: ' + TriRail +
      '<br>Places of Interest: ' + PlacesOfInterest +
      '<br>Other: ' + Other +
      '<br>Connecting Other: ' + ConnectingOther,
      { offset: new L.Point(0, 0) });
  layer.addLayer(marker);
}

function addMiamiBeachTrolleys() {
  var api = 'http://rest.tsoapi.com/';
  var controller = 'MappingController';
  var methodName = 'GetUnitFromRouteAntibunching';

  var data = [];
  var miamibeachtkn = '825894C5-2B5F-402D-A055-88F2297AF99A';
  data[0] = { tkn: miamibeachtkn, geofencesid: '38836', lan: 'en' };
  data[1] = { tkn: miamibeachtkn, geofencesid: '40756', lan: 'en' };

  sendTSOTrolleyRequest(api, controller, methodName, data[0], handleMiamiBeachTrolleyCallback);
  sendTSOTrolleyRequest(api, controller, methodName, data[1], handleMiamiBeachTrolleyCallback);
}

function handleMiamiBeachTrolleyCallback(data) {
  var obj = jQuery.parseJSON(data);
  var trolleys = obj.Units;
  var i = 0;
  for (i = 0; i < trolleys.length; i++) {
    addMiamiBeachTrolleyMarker(
      miamiBeachTrolleyLayer,
      trolleys[i].MarkerID,
      trolleys[i].MarkerName,
      trolleys[i].Latitude,
      trolleys[i].Longitude,
      trolleys[i].Direction,
      trolleys[i].Heading
    );
  }
}

function addMiamiBeachTrolleyMarker(layer, MarkerID, MarkerName, Latitude, Longitude, Direction, Heading) {
  var marker = L.marker([Latitude, Longitude], {icon: miamiBeachTrolleyIcon, zIndexOffset: 100}).bindPopup(
      '<strong>Miami Beach Trolley ' + MarkerName + '</strong><br><br>ID: ' + MarkerID + '<br>Direction: ' +  Direction,
      { offset: new L.Point(0, -22) });
  layer.addLayer(marker);
}

function loadBusTrackingGPSData() {
  $.getJSON(apiURL+'tracker.json',
  function(data) {
    var i = 0;
    for (i = 0; i < data.features.length; i++) {
      addBusTrackingGPSMarker(
        miamiTransitAPILayer,
        data.features[i].properties.lat,
        data.features[i].properties.lon,
		data.features[i].properties.speed,
        data.features[i].properties.bustime);
    }
  });
}

function addBusTrackingGPSMarker(layer, lat, lon, speed, bustime) {
  try {
    var marker = L.marker([lat, lon], {icon: busIconBlue}).bindPopup(
        '<strong>Bus Tracking GPS</strong>'+
		'<br /><br />Speed: ' +speed,
        '<br /><br />Bus Time: '+bustime,
        { offset: new L.Point(0, -22) });
    marker.addTo(layer);
    miamiTransitAPIMarkers.push(marker);
  } catch (e) {
    console.log("Cannot add marker in addBusTrackingGPSMarker. Lat: "+lat+" Lon: "+lon+" Error: "+e);
  }
}

function loadMiamiTransitAPIBuses() {
  $.getJSON(apiURL+'buses.json',
  function(data) {
    var i = 0;
    for (i = 0; i < data.RecordSet.Record.length; i++) {
      addMiamiTransitAPIBusesMarker(
        miamiTransitAPILayer,
        data.RecordSet.Record[i].BusID,
        data.RecordSet.Record[i].BusName,
        data.RecordSet.Record[i].Latitude,
        data.RecordSet.Record[i].Longitude,
        data.RecordSet.Record[i].RouteID,
        data.RecordSet.Record[i].TripID,
        data.RecordSet.Record[i].Direction,
        data.RecordSet.Record[i].ServiceDirection,
        data.RecordSet.Record[i].Service,
        data.RecordSet.Record[i].ServiceName,
        data.RecordSet.Record[i].TripHeadsign,
        data.RecordSet.Record[i].LocationUpdated);
    }
  });
}

function addMiamiTransitAPIBusesMarker(
  layer, BusID, BusName, Latitude, Longitude, RouteID, TripID, Direction,
  ServiceDirection, Service, ServiceName, TripHeadsign, LocationUpdated) {
  var marker = L.marker([Latitude, Longitude], {icon: busIconAqua}).bindPopup(
      '<strong>Miami Transit API Bus</strong>' +
      '<br/><br/>Bus ID: ' + BusID +
      '<br/>Bus Name: ' + BusName +
      '<br/>Trip ID: ' + TripID +
      '<br/>Trip: ' + TripHeadsign +
      '<br/>Service: ' + Service +
      '<br/>Service Name: ' + ServiceName +
      '<br/>Service Direction: ' + ServiceDirection +
      '<br/>Location Updated: ' + LocationUpdated,
      { offset: new L.Point(0, -22) });
  marker.addTo(layer);
  miamiTransitAPIMarkers.push(marker);
}
