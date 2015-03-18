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

  var count = xmlDoc.getElementsByTagName("PointID").length;
  var POIs = [];
  for (i = 0; i < count; i++) {
    // Add each POI to the array in the scope
    POIs[i] = {
      PointID : xmlDoc.getElementsByTagName("PointID")[i].childNodes[0].nodeValue,
      CategoryID : xmlDoc.getElementsByTagName("CategoryID")[i].childNodes[0].nodeValue,
      CategoryName : xmlDoc.getElementsByTagName("CategoryName")[i].childNodes[0].nodeValue,
      PointName : xmlDoc.getElementsByTagName("PointName")[i].childNodes[0].nodeValue,
      Address : xmlDoc.getElementsByTagName("Address")[i].childNodes[0].nodeValue,
      City : xmlDoc.getElementsByTagName("City")[i].childNodes[0].nodeValue,
      State : xmlDoc.getElementsByTagName("State")[i].childNodes[0].nodeValue,
      Zip : xmlDoc.getElementsByTagName("Zip")[i].childNodes[0].nodeValue,
      Latitude : xmlDoc.getElementsByTagName("Latitude")[i].childNodes[0].nodeValue,
      Longitude : xmlDoc.getElementsByTagName("Longitude")[i].childNodes[0].nodeValue,
      svLatitude : xmlDoc.getElementsByTagName("svLatitude")[i].childNodes[0].nodeValue,
      svLongitude : xmlDoc.getElementsByTagName("svLongitude")[i].childNodes[0].nodeValue,
      svHeading : xmlDoc.getElementsByTagName("svHeading")[i].childNodes[0].nodeValue
    };
  }
  scope.POIs = POIs;
}

function storeBusStop(scope, xmlDoc, routeDir) {

  if (!scope.busStops) scope.busStops = [];
  var count = xmlDoc.getElementsByTagName("StopID").length;
  var stops = [];
  for (i = 0; i < count; i++) {
    // Add each POI to the array in the scope
    stops[i] = {
      StopID : xmlDoc.getElementsByTagName("StopID")[i].childNodes[0].nodeValue,
      StopName : xmlDoc.getElementsByTagName("StopName")[i].childNodes[0].nodeValue,
      Sequence : xmlDoc.getElementsByTagName("Sequence")[i].childNodes[0].nodeValue
    };
  }
  scope.busStops[routeDir] = stops;
}
