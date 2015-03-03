// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// MapBox
			L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
				maxZoom: 18,
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Imagery © <a href="http://mapbox.com">Mapbox</a>',
				id: 'examples.map-i875mjb7'
			}).addTo(map);
			
			function popUp(feature, layer) {
			    layer.bindPopup(
					"<strong>Name:</strong> " + feature.properties.NAME +
					"<br/><strong>Address:</strong> " + feature.properties.ADDRESS +
					"<br/><strong>Phone:</strong> " + feature.properties.PHONE +
					"</p>")
			  }

			var boundaries = new L.GeoJSON.AJAX("http://gis.mdc.opendata.arcgis.com/datasets/b4275c23add9401bbf3305139450c1ec_0.geojson").addTo(map);
			var schools = new L.GeoJSON.AJAX("http://gis.mdc.opendata.arcgis.com/datasets/d27bba9d06964aae96cacb9aa7748fac_0.geojson",{
				filter: function(feature, layer) {
				        return feature.properties.GRADES == "9-12";
				        },
				onEachFeature: popUp
				    }).addTo(map);

			// Not working
			var circle = L.circle([25.80, -80.20], 500, {
			    color: 'red',
			    fillColor: '#f03',
			    fillOpacity: 0.5
			}).addTo(map);

			var polygon = L.polygon([
			    [25.85, -80.08],
			    [25.86, -80.06],
			    [25.87, -80.047]
			]).addTo(map);			

			marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
			circle.bindPopup("I am a circle.");
			polygon.bindPopup("I am a polygon.");	    

			function onMapClick(e) {
			    alert("You clicked the map at " + e.latlng);
			}

			map.on('click', onMapClick);

			L.marker([25.75, -80.20]).addTo(map)
			    .bindPopup('A pretty CSS3 popup. <br> Easily customizable.')
			    .openPopup();

			var marker = L.marker([25.80, -80.20]).addTo(map);