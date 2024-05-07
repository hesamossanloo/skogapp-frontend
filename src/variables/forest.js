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
  madsForestPosition: { name: 'forest1', coord: [59.945, 11.695] }, // Coordinates for Mads' Dad's Forest
  bjoernForestPosition: { name: 'forest2', coord: [60, 11.755] }, // Coordinates for Bjoern's Forest
  knutForestPosition: { name: 'forest3', coord: [59.9677, 11.56005] }, // Coordinates for Knut's Forest 59.96070,11.56955, you can get these from QGIS, by right click inthe center of where you want and get the coordinates of the desired CRS
  akselForestPosition: { name: 'forest4', coord: [59.962, 11.72415] }, // Coordinates for Knut's Forest 59.96070,11.56955, you can get these from QGIS, by right click inthe center of where you want and get the coordinates of the desired CRS
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

export const madsPolygonsPNGBounds = [
  [59.9283312840000022, 11.6844372829999994], // Bottom-left corner
  [59.9593366419999967, 11.7499393919999999], // Top-right corner
];
export const bjoernPolygonsPNGBounds = [
  [59.963530782, 11.892033508], // Bottom-left corner
  [60.033538097, 11.694021503], // Top-right corner
];

// I got these info from the QGIS PNG layer properties
// Make sure the polygons are reprojected to 4236 and then print out the PNG
export const knutPolygonsPNGBounds = [
  [59.9133344939999972, 11.4617220300000007], // Bottom-left corner
  [60.0107517499999972, 11.6901970350000006], // Top-right corner
];

export const akselPolygonsPNGBounds = [
  [59.9209034235166982, 11.6422669866217117], // Bottom-left corner
  [60.0127997021416988, 11.8577935105911383], // Top-right corner
];

export const forbideanAreas = [
  21, 29, 39, 92, 70, 35, 31, 18, 123, 101, 201, 173, 222, 220, 273, 161, 305,
  268, 321, 137, 218, 285, 310, 312, 316, 317, 299, 294, 381, 109, 105, 82, 362,
  395,
];
