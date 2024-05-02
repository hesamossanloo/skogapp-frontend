import * as turf from '@turf/turf';
import csv from 'csv-parser';
import fs from 'fs';
import proj4 from 'proj4';
import madsPolygons from './src/assets/data/QGIS/mads/mads-polygons-module.js';

// Parse the file content as JSON
const stringifiedGeoJSON = JSON.stringify(madsPolygons);
const parsedGeoJSON = JSON.parse(stringifiedGeoJSON);

// Define the polygon DN-14 -> 1-311
const polygonDN14 = {
  type: 'Feature',
  properties: {
    DN: 14,
  },
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [11.706497325075178, 59.959018296627825],
          [11.708438853297379, 59.95899305381937],
          [11.708716214471979, 59.95896781099169],
          [11.708716214471979, 59.95894256814477],
          [11.708665785167508, 59.95885421802913],
          [11.708464067949617, 59.95874062467714],
          [11.708337994688433, 59.95858916626873],
          [11.708060633513833, 59.95843770716802],
          [11.707606769773578, 59.95834935570621],
          [11.707505911164633, 59.95828624737497],
          [11.707505911164633, 59.958235760623445],
          [11.707203335337796, 59.95819789550931],
          [11.707102476728851, 59.95822313892353],
          [11.707001618119905, 59.958336734049574],
          [11.706648612988596, 59.958500815210776],
          [11.706472110422942, 59.958563923133354],
          [11.706295607857289, 59.958563923133354],
          [11.706219963900578, 59.95863965248179],
          [11.706219963900578, 59.95870276013994],
          [11.706295607857289, 59.95876586767791],
          [11.70627039320505, 59.95900567522599],
          [11.706497325075178, 59.959018296627825],
        ],
      ],
    ],
  },
};
// Define the projection from WGS 84 to UTM Zone 32N
const projection = proj4('EPSG:4326', 'EPSG:3857');

const beforeProjPolygonDN14Area = turf.area(polygonDN14);

// Project the polygon to the new CRS
turf.coordEach(polygonDN14, (coord) => {
  const projectedCoord = projection.forward(coord);
  coord[0] = projectedCoord[0];
  coord[1] = projectedCoord[1];
});

// Calculate the total area of the original polygon, after the projection
const afterProjPolygonDN14Area = turf.area(polygonDN14);

const calculateSinglePolygonAreaAndIntersection = (givenPolygon) => {
  // 1-304 -> 23%
  // 1-306 -> 38%
  // 1-311 -> 100%
  const boundedBy = [
    1303123.740775, 8390424.89474, 1303416.196044, 8390621.545857,
  ];

  // Convert the bounding box to a polygon
  const bboxPolygon = turf.bboxPolygon(boundedBy);

  const bboxArea = turf.area(bboxPolygon);

  console.log('Polygon area Before:', beforeProjPolygonDN14Area);
  console.log('Polygon area After:', afterProjPolygonDN14Area);
  console.log('BBOX area:', bboxArea);
  // Calculate the intersection
  const intersection = turf.intersect(bboxPolygon, givenPolygon);

  if (intersection) {
    // If there is an intersection, calculate its area
    const overlapArea = turf.area(intersection);
    // Calculate the overlap as a percentage of the total area
    const overlapPercentage = (overlapArea / afterProjPolygonDN14Area) * 100;

    console.log('Overlap area:', overlapArea);
    console.log('Overlap percentage:', overlapPercentage);
  } else {
    console.log('No overlap');
  }
};

const ascendingDN = () => {
  // Assign ascending numbers to DN property
  parsedGeoJSON.features.forEach((feature, index) => {
    feature.properties.DN = index + 1;
  });
  // Convert the modified data back to JSON string
  const modifiedDataString = JSON.stringify(parsedGeoJSON, null, 2);
  // Write the modified data to a new file
  const newFilePath = './ascendingDN.json';
  fs.writeFileSync(newFilePath, modifiedDataString);
  console.log('DN values have been modified and saved to', newFilePath);
};

