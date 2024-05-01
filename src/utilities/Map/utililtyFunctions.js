import * as turf from '@turf/turf';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import {
  SPECIES,
  SPECIES_PRICES,
  TREANTALL_PER_HEKTAR,
} from 'variables/forest';

export const formatTheStringArealM2 = (value) => {
  const arealm2 = parseInt(value) / 1000;
  return formatNumber(arealm2, 'nb-NO', 2); // Format with the decimal
};
export const calculateHeightVolumeStandVolume = (
  granCSVData,
  furuCSVData,
  values
) => {
  // Step 1 get the H from the Gran and Furu csv files
  let estimatedHeightString;
  // Step 2
  // Gu = exp( -12.920 - 0.021*alder + 2.379*ln(alder) + 0.540*ln(N) + 1.587*ln(Ht40))
  let crossSectionArea;
  // Step 3
  // V = 0.250(Gu^1.150)*H^(1.012)*exp(2.320/alder)
  let estimatedStandVolume;
  // Step 4
  let estimatedStandVolumeM3HAANumber;
  if (granCSVData.length > 0 || furuCSVData.length > 0) {
    let csvData;
    if (values.bontre_beskrivelse === SPECIES.GRAN) {
      csvData = granCSVData;
    } else if (values.bontre_beskrivelse === SPECIES.FURU) {
      csvData = furuCSVData;
    } else {
      // TODO: There are also other species e.g. Bjørk / lauv from ID:1-36
      csvData = granCSVData;
    }

    // Calculating Step 1 and 2
    if (csvData) {
      const { estimatedHeightCSV, crossSectionAreaCalc } =
        calculateEstimatedHeightAndCrossSectionArea(values, csvData);
      estimatedHeightString = estimatedHeightCSV;
      crossSectionArea = crossSectionAreaCalc;
    }
    // Calculating Step 3
    // V = 0.250(G^1.150)*H^(1.012)*exp(2.320/alder)
    estimatedStandVolume = calculateEstimatedStandVolume(
      crossSectionArea,
      estimatedHeightString,
      values.alder
    );
    console.log(' ', 'Use the H and Gu to calculte the V.');
    console.log(' ', 'V: ', estimatedStandVolume);

    // Step 4:
    // SV_in_bestand_249 = arealm2/10000*249 = 11391*249/10000 = 283.636
    estimatedStandVolumeM3HAANumber = calculateEstimatedStandVolumeM3HAA(
      values.arealm2,
      estimatedStandVolume
    );
    console.log(' ', 'Use the V and arealm2 to calculte the SV.');
    console.log(' ', 'SV: ', estimatedStandVolumeM3HAANumber);
    console.log('FINISHED:', 'Calculation for the Teig: ', values.teig_best_nr);
    console.log('############  END  #############');
  }
  const { totalVolume, speciesPrice } = calculteSpeciesBasedPrice(
    values.bontre_beskrivelse,
    estimatedStandVolumeM3HAANumber
  );

  return {
    estimatedStandVolumeM3HAANumber,
    estimatedStandVolume,
    speciesPrice,
    totalVolume,
  };
};

// Function to calculate estimated stand volume
export const calculateEstimatedStandVolume = (
  crossSectionArea,
  estimatedHeightString,
  alder
) => {
  return (
    0.25 *
    Math.pow(crossSectionArea, 1.15) *
    Math.pow(parseFloat(estimatedHeightString.replace(',', '.')), 1.012) *
    Math.exp(2.32 / parseInt(alder))
  );
};

// Function to calculate estimated stand volume M3 HAA
export const calculateEstimatedStandVolumeM3HAA = (
  arealm2,
  estimatedStandVolume
) => {
  return (parseInt(arealm2) / 10000) * estimatedStandVolume;
};

export const isPointInsidePolygon = (point, polygon) => {
  const turfPoint = turf.point([point.lng, point.lat]);
  const turfPolygon = turf.multiPolygon(polygon);
  return turf.booleanPointInPolygon(turfPoint, turfPolygon);
};

