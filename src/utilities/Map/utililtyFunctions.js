import * as turf from '@turf/turf';

export const convertAndformatTheStringArealM2ToDAA = (arealM2) => {
  const retArealm2 = parseInt(arealM2) / 1000;
  return formatNumber(retArealm2, 'nb-NO', 2); // Format with the decimal
};
export const isPointInsideTeig = (point, polygon) => {
  const turfPoint = turf.point([point.lng, point.lat]);
  const turfMultiPolygon = turf.multiPolygon(polygon);
  return turf.booleanPointInPolygon(turfPoint, turfMultiPolygon);
};
export const isPointInsidePolygon = (point, polygon) => {
  const turfPoint = turf.point([point.lng, point.lat]);
  const turfPolygon = turf.polygon(polygon);
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

export const WFSFeatureLayerNamefromXML = (xml) => {
  // Assuming `data` is your XML string
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');

  // Find all <gml:name> elements
  const nameElements = xmlDoc.querySelectorAll('name');

  // Initialize an array to hold the layer names for each feature
  const layerNames = [];

  // Iterate over each <gml:name> element
  nameElements.forEach((nameEl) => {
    // Extract the layer name
    const layerName = nameEl.textContent;

    // Optionally, find the parent feature element of this <gml:name>
    // This step depends on the structure of your XML and how you need to associate names with features
    // For demonstration, we're just collecting names
    layerNames.push(layerName);
  });
  // Now, `layerNames` contains all the layer names extracted from the XML
  // You can associate these names with your features accordingly
  return layerNames;
};

export const calculateFeatInfoHKTotals = (features, CSVFeatureInfosData) => {
  const totals = features.reduce(
    (acc, feature) => {
      const props = feature.properties;
      const featureData =
        CSVFeatureInfosData.find(
          (row) => row.bestand_id === props.teig_best_nr
        ) || {};

      acc.totalArealM2 += parseInt(props.arealm2, 10) || 0;
      acc.totalCarbonStored += parseInt(props.carbon_stored, 10) || 0;
      acc.totalCarbonCapturedNextYear +=
        parseInt(props.carbon_captured_next_year, 10) || 0;

      acc.standVolumeWMSDensityPerHectareMads +=
        parseFloat(featureData.volume_per_hectare_without_bark) || 0;
      acc.standVolumeMads += parseFloat(featureData.volume_without_bark) || 0;
      acc.speciesPriceMads += parseFloat(props.avg_price_m3) || 0;
      acc.totalESTGrossValueMads +=
        parseFloat(featureData.gross_value_standing_volume) || 0;

      return acc;
    },
    {
      totalArealM2: 0,
      totalCarbonStored: 0,
      totalCarbonCapturedNextYear: 0,
      standVolumeWMSDensityPerHectareMads: 0,
      standVolumeMads: 0,
      speciesPriceMads: 0,
      totalESTGrossValueMads: 0,
    }
  );

  return totals;
};
