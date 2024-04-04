import dotenv from 'dotenv';
import proj4 from 'proj4';

// This function attempts to load environment variables and returns an object representing them
function loadEnv(context) {
  // Attempt to use context.env if it exists (Netlify Edge Functions environment)
  if (typeof context !== 'undefined' && context.env) {
    return context.env;
  } else {
    // If context.env is not available, fall back to dotenv for local development
    dotenv.config();
    return process.env; // Now, process.env will contain your .env file variables
  }
}
// Use the function to get your environment variables

// Now you can access your environment variables via the env object
const wmsEdge = async (request, context) => {
  const env = loadEnv(context);
  const MYAUTHTOKEN = env.REACT_APP_GEODATA_BASIC_AUTH;
  const WMS_SERVER_URL =
    'https://services.geodataonline.no:443/arcgis/services/Geocache_UTM33_EUREF89/GeocacheBilder/MapServer/WMSServer';
  if (typeof MYAUTHTOKEN === 'undefined') {
    dotenv.config();
  }

  const headers = {
    Authorization: `Basic ${MYAUTHTOKEN}`,
  };
  // CORS Configuration
  const corsResponseHeader = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  const origURL = new URL(request.url);
  const params = origURL.searchParams;
  let { bbox, crs, ...otherParams } = Object.fromEntries(params.entries());
  try {
    crs = 'EPSG:4326';
    if (bbox) {
      // Split the BBOX string into individual numbers and parse them as floats
      const bboxValues = bbox.split(',').map((value) => parseFloat(value));

      // Assuming bboxValues are in the order [minX, minY, maxX, maxY] for the source CRS
      const [minX, minY, maxX, maxY] = bboxValues;

      // Transform the coordinates to EPSG:4326
      // Note: proj4js uses the order [longitude, latitude] for EPSG:4326
      const bottomLeft = proj4('EPSG:3857', 'EPSG:4326', [minX, minY]);
      const topRight = proj4('EPSG:3857', 'EPSG:4326', [maxX, maxY]);

      // Construct the BBOX in the correct order for EPSG:4326: lat_min, lon_min, lat_max, lon_max
      bbox = `${bottomLeft[1]},${bottomLeft[0]},${topRight[1]},${topRight[0]}`;
    }
    const queryString = new URLSearchParams({
      bbox,
      crs,
      ...otherParams,
    }).toString();
    const URL = `${WMS_SERVER_URL}?${queryString}`;
    const response = await fetch(URL, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Stream the response body directly back to the client
    const data = await response.arrayBuffer();

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type'),
        ...corsResponseHeader,
      },
    });
  } catch (error) {
    console.error('Error in proxy:', error.message);
    return new Response(`Error in proxy server: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
};
export default wmsEdge;
