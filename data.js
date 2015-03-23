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
  }
  scope.buses = buses;
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
  var marker = L.marker([lat, lng], {icon: trolleyIcon}).addTo(map).bindPopup(
      'Trolley # '+equipmentID+
      '<br />Route: '+routeID+
      '<br />Received Time: '+receiveTime,
      { offset: new L.Point(0, -16) });
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
                trolleyLayer,
                stops[i].lat,
                stops[i].lng,
                stops[i].name,
                stops[i].id
              );
            }
            trolleyLayer.addTo(map);
            scope.stops = stops;
          };
       }(scope))
    );
}

function addTrolleyStopMarker(layer, lat, lon, name, id) {
  var marker = L.circleMarker(L.latLng(lat, lon), {color: 'blue', radius: 8}).bindPopup(
      'Stop ID: '+id+'<br />Stop Name: '+name,
      { offset: new L.Point(0, 0) });;
  marker.addTo(layer);
}
