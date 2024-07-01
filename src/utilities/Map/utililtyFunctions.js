import * as turf from '@turf/turf';
import L from 'leaflet';
import {
  desiredFeatInfoAttrHKLayer,
  desiredFeatInfoAttrHKLayerWithUnits,
  SPECIES,
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
    case 2:
      BGColor = '#f2b370';
      break;
    case 3:
      BGColor = '#aebb7a';
      break;
    case 4:
      BGColor = '#bc8963';
      break;
    case 5:
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

export const calculateFeatInfoHKTotals = (
  selectedFeatures,
  airTableFeatInfos,
  userSpeciesPrices
) => {
  const totals = selectedFeatures.reduce(
    (acc, feature) => {
      const props = feature.properties;
      const foundRow =
        airTableFeatInfos.find(
          (row) => row.fields.bestand_id === props.teig_best_nr
        ) || {};

      const airTableRowFields = foundRow.fields;
      // If user has provided prices, the new price values will override th old ones
      airTableRowFields.avg_price_m3 = calculateAvgPrice(
        airTableRowFields,
        userSpeciesPrices
      );
      acc.totalArealM2 += parseInt(airTableRowFields.arealm2, 10) || 0;
      acc.totalCarbonStored +=
        parseInt(airTableRowFields.carbon_stored, 10) || 0;
      acc.totalCarbonCapturedNextYear +=
        parseInt(airTableRowFields.carbon_captured_next_year, 10) || 0;

      acc.standVolumeWMSDensityPerHectareMads +=
        parseFloat(airTableRowFields.volume_per_hectare_without_bark) || 0;
      acc.standVolumeMads +=
        parseFloat(airTableRowFields.volume_without_bark) || 0;
      acc.avgSpeciesPriceCalculated +=
        parseFloat(airTableRowFields.avg_price_m3) || 0;
      // from https://trello.com/c/RTkPLbFf/330-let-forester-provide-input-prices-and-logging-costs
      // To calculate gross values: (Forv. Brutto Verdi): volume_at_maturity_without_bark * avg_price;
      acc.totalBruttoVerdi +=
        parseFloat(airTableRowFields.volume_at_maturity_without_bark) *
          parseFloat(airTableRowFields.avg_price_m3) || 0;
      // TODO Ask Mads about the gross value calculation
      // acc.totalBruttoVerdi +=
      //   parseFloat(airTableRowFields.gross_value_standing_volume) || 0;

      // from https://trello.com/c/RTkPLbFf/330-let-forester-provide-input-prices-and-logging-costs
      // totalNettoVerdi = Forv. Brutto Verdi - volume_at_maturity_without_bark * hogst&utkjøring_cost_per_m3
      if (userSpeciesPrices.hogstUtkPrice) {
        acc.totalNettoVerdi +=
          parseFloat(airTableRowFields.volume_at_maturity_without_bark) *
            parseFloat(airTableRowFields.avg_price_m3) -
            parseFloat(airTableRowFields.volume_at_maturity_without_bark) *
              parseFloat(userSpeciesPrices.hogstUtkPrice) || 0;
      }

      return acc;
    },
    {
      totalArealM2: 0,
      totalCarbonStored: 0,
      totalCarbonCapturedNextYear: 0,
      standVolumeWMSDensityPerHectareMads: 0,
      standVolumeMads: 0,
      avgSpeciesPriceCalculated: 0,
      totalBruttoVerdi: 0,
      totalNettoVerdi: 0,
    }
  );

  return totals;
};

export const calculateAvgPrice = (
  corresponsingAirtTableFeature,
  userSpeciesPrices
) => {
  let avgPrice = 0;
  switch (corresponsingAirtTableFeature.treslag) {
    case SPECIES.GRAN:
      // from https://trello.com/c/RTkPLbFf/330-let-forester-provide-input-prices-and-logging-costs
      // avg_price = saw_wood_portion * price_saw_wood + (1 - saw_wood_portion) * price_pulp_wood;
      if (
        userSpeciesPrices.granSagtommerPrice &&
        userSpeciesPrices.granMassevirkePrice
      ) {
        avgPrice =
          parseFloat(corresponsingAirtTableFeature.saw_wood_portion) *
            parseFloat(userSpeciesPrices.granSagtommerPrice) +
          (1 - parseFloat(corresponsingAirtTableFeature.saw_wood_portion)) *
            parseFloat(userSpeciesPrices.granMassevirkePrice);
      } else {
        avgPrice = corresponsingAirtTableFeature.avg_price_m3;
      }
      break;
    case SPECIES.FURU:
      if (
        userSpeciesPrices.furuSagtommerPrice &&
        userSpeciesPrices.furuMassevirkePrice
      ) {
        avgPrice =
          parseFloat(corresponsingAirtTableFeature.saw_wood_portion) *
            parseFloat(userSpeciesPrices.furuSagtommerPrice) +
          (1 - parseFloat(corresponsingAirtTableFeature.saw_wood_portion)) *
            parseFloat(userSpeciesPrices.furuMassevirkePrice);
      } else {
        avgPrice = corresponsingAirtTableFeature.avg_price_m3;
      }
      break;
    case SPECIES.LAU:
      // TODO Ask Mads what about Bjork Lau and the saw and pulp prices
      avgPrice = corresponsingAirtTableFeature.avg_price_m3;
      break;
    default:
      avgPrice = 0;
      break;
  }
  return avgPrice;
};

export const generateHKPopupContent = (
  sumObj,
  selectedFeatures,
  multiSwitchOn,
  airTableBestandFeatInfos,
  userSpeciesPrices
) => {
  let content =
    `<h3 style="color: black; text-align: center;">${sumObj.title}</h3>` +
    '<table style="margin-bottom: 10px; border-collapse: collapse; border: 1px solid black;">';

  if (multiSwitchOn) {
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
      ${userSpeciesPrices.hogstUtkPrice ? `<th style="padding: 5px; border: 1px solid black;">Forv. netto verdi (kr)</th>` : ''}
    </tr>`;

    selectedFeatures.forEach((feature) => {
      const corresponsingAirtTableFeature = airTableBestandFeatInfos.find(
        (featureData) =>
          featureData.fields.bestand_id === feature.properties.teig_best_nr
      ).fields;
      const rowBGColor = getHKBGColor(
        corresponsingAirtTableFeature.hogstkl_verdi
      );
      corresponsingAirtTableFeature.avg_price_m3 = calculateAvgPrice(
        corresponsingAirtTableFeature,
        userSpeciesPrices
      );
      content += `<tr style="background-color: ${rowBGColor}">`;
      content += `<td style="padding: 5px; border: 1px solid black;">${corresponsingAirtTableFeature.bestand_id}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${corresponsingAirtTableFeature.hogstkl_verdi}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${corresponsingAirtTableFeature.bonitet}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${corresponsingAirtTableFeature.treslag}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${corresponsingAirtTableFeature.alder}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${convertAndformatTheStringArealM2ToDAA(corresponsingAirtTableFeature.arealm2)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(corresponsingAirtTableFeature.carbon_stored / 1000, 'nb-NO', 2)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(corresponsingAirtTableFeature.carbon_captured_next_year / 1000, 'nb-NO', 2)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(parseFloat(corresponsingAirtTableFeature.volume_per_hectare_without_bark) / 10, 'nb-NO', 1)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(corresponsingAirtTableFeature.volume_without_bark, 'nb-NO', 1)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(corresponsingAirtTableFeature.volume_growth_factor * 100, 'nb-NO', 2)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(corresponsingAirtTableFeature.avg_price_m3, 'nb-NO', 1)}</td>`;
      content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(corresponsingAirtTableFeature.volume_at_maturity_without_bark * corresponsingAirtTableFeature.avg_price_m3, 'nb-NO', 1)}</td>`;
      if (userSpeciesPrices.hogstUtkPrice) {
        content += `<td style="padding: 5px; border: 1px solid black;">${formatNumber(corresponsingAirtTableFeature.volume_at_maturity_without_bark * corresponsingAirtTableFeature.avg_price_m3 - corresponsingAirtTableFeature.volume_at_maturity_without_bark * userSpeciesPrices.hogstUtkPrice, 'nb-NO', 1)}</td>`;
      }
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
    content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold">${formatNumber(sumObj.totalBruttoVerdi, 'nb-NO', 1)}</td>`;
    if (sumObj.totalNettoVerdi) {
      content += `<td style="padding: 5px; border: 1px solid black; font-weight: bold">${formatNumber(sumObj.totalNettoVerdi, 'nb-NO', 1)}</td>`;
    }
    content += '</tr>';
  } else {
    const selectedFeature = selectedFeatures[0];
    const corresponsingAirtTableFeature = airTableBestandFeatInfos.find(
      (featureData) =>
        featureData.fields.bestand_id ===
        selectedFeature.properties.teig_best_nr
    ).fields;

    corresponsingAirtTableFeature.avg_price_m3 = calculateAvgPrice(
      corresponsingAirtTableFeature,
      userSpeciesPrices
    );

    sumObj.bestand_id = corresponsingAirtTableFeature.bestand_id;
    // Get Hogstklasse
    sumObj.hogstkl_verdi = corresponsingAirtTableFeature.hogstkl_verdi;

    // Get the Bonitet
    sumObj.bonitet = corresponsingAirtTableFeature.bonitet;

    // Get the Treslag
    sumObj.treslag = corresponsingAirtTableFeature.treslag;

    // Calculate arealDAA
    sumObj.arealDAA = convertAndformatTheStringArealM2ToDAA(
      corresponsingAirtTableFeature.arealm2
    );

    // Get the Alder
    sumObj.alder = corresponsingAirtTableFeature.alder;

    // Get the volume_growth_factor
    sumObj.volume_growth_factor = formatNumber(
      corresponsingAirtTableFeature.volume_growth_factor * 100,
      'nb-NO',
      2
    );

    // Get the carbon_stored and convert it to Tonn
    sumObj.carbon_stored = formatNumber(
      corresponsingAirtTableFeature.carbon_stored / 1000,
      'nb-NO',
      2
    );

    // Get the carbon_captured_next_year and convert it to Tonn
    sumObj.carbon_captured_next_year = formatNumber(
      corresponsingAirtTableFeature.carbon_captured_next_year / 1000,
      'nb-NO',
      2
    );

    let rowBGColor = getHKBGColor(sumObj.hogstkl_verdi);

    content +=
      // Add the ID row
      `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">ID</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.bestand_id}</td>
        </tr>` +
      // Add Hogstklasse
      `<tr style="border: 1px solid black; background-color: ${rowBGColor}">
          <td style="padding: 5px; border: 1px solid black;">${desiredFeatInfoAttrHKLayer['hogstkl_verdi']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold;">${sumObj.hogstkl_verdi}</td>
        </tr>` +
      // Add Bonitet
      `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">${desiredFeatInfoAttrHKLayer['bonitet_beskrivelse']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.bonitet}</td>
        </tr>` +
      // Add the Treslag
      `<tr style="border: 1px solid black; background-color: ${rowBGColor}">
          <td style="padding: 5px; border: 1px solid black;">${desiredFeatInfoAttrHKLayer['bontre_beskrivelse']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.treslag}</td>
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
                <span style="font-weight: bold">${formatNumber(sumObj.avgSpeciesPriceCalculated, 'nb-NO', 0)}</span>
                <span>kr</span>
              </td>
            </tr>`;
      content += `
            <tr style="border: 1px solid black;">
              <td style="padding: 5px; border: 1px solid black;">Forv. brutto verdi</td>
              <td style="padding: 5px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold">${formatNumber(sumObj.totalBruttoVerdi, 'nb-NO', 0)}</span>
                <span>kr</span>
              </td>
            </tr>`;
      if (sumObj.totalNettoVerdi) {
        content += `
              <tr style="border: 1px solid black; background-color: ${rowBGColor}">
                <td style="padding: 5px; border: 1px solid black;">Forv. netto verdi</td>
                <td style="padding: 5px; display: flex; justify-content: space-between;">
                  <span style="font-weight: bold">${formatNumber(sumObj.totalNettoVerdi, 'nb-NO', 0)}</span>
                  <span>kr</span>
                </td>
              </tr>`;
      }
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
