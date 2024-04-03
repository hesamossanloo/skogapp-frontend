import dotenv from 'dotenv';

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
const testEdge = async (request, context) => {
  const env = loadEnv(context);
  const MYAUTHTOKEN = env.REACT_APP_GEODATA_BASIC_AUTH;
  if (typeof MYAUTHTOKEN === 'undefined') {
    dotenv.config();
  }
  const WMS_SERVER_URL_HARDCODE =
    'https://services.geodataonline.no:443/arcgis/services/Geocache_UTM33_EUREF89/GeocacheBilder/MapServer/WMSServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&BBOX=59.93480248245968056%2C11.70243211087088042%2C59.95061899469754962%2C11.73223008089716934&CRS=EPSG%3A4326&WIDTH=2261&HEIGHT=1200&LAYERS=0&STYLES=&FORMAT=image%2Fjpeg&DPI=72&MAP_RESOLUTION=72&FORMAT_OPTIONS=dpi%3A72';

  const headers = {
    Authorization: `Basic ${MYAUTHTOKEN}`,
  };

  try {
    const response = await fetch(WMS_SERVER_URL_HARDCODE, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Stream the response body directly back to the client
    const data = await response.arrayBuffer();

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type'),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
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
export default testEdge;
