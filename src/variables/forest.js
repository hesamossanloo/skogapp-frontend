export const colorMap = {
  Pine: 'green',
  Oak: 'brown',
  Spruce: 'yellow',
  Birch: 'white',
  Alder: 'black',
  Cherry: 'red',
};

export const mapCoordinations = {
  homePosition: [59.9287, 11.7025], // Coordinates for Mads' House
  centerPosition: [59.945, 11.695], // Coordinates for Mads' Dad's Forest
  norwayPosition: [59.9139, 10.7522], // Coordinates for Oslo, Norway
};

export const nibioGetFeatInfoBaseParams = {
  language: 'nor',
  SERVICE: 'WMS',
  VERSION: '1.3.0',
  REQUEST: 'GetFeatureInfo',
  LAYERS: 'hogstklasser',
  STYLES: '',
  FORMAT: 'image/png',
  QUERY_LAYERS: 'hogstklasser',
  INFO_FORMAT: 'application/vnd.ogc.gml', // text/html, application/vnd.ogc.gml, text/plain
  FEATURE_COUNT: 10,
};
