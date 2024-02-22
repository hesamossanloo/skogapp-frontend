import {
  SPECIES,
  SPECIES_PRICES,
  TREANTALL_PER_HEKTAR,
} from 'variables/forest';

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
    estimatedHeightFromCSVString = CSVRow[featureAgeString];
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

  console.log('H: ', estimatedHeightFromCSVString);
  console.log('Gu: ', calculatedCrossSectionAreaNumber);

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
