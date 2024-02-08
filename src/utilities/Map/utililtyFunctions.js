import { TREANTALL_PER_HEKTAR } from 'variables/forest';

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
  let estimatedHeightFromCSV;
  let calculatedCrossSectionArea;
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
    estimatedHeightFromCSV = CSVRow[featureAgeString];
    const featureAgeNumber = parseInt(featureValues.alder);
    const bonitetHT40Number = parseFloat(CSVRow.Ht40.replace(',', '.'));

    if (featureAgeNumber >= 110) {
      estimatedHeightFromCSV = CSVRow['110'];
    }
    if (estimatedHeightFromCSV) {
      calculatedCrossSectionArea = Math.exp(
        -12.92 -
          0.021 * featureAgeNumber +
          2.379 * Math.log(featureAgeNumber) +
          0.54 * Math.log(CONSTANT_N) +
          1.587 * Math.log(bonitetHT40Number)
      );
    }
  }

  return {
    estimatedHeightCSV: estimatedHeightFromCSV,
    crossSectionAreaCalc: calculatedCrossSectionArea,
  };
};