export const calculateBoundingBox = (map) => {
  const CRS = map.options.crs.code;
  const size = map.getSize();
  const bounds = map.getBounds();
  const southWest = map.options.crs.project(bounds.getSouthWest());
  const northEast = map.options.crs.project(bounds.getNorthEast());
  const BBOX = [southWest.x, southWest.y, northEast.x, northEast.y].join(',');
  return { CRS, size, BBOX };
};

export function hideLayerControlLabel(layerName) {
  // Find the label corresponding to the layer
  const layerControl = document.querySelector(
    '.leaflet-control-layers-overlays'
  );
  const labels = Array.from(layerControl.getElementsByTagName('label'));
  const label = labels.find((label) => label.textContent.includes(layerName));

  // Add the display: none rule
  if (label) {
    label.style.display = 'none';
  }
}

export const formatNumber = (value, locale = 'nb-NO', fractionDigits = 2) => {
  const formattedValue = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

  return formattedValue;
};

export const calculateEstimatedHeightAndCrossSectionArea = (
  featureValues,
  CSVData
) => {
  let estimatedHeightFromCSVString;
  let calculatedCrossSectionAreaNumber;
  const CONSTANT_N = TREANTALL_PER_HEKTAR || 200;

  const CSVRow = CSVData.find(
    (row) =>
      row.H40 ===
      featureValues.bonitet_beskrivelse.substring(
        featureValues.bonitet_beskrivelse.indexOf(' ') + 1
      )
  );

  if (CSVRow) {
    const featureAgeString = featureValues.alder;
    estimatedHeightFromCSVString =
      CSVRow[featureAgeString] ||
      CSVRow[Math.ceil(Number.parseInt(featureAgeString) / 5) * 5];
    const featureAgeNumber = parseInt(featureValues.alder);
    const bonitetHT40Number = parseFloat(CSVRow.Ht40.replace(',', '.'));

    if (featureAgeNumber >= 110) {
      estimatedHeightFromCSVString = CSVRow['110'];
    }
    // Based on the Skogapp google doc from Mads:
    // Gu = exp( -12.920 - 0.021*alder + 2.379*ln(alder) + 0.540*ln(N) + 1.587*ln(HT40))
    if (estimatedHeightFromCSVString) {
      calculatedCrossSectionAreaNumber = Math.exp(
        -12.92 -
          0.021 * featureAgeNumber +
          2.379 * Math.log(featureAgeNumber) +
          0.54 * Math.log(CONSTANT_N) +
          1.587 * Math.log(bonitetHT40Number)
      );
    }
  }
  console.log('############ START #############');
  console.log(
    'START:',
    'Calculation for the Teig: ',
    featureValues.teig_best_nr
  );
  console.log(' ', 'START:', 'Reading values from the CSV file:');
  console.log('   ', 'H: ', estimatedHeightFromCSVString);
  console.log('   ', 'Gu: ', calculatedCrossSectionAreaNumber);
  console.log(' ', 'FINISHED:', 'Reading values from the CSV file.');

  return {
    estimatedHeightCSV: estimatedHeightFromCSVString,
    crossSectionAreaCalc: calculatedCrossSectionAreaNumber,
  };
};

export const calculteSpeciesBasedPrice = (species, volume) => {
  let speciesPrice;

  if (species === SPECIES.GRAN) {
    speciesPrice = SPECIES_PRICES.GRAN;
  } else if (species === SPECIES.FURU) {
    speciesPrice = SPECIES_PRICES.FURU;
  } else {
    speciesPrice = SPECIES_PRICES.LAU;
  }
  return { totalVolume: volume * speciesPrice, speciesPrice };
};

// Function to download the CSV file
export function downloadCSV(csvData) {
  // Convert JSON to CSV
  const csv = Papa.unparse(csvData);

  // Create a blob from the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  // Use FileSaver to save the file
  saveAs(blob, 'featureInfos.csv');
}
