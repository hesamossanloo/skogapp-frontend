import fs from 'fs';
import madsPolygons from './src/assets/data/QGIS/mads/mads-polygons-module.js';

// Parse the file content as JSON
const stringifiedGeoJSON = JSON.stringify(madsPolygons);
const parsedGeoJSON = JSON.parse(stringifiedGeoJSON);

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
// Run the commands
ascendingDN();
