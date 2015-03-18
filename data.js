/* Stores all data from xml files in the scope */

function storeLiveBuses(scope, xmlDoc) {

  var count = xmlDoc.getElementsByTagName("BusID").length;
  var buses = [];
  for (i = 0; i < count; i++) {
    // Add each bus to the list
    buses[i] = {
      BusID : xmlDoc.getElementsByTagName("BusID")[i].childNodes[0].nodeValue,
      BusName : xmlDoc.getElementsByTagName("BusName")[i].childNodes[0].nodeValue,
      Latitude : xmlDoc.getElementsByTagName("Latitude")[i].childNodes[0].nodeValue,
      Longitude : xmlDoc.getElementsByTagName("Longitude")[i].childNodes[0].nodeValue,
      RouteID : xmlDoc.getElementsByTagName("RouteID")[i].childNodes[0].nodeValue,
      TripID : xmlDoc.getElementsByTagName("TripID")[i].childNodes[0].nodeValue,
      //Direction : xmlDoc.getElementsByTagName("Direction")[i].childNodes[0].nodeValue,
      ServiceDirection : xmlDoc.getElementsByTagName("ServiceDirection")[i].childNodes[0].nodeValue,
      Service : xmlDoc.getElementsByTagName("Service")[i].childNodes[0].nodeValue,
      ServiceName : xmlDoc.getElementsByTagName("ServiceName")[i].childNodes[0].nodeValue,
      TripHeadsign : xmlDoc.getElementsByTagName("TripHeadsign")[i].childNodes[0].nodeValue,
      LocationUpdated : xmlDoc.getElementsByTagName("LocationUpdated")[i].childNodes[0].nodeValue
    };
  }
  scope.buses = buses;
}

function storeBusRoutes(scope, xmlDoc) {

  var count = xmlDoc.getElementsByTagName("RouteID").length;
  var routes = [];
  for (i = 0; i < count; i++) {
    // Add each bus route to the scope
    routes[i] = {
      RouteID : xmlDoc.getElementsByTagName("RouteID")[i].childNodes[0].nodeValue,
      RouteAlias : xmlDoc.getElementsByTagName("RouteAlias")[i].childNodes[0].nodeValue,
      RouteAliasLong : xmlDoc.getElementsByTagName("RouteAliasLong")[i].childNodes[0].nodeValue,
      RouteDescription : xmlDoc.getElementsByTagName("RouteDescription")[i].childNodes[0].nodeValue,
      RouteColor : xmlDoc.getElementsByTagName("RouteColor")[i].childNodes[0].nodeValue,
      Bike : xmlDoc.getElementsByTagName("Bike")[i].childNodes[0].nodeValue,
      Wheelchair : xmlDoc.getElementsByTagName("Wheelchair")[i].childNodes[0].nodeValue,
      Metrorail : xmlDoc.getElementsByTagName("Metrorail")[i].childNodes[0].nodeValue,
      Airport : xmlDoc.getElementsByTagName("Airport")[i].childNodes[0].nodeValue,
      SortOrder : xmlDoc.getElementsByTagName("SortOrder")[i].childNodes[0].nodeValue
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
  var source = "http://miami.etaspot.net/service.php?service=get_vehicles";
  $.getJSON(
       'http://anyorigin.com/dev/get?url='+source+'&callback=?',
       (function(thisScope) {
          return function(data) {
            //if (debug) console.log("Data received. Displaying route from the Shape ID: "+thisshapeId);
            // Find the color for the route
            var trolleys = data.contents.get_vehicles;
            var count = trolleys.length;
            for (i = 0; i < count; i++) {
              addTrolleyMarker(
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

function addTrolleyMarker(lat, lng, equipmentID, routeID, receiveTime) {
  L.marker([lat, lng], {icon: trolleyIcon}).addTo(map).bindPopup(
      'Trolley # '+equipmentID+
      '<br />Route: '+routeID+
      '<br />Received Time: '+receiveTime,
      { offset: new L.Point(0, -16) });
}
