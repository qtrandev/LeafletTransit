/* Stores all data from xml files in the scope */

function storeLiveBuses(scope, xmlDoc) {

  var idList = xmlDoc.getElementsByTagName("BusID");
  var nameList = xmlDoc.getElementsByTagName("BusName");
  var latList = xmlDoc.getElementsByTagName("Latitude");
  var lonList = xmlDoc.getElementsByTagName("Longitude");
  var routeList = xmlDoc.getElementsByTagName("RouteID");
  var tripList = xmlDoc.getElementsByTagName("TripID");
  var directionList = xmlDoc.getElementsByTagName("Direction");
  var serviceDirectionList = xmlDoc.getElementsByTagName("ServiceDirection");
  var serviceList = xmlDoc.getElementsByTagName("Service");
  var serviceNameList = xmlDoc.getElementsByTagName("ServiceName");
  var descList = xmlDoc.getElementsByTagName("TripHeadsign");
  var timeList = xmlDoc.getElementsByTagName("LocationUpdated");

  if (debug) console.log("idList length = "+idList.length);
  var i = 0;
  var buses = [];
  for (i = 0; i < idList.length; i++) {
    // Add each bus to the list
    buses[i] = {
      BusID : idList[i].childNodes[0].nodeValue,
      BusName : nameList[i].childNodes[0].nodeValue,
      Latitude : latList[i].childNodes[0].nodeValue,
      Longitude : lonList[i].childNodes[0].nodeValue,
      RouteID : routeList[i].childNodes[0].nodeValue,
      TripID : tripList[i].childNodes[0].nodeValue,
      //Direction : directionList[i].childNodes[0].nodeValue,
      ServiceDirection : serviceDirectionList[i].childNodes[0].nodeValue,
      Service : serviceList[i].childNodes[0].nodeValue,
      ServiceName : serviceNameList[i].childNodes[0].nodeValue,
      TripHeadsign : descList[i].childNodes[0].nodeValue,
      LocationUpdated : timeList[i].childNodes[0].nodeValue
    };
  }
  scope.buses = buses;
}

function storeBusRoutes(scope, xmlDoc) {

  var routeList = xmlDoc.getElementsByTagName("RouteID");
  var aliasList = xmlDoc.getElementsByTagName("RouteAlias");
  var aliasLongList = xmlDoc.getElementsByTagName("RouteAliasLong");
  var routeDescList = xmlDoc.getElementsByTagName("RouteDescription");
  var colorList = xmlDoc.getElementsByTagName("RouteColor");
  var bikeList = xmlDoc.getElementsByTagName("Bike");
  var wheelchairList = xmlDoc.getElementsByTagName("Wheelchair");
  var metrorailList = xmlDoc.getElementsByTagName("Metrorail");
  var airportList = xmlDoc.getElementsByTagName("Airport");
  var sortList = xmlDoc.getElementsByTagName("SortOrder");

  if (debug) console.log("routeList length = "+routeList.length);
  var i = 0;
  var routes = [];
  for (i = 0; i < routeList.length; i++) {
    // Add each bus to the list
    routes[i] = {
      RouteID : routeList[i].childNodes[0].nodeValue,
      RouteAlias : aliasList[i].childNodes[0].nodeValue,
      RouteAliasLong : aliasLongList[i].childNodes[0].nodeValue,
      RouteDescription : routeDescList[i].childNodes[0].nodeValue,
      RouteColor : colorList[i].childNodes[0].nodeValue,
      Bike : bikeList[i].childNodes[0].nodeValue,
      Wheelchair : wheelchairList[i].childNodes[0].nodeValue,
      Metrorail : metrorailList[i].childNodes[0].nodeValue,
      Airport : airportList[i].childNodes[0].nodeValue,
      SortOrder : sortList[i].childNodes[0].nodeValue
    };
  }
  scope.routes = routes;
}

function storePOIs(scope, xmlDoc) {

  var POIs = [];
  for (i = 0; i < xmlDoc.getElementsByTagName("PointID").length; i++) {
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
  var stops = [];
  for (i = 0; i < xmlDoc.getElementsByTagName("StopID").length; i++) {
    // Add each POI to the array in the scope
    stops[i] = {
      StopID : xmlDoc.getElementsByTagName("StopID")[i].childNodes[0].nodeValue,
      StopName : xmlDoc.getElementsByTagName("StopName")[i].childNodes[0].nodeValue,
      Sequence : xmlDoc.getElementsByTagName("Sequence")[i].childNodes[0].nodeValue
    };
  }
  scope.busStops[routeDir] = stops;
}
