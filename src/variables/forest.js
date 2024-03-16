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
  madsForestPosition: [59.945, 11.695], // Coordinates for Mads' Dad's Forest
  bjoernForestPosition: [60, 11.755], // Coordinates for Mads' Dad's Forest
  // centerPosition: [23.698, 2.79], // Strange Coordinates for the Nib Center Cache Bild Server
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

// constants.js
export const CSV_URLS = {
  GRAN: '/csvs/gran.csv',
  FURU: '/csvs/furu.csv',
};

export const TREANTALL_PER_HEKTAR = 200;

export const SPECIES = {
  GRAN: 'Gran',
  FURU: 'Furu',
};
export const SPECIES_PRICES = {
  GRAN: 538,
  FURU: 537,
  LAU: 486,
};

export const HIDE_POLYGON_ZOOM_LEVEL = 10;
export const MAP_DEFAULT_ZOOM_LEVEL = 13;
