const https = require('https');

const MDT_BASE = 'https://www.miamidade.gov/transit/mobile/xml/';

function fetchXML(url) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeafletTransit/1.0)' },
    };
    https.get(url, opts, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchXML(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Parses flat XML: returns array of objects for each <tag> element
function parseItems(xml, tag) {
  const items = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g');
  let m;
  while ((m = re.exec(xml)) !== null) {
    const obj = {};
    const inner = m[1];
    const fre = /<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g;
    let f;
    while ((f = fre.exec(inner)) !== null) {
      obj[f[1]] = f[2];
    }
    items.push(obj);
  }
  return items;
}

function recordSet(records) {
  return { RecordSet: records.length ? { Record: records } : null };
}

const handlers = {
  // MDT XML has <Route> not <RouteID> — add RouteID alias
  'Buses.json': async () => {
    const xml = await fetchXML(MDT_BASE + 'Buses/');
    return recordSet(parseItems(xml, 'Bus').map(b => ({ ...b, RouteID: b.Route })));
  },

  // MDT XML ServiceDirection=short(NB/SB), Service=long(Northbound) — app expects opposite
  'Trains.json': async () => {
    const xml = await fetchXML(MDT_BASE + 'Trains/');
    return recordSet(parseItems(xml, 'Train').map(t => ({
      ...t,
      Direction: t.ServiceDirection,
      ServiceDirection: t.Service,
    })));
  },

  'BusRoutes.json': async () => {
    const xml = await fetchXML(MDT_BASE + 'BusRoutes/');
    return recordSet(parseItems(xml, 'Route'));
  },

  // MDT XML uses StationLat/StationLong instead of Latitude/Longitude.
  // Also, <Station> is both the container tag and an inner field (station display name),
  // so rename the inner field to <StationName> before parsing to avoid regex mismatch.
  'TrainStations.json': async () => {
    const raw = await fetchXML(MDT_BASE + 'TrainStations/');
    const xml = raw.replace(/<Station>([^<]+)<\/Station>/g, '<StationName>$1</StationName>');
    return recordSet(parseItems(xml, 'Station').map(s => ({
      ...s,
      Station: s.StationName,
      Latitude: s.StationLat,
      Longitude: s.StationLong,
    })));
  },

  // MDT no longer exposes this endpoint — return null so app skips drawing track lines
  'TrainMapShape.json': () => ({ RecordSet: null }),

  'BusRouteStops.json': async (p) => {
    const xml = await fetchXML(`${MDT_BASE}BusRouteStops/?RouteID=${p.RouteID}&Dir=${p.Dir}`);
    return recordSet(parseItems(xml, 'Stop'));
  },

  // These shape endpoints are no longer on MDT (feature was already commented out in app)
  'BusRouteShape.json': () => ({ RecordSet: null }),
  'BusRouteShapesByTrip.json': () => ({ RecordSet: null }),

  // City of Miami trolley API and Citi Bike Miami are defunct — return empty
  'PointsOfInterest.json': () => ({ RecordSet: { Record: [] } }),
  'trolley/vehicles.json': () => ({ get_vehicles: [] }),
  'trolley/stops.json': () => ({ get_stops: [] }),
  'Nearby.json': () => ({ RecordSet: null }),
};

exports.handler = async (event) => {
  const endpoint = event.path.replace(/^\/api\//, '');
  const params = event.queryStringParameters || {};
  const handler = handlers[endpoint];

  if (!handler) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Unknown endpoint: ' + endpoint }) };
  }

  try {
    const data = await handler(params);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('mdt-proxy error [' + endpoint + ']:', err.message);
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