const calculateAllRowsIntersectionsForGivenPolygon = (givenPolygon) => {
  // Read the CSV file
  fs.createReadStream('./public/csvs/featureInfos.csv')
    .pipe(csv())
    .on('data', (row) => {
      // Extract the boundedBy values
      const boundedBy = row.boundedBy.split(',').map(Number);

      // Check if any values are NaN
      if (boundedBy.some(isNaN)) {
        console.warn(
          `Invalid boundedBy values in row with teig_best_nr: ${row.teig_best_nr}`
        );
      } else {
        // Convert the bounding box to a polygon
        const bboxPolygon = turf.bboxPolygon(boundedBy);

        // Check if there is an intersection
        const intersection = turf.intersect(bboxPolygon, givenPolygon);

        if (intersection) {
          // If there is an intersection, calculate its area
          const overlapArea = turf.area(intersection);
          // Calculate the overlap as a percentage of the total area
          const overlapPercentage =
            (overlapArea / afterProjPolygonDN14Area) * 100;

          // If there is an intersection, print the teig_best_nr and DN
          console.log(
            'Overlap percentage:',
            overlapPercentage,
            'for Polygon:',
            row.teig_best_nr,
            'with DN:',
            givenPolygon.properties.DN
          );
        }
      }
    });
};

const crossCheckPolygonsWithCSVRows = async (givenParsedGeoJSON) => {
  // For each feature in the GeoJSON file
  for (const feature of givenParsedGeoJSON.features) {
    // Calculate the total area of the original polygon, after the projection
    const beforeProjPolygonArea = turf.area(feature);

    // Project the polygon to the new CRS
    turf.coordEach(feature, (coord) => {
      const projectedCoord = projection.forward(coord);
      coord[0] = projectedCoord[0];
      coord[1] = projectedCoord[1];
    });

    // Calculate the total area of the original polygon, after the projection
    const afterProjPolygonArea = turf.area(feature);

    // Read the CSV file
    // calculateAllRowsIntersectionsForGivenPolygon(feature);
    if (afterProjPolygonArea > 0) {
      // Read the CSV file
      await fs
        .createReadStream('./public/csvs/featureInfos-short.csv')
        .pipe(csv())
        .on('data', (row) => {
          // Extract the boundedBy values
          const boundedBy = row.boundedBy.split(',').map(Number);

          // Check if any values are NaN
          if (boundedBy.some(isNaN)) {
            console.warn(
              `Invalid boundedBy values in row with teig_best_nr: ${row.teig_best_nr}`
            );
          } else {
            // Convert the bounding box to a polygon
            const bboxPolygon = turf.bboxPolygon(boundedBy);

            // Check if there is an intersection
            const intersection = turf.intersect(bboxPolygon, feature);

            if (intersection && beforeProjPolygonArea > 50) {
              // If there is an intersection, calculate its area
              const overlapArea = turf.area(intersection);
              // Calculate the overlap as a percentage of the total area
              const overlapPercentage =
                (overlapArea / afterProjPolygonArea) * 100;

              if (
                overlapPercentage > 50 &&
                !Number.isInteger(overlapPercentage) &&
                Math.abs(overlapPercentage - 100) <= 2
              ) {
                print(
                  row.teig_best_nr,
                  feature.properties.DN,
                  beforeProjPolygonArea,
                  afterProjPolygonArea,
                  overlapArea,
                  overlapPercentage
                );
              } else if (overlapPercentage === 100) {
                print(
                  row.teig_best_nr,
                  feature.properties.DN,
                  beforeProjPolygonArea,
                  afterProjPolygonArea,
                  overlapArea,
                  overlapPercentage
                );
              }
            }
          }
        });
    }
  }
};

const print = (
  teig_best_nr,
  DN,
  beforeProjPolygonArea,
  afterProjPolygonArea,
  overlapArea,
  overlapPercentage
) => {
  console.log(`######### ${teig_best_nr} -> DN ${DN} ########`);
  console.log('Polygon area Before:', beforeProjPolygonArea);
  console.log('Polygon area After:', afterProjPolygonArea);
  console.log('Overlap area:', overlapArea);
  console.log('Overlap percentage:', overlapPercentage);
  console.log('###################');
};
// Run the commands
crossCheckPolygonsWithCSVRows(parsedGeoJSON);
// calculateAllRowsIntersectionsForGivenPolygon(polygonDN14);
// calculateSinglePolygonAreaAndIntersection(polygon);
// ascendingDN();
