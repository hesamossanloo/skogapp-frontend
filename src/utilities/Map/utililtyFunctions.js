import * as turf from '@turf/turf';
import L from 'leaflet';
import {
  desiredFeatInfoAttrHKLayer,
  desiredFeatInfoAttrHKLayerWithUnits,
  unwantedMISFeatureKeys,
} from 'variables/forest';

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
const getHKBGColor = (hk) => {
  let BGColor;
  switch (hk) {
    case '2':
      BGColor = '#f2b370';
      break;
    case '3':
      BGColor = '#aebb7a';
      break;
    case '4':
      BGColor = '#bc8963';
      break;
    case '5':
      BGColor = '#de6867';
      break;
    default:
      BGColor = '#ffffff';
      break;
  }
  return BGColor;
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

export const calculateFeatInfoHKTotals = (features, bestandFeatInfos) => {
  const totals = features.reduce(
    (acc, feature) => {
      const props = feature.properties;
      const featureData =
        bestandFeatInfos.find(
          (row) => row.fields.bestand_id === props.teig_best_nr
        ) || {};

      const featureDataFields = featureData.fields;
      acc.totalArealM2 += parseInt(props.arealm2, 10) || 0;
      acc.totalCarbonStored += parseInt(props.carbon_stored, 10) || 0;
      acc.totalCarbonCapturedNextYear +=
        parseInt(props.carbon_captured_next_year, 10) || 0;

      acc.standVolumeWMSDensityPerHectareMads +=
        parseFloat(featureDataFields.volume_per_hectare_without_bark) || 0;
      acc.standVolumeMads +=
        parseFloat(featureDataFields.volume_without_bark) || 0;
      acc.speciesPriceMads += parseFloat(props.avg_price_m3) || 0;
      acc.totalESTGrossValueMads +=
        parseFloat(featureDataFields.gross_value_standing_volume) || 0;

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

export const generateHKPopupContent = (sumObj, features, multi) => {
  let content =
    `<h3 style="color: black; text-align: center;">${sumObj.title}</h3>` +
    '<table style="margin-bottom: 10px; border-collapse: collapse; border: 1px solid black;">';

  if (multi) {
    content += '<tr>';
    Object.values(desiredFeatInfoAttrHKLayerWithUnits).forEach((attr) => {
      content += `<th style="padding: 5px; border: 1px solid black;">${attr}</th>`;
    });
    content += `
      <th style="padding: 5px; border: 1px solid black;">Tømmertetthet (m^3/daa)</th>
      <th style="padding: 5px; border: 1px solid black;">Tømmervolum (m^3)</th>
      <th style="padding: 5px; border: 1px solid black;">Årlig vekst (%)</th>
      <th style="padding: 5px; border: 1px solid black; min-width: 150px;">Forv. gj.sn pris per m^3 (kr)</th>
      <th style="padding: 5px; border: 1px solid black;">Forv. brutto verdi (kr)</th>
    </tr>`;

    features.forEach((feature) => {
      const props = feature.properties;
      const rowBGColor = getHKBGColor(props.hogstkl_verdi);
      content += `<tr style="background-color: ${rowBGColor}">`;
      content += `<td style="padding: 5px; border: 1px solid black;">${props.teig_best_nr}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${props.hogstkl_verdi}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${props.bonitet_beskrivelse.substring(props.bonitet_beskrivelse.indexOf(' ') + 1)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${props.bontre_beskrivelse}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${props.alder}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${convertAndformatTheStringArealM2ToDAA(props.arealm2)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(props.carbon_stored / 1000, 'nb-NO', 2)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(props.carbon_captured_next_year / 1000, 'nb-NO', 2)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(parseFloat(props.volume_per_hectare_without_bark) / 10, 'nb-NO', 1)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(props.volume_without_bark, 'nb-NO', 1)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(props.volume_growth_factor * 100, 'nb-NO', 2)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(props.avg_price_m3, 'nb-NO', 1)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(props.gross_value_standing_volume, 'nb-NO', 1)}</td>`;
      content += '</tr>';
    });

    content += '<tr>';
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold">Total</td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold"></td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold"></td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold"></td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold"></td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.arealDAA}</td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.carbon_stored}</td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.carbon_captured_next_year}</td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold">${formatNumber(sumObj.standVolumeWMSDensityPerHectareMads / 10, 'nb-NO', 1)}</td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold">${formatNumber(sumObj.standVolumeMads, 'nb-NO', 1)}</td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold"></td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold"></td>`;
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold">${formatNumber(sumObj.totalESTGrossValueMads, 'nb-NO', 1)}</td>`;
    content += '</tr>';
  } else {
    const feature = features[0];
    const properties = feature.properties;
    sumObj.teig_best_nr = properties.teig_best_nr;
    // Get Hogstklasse
    sumObj.hogstkl_verdi = properties.hogstkl_verdi;

    // Get the Bonitet
    sumObj.bonitet_beskrivelse = properties.bonitet_beskrivelse.substring(
      properties.bonitet_beskrivelse.indexOf(' ') + 1
    );

    // Get the Treslag
    sumObj.bontre_beskrivelse = properties.bontre_beskrivelse;

    // Calculate arealDAA
    sumObj.arealDAA = convertAndformatTheStringArealM2ToDAA(properties.arealm2);

    // Get the Alder
    sumObj.alder = properties.alder;

    // Get the volume_growth_factor
    sumObj.volume_growth_factor = formatNumber(
      properties.volume_growth_factor * 100,
      'nb-NO',
      2
    );

    // Get the carbon_stored and convert it to Tonn
    sumObj.carbon_stored = formatNumber(
      properties.carbon_stored / 1000,
      'nb-NO',
      2
    );

    // Get the carbon_captured_next_year and convert it to Tonn
    sumObj.carbon_captured_next_year = formatNumber(
      properties.carbon_captured_next_year / 1000,
      'nb-NO',
      2
    );

    let rowBGColor = getHKBGColor(sumObj.hogstkl_verdi);

    content +=
      // Add the ID row
      `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">ID</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.teig_best_nr}</td>
        </tr>` +
      // Add Hogstklasse
      `<tr style="border: 1px solid black; background-color: ${rowBGColor}">
          <td style="padding: 5px; border: 1px solid black;">${desiredFeatInfoAttrHKLayer['hogstkl_verdi']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold;">${sumObj.hogstkl_verdi}</td>
        </tr>` +
      // Add Bonitet
      `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">${desiredFeatInfoAttrHKLayer['bonitet_beskrivelse']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.bonitet_beskrivelse}</td>
        </tr>` +
      // Add the Treslag
      `<tr style="border: 1px solid black; background-color: ${rowBGColor}">
          <td style="padding: 5px; border: 1px solid black;">${desiredFeatInfoAttrHKLayer['bontre_beskrivelse']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.bontre_beskrivelse}</td>
        </tr>` +
      // Add the ArealM2
      `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black; min-width: 110px">${desiredFeatInfoAttrHKLayer['arealDAA']}</td>
          <td style="padding: 5px; display: flex; justify-content: space-between; min-width: 110px">
            <span style="font-weight: bold">${sumObj.arealDAA}</span>
            <span>daa</span>
          </td>
        </tr>` +
      // Add the Alder
      `<tr style="border: 1px solid black; background-color: ${rowBGColor}">
          <td style="padding: 5px; border: 1px solid black;">${desiredFeatInfoAttrHKLayer['alder']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.alder}</td>
        </tr>` +
      // Add the carbon_stored
      `<tr style="border: 1px solid black;">
            <td style="padding: 5px; border: 1px solid black;">${desiredFeatInfoAttrHKLayer['carbon_stored']}</td>
            <td style="padding: 5px; display: flex; justify-content: space-between;">
              <span style="font-weight: bold">${sumObj.carbon_stored}</span>
              <span>T</span>
            </td>
        </tr>` +
      // Add the carbon_captured_next_year
      `<tr style="border: 1px solid black; background-color: ${rowBGColor}">
          <td style="padding: 5px; border: 1px solid black;">${desiredFeatInfoAttrHKLayer['carbon_captured_next_year']}</td>
          <td style="padding: 5px; display: flex; justify-content: space-between;">
            <span style="font-weight: bold">${sumObj.carbon_captured_next_year}</span>
            <span>T</span>
          </td>
        </tr>`;

    if (sumObj.standVolumeWMSDensityPerHectareMads) {
      content += `
            <tr style="border: 1px solid black;">
              <td style="padding: 5px; border: 1px solid black;">Tømmertetthet</td>
              <td style="padding: 5px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold">${formatNumber(sumObj.standVolumeWMSDensityPerHectareMads / 10, 'nb-NO', 1)}</span>
                <span>m^3/daa</span>
              </td>
            </tr>`;
      content += `
            <tr style="border: 1px solid black; background-color: ${rowBGColor}">
              <td style="padding: 5px; border: 1px solid black;">Tømmervolum</td>
              <td style="padding: 5px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold">${formatNumber(sumObj.standVolumeMads, 'nb-NO', 1)}</span>
                <span>m^3</span>
              </td>
            </tr>`;
      // Add the volume_growth_factor
      content += `
            <tr style="border: 1px solid black;">
              <td style="padding: 5px; border: 1px solid black;">Årlig vekst</td>
              <td style="padding: 5px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold">${sumObj.volume_growth_factor}</span>
                <span>%</span>
              </td>
            </tr>`;
      // The price of the timber for a species
      content += `
            <tr style="border: 1px solid black; background-color: ${rowBGColor}">
              <td style="padding: 5px; border: 1px solid black; min-width: 150px;">Forv. gj.sn pris per m^3</td>
              <td style="padding: 5px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold">${formatNumber(sumObj.speciesPriceMads, 'nb-NO', 0)}</span>
                <span>kr</span>
              </td>
            </tr>`;
      content += `
            <tr style="border: 1px solid black;">
              <td style="padding: 5px; border: 1px solid black;">Forv. brutto verdi</td>
              <td style="padding: 5px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold">${formatNumber(sumObj.totalESTGrossValueMads, 'nb-NO', 0)}</span>
                <span>kr</span>
              </td>
            </tr>`;
    }
  }

  content += '</table>';
  return content;
};

export const openHKPopupWithContent = (content, e, map) => {
  const popup = L.popup({
    interactive: true,
    maxWidth: 'auto',
    minWidth: 300,
    maxHeight: 'auto',
  })
    .setLatLng(e.latlng)
    .setContent(content)
    .openOn(map);

  const popupContainer = popup.getElement();
  popupContainer.style.width = 'auto';
  popupContainer.style.height = 'auto';
};

export const createMISButton = (MISConetntDiv, MISFeature, e, map) => {
  const MISButton = document.createElement('button');
  MISButton.textContent = 'View MIS Content!';
  MISButton.style.padding = '10px 10px';
  MISButton.style.backgroundColor = '#ffc107';
  MISButton.style.border = 'none';
  MISButton.style.borderRadius = '4px';
  MISButton.style.color = 'white';

  const createCollapsibleContent = () => {
    const popup = document.querySelector('.leaflet-popup-content-wrapper');
    const originalWidth = popup.offsetWidth;
    const originalHeight = popup.offsetHeight;

    const originalHeader = MISConetntDiv.querySelector('h3').outerHTML;

    const MISContent = document.createElement('div');
    MISContent.className = 'mis-popup-inner';
    MISContent.innerHTML = originalHeader;
    MISContent.style.width = `${originalWidth}px`;
    MISContent.style.height = `${originalHeight}px`;
    MISContent.style.overflowY = 'auto';

    const MISCollapsibleContainer = document.createElement('div');
    MISCollapsibleContainer.className = 'mis-content-scrollable';

    MISFeature.forEach((feature) => {
      const MISFeatureDiv = document.createElement('div');
      MISFeatureDiv.className = 'mis-collapsible-row';

      const header = document.createElement('div');
      header.className = 'mis-collapsible';
      header.textContent = `Layer: ${feature.layerName}`;
      header.addEventListener('click', () => {
        header.classList.toggle('active');
        MISFeatureDetails.style.display =
          MISFeatureDetails.style.display === 'none' ? 'table' : 'none';
      });

      const MISFeatureDetails = document.createElement('table');
      MISFeatureDetails.className = 'mis-feature-table';
      MISFeatureDetails.style.display = 'none';

      const MISFeatureProperties = feature.getProperties();
      for (const key in MISFeatureProperties) {
        if (
          MISFeatureProperties.hasOwnProperty(key) &&
          MISFeatureProperties[key] &&
          unwantedMISFeatureKeys.indexOf(key) === -1
        ) {
          const row = document.createElement('tr');

          const cellKey = document.createElement('td');
          cellKey.textContent = key;
          cellKey.style.color = 'black';
          row.appendChild(cellKey);

          const cellValue = document.createElement('td');
          cellValue.textContent = MISFeatureProperties[key];
          cellValue.style.color = 'black';
          row.appendChild(cellValue);

          MISFeatureDetails.appendChild(row);
        }
      }

      MISFeatureDiv.appendChild(header);
      MISFeatureDiv.appendChild(MISFeatureDetails);
      MISCollapsibleContainer.appendChild(MISFeatureDiv);
    });

    MISContent.appendChild(MISCollapsibleContainer);

    const MISBackButtonContainer = document.createElement('div');
    MISBackButtonContainer.className = 'mis-back-button-container';

    const MISBackButton = document.createElement('button');
    MISBackButton.textContent = 'Go Back';
    MISBackButton.style.padding = '10px 10px';
    MISBackButton.style.backgroundColor = '#ffc107';
    MISBackButton.style.border = 'none';
    MISBackButton.style.borderRadius = '4px';
    MISBackButton.style.color = 'white';

    MISBackButton.addEventListener('click', () => {
      openHKPopupWithContent(MISConetntDiv, e, map);
    });

    MISBackButtonContainer.appendChild(MISBackButton);
    MISContent.appendChild(MISBackButtonContainer);

    openHKPopupWithContent(MISContent, e, map);
  };

  MISButton.addEventListener('click', createCollapsibleContent);
  MISConetntDiv.appendChild(MISButton);
  return MISConetntDiv;
};
