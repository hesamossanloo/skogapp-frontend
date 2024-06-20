import L from 'leaflet';
import { unwantedMISFeatureKeys } from 'variables/forest';
import {
  calculateVolumeAndGrossValue,
  convertAndformatTheStringArealM2ToDAA,
  formatNumber,
} from './utililtyFunctions';

export const SkogbrukWMSFeaturesHandler = (
  e,
  features,
  map,
  multi,
  MISFeature,
  granCSVData,
  furuCSVData,
  CSVFeatureInfosData,
  clickedOnLineRef
) => {
  const desiredAttributes = {
    teig_best_nr: 'Bestand nr',
    hogstkl_verdi: 'Hogstklasse',
    bonitet_beskrivelse: 'Bonitet',
    bontre_beskrivelse: 'Treslag',
    alder: 'Alder',
    arealDAA: 'Areal',
    carbon_stored: 'CO2 lagret totalt',
    carbon_captured_next_year: 'CO2 lagret årlig',
  };
  const desiredAttributesWithUnits = {
    ...desiredAttributes,
    arealDAA: 'Areal (daa)',
    carbon_stored: 'CO2 lagret totalt (T)',
    carbon_captured_next_year: 'CO2 lagret årlig (T)',
  };

  const sumObj = {};
  sumObj.title = 'Bestand';
  const isMIS = MISFeature && MISFeature.length > 0;
  isMIS && (sumObj.title = 'MIS Bestand');
  isMIS && (sumObj.isMIS = true);

  if (
    multi &&
    features[0] &&
    features[0].properties &&
    features[0].properties.teig_best_nr
  ) {
    const totalArealM2 = features
      .map((feature) => parseInt(feature.properties.arealm2))
      .reduce((total, area) => total + area, 0);
    const totalCarbonStored = features
      .map((feature) => parseInt(feature.properties.carbon_stored))
      .reduce((total, co2) => total + co2, 0);
    const totalCarbonCapturedNextYear = features
      .map((feature) => parseInt(feature.properties.carbon_captured_next_year))
      .reduce((total, co2) => total + co2, 0);

    sumObj.carbon_stored = formatNumber(totalCarbonStored / 1000, 'nb-NO', 2);
    // Convert it to Tonn
    sumObj.carbon_captured_next_year = formatNumber(
      totalCarbonCapturedNextYear / 1000,
      'nb-NO',
      2
    );
    sumObj.arealDAA = convertAndformatTheStringArealM2ToDAA(totalArealM2);

    // Caclulate the total volume and gross value based on the Furur and Gran CSV files
    const {
      standVolumeWMSDensityPerHectareWMS,
      standVolumeWMSDensityPerHectareMads,
      standVolumeWMS,
      standVolumeMads,
      hardCodedSpeciesPrice,
      speciesPriceMads,
      totalESTGrossValueWMS,
      totalESTGrossValueMads,
    } = features.reduce(
      (result, feature) => {
        const featProps = feature.properties;
        const foundFeatureCSVRow = CSVFeatureInfosData.find(
          (row) => row.bestand_id === featProps.teig_best_nr
        );

        const additionalRows = calculateVolumeAndGrossValue(
          granCSVData,
          furuCSVData,
          featProps
        );
        result.standVolumeWMSDensityPerHectareWMS +=
          additionalRows.standVolumeWMSDensityPerHectareWMS || 0;
        result.standVolumeWMSDensityPerHectareMads +=
          parseFloat(foundFeatureCSVRow.volume_per_hectare_without_bark) || 0;
        result.standVolumeWMS += additionalRows.standVolumeWMS || 0;
        result.standVolumeMads +=
          parseFloat(foundFeatureCSVRow.volume_without_bark) || 0;
        result.hardCodedSpeciesPrice =
          additionalRows.hardCodedSpeciesPrice || 0;
        result.speciesPriceMads = parseFloat(featProps.avg_price_m3) || 0;
        result.totalESTGrossValueWMS +=
          additionalRows.totalESTGrossValueWMS || 0;
        result.totalESTGrossValueMads +=
          parseFloat(foundFeatureCSVRow.gross_value_standing_volume) || 0;
        return result;
      },
      {
        standVolumeWMSDensityPerHectareWMS: 0,
        standVolumeWMSDensityPerHectareMads: 0,
        standVolumeWMS: 0,
        standVolumeMads: 0,
        hardCodedSpeciesPrice: 0,
        speciesPriceMads: 0,
        totalESTGrossValueWMS: 0,
        totalESTGrossValueMads: 0,
      }
    );

    sumObj.standVolumeWMSDensityPerHectareWMS =
      standVolumeWMSDensityPerHectareWMS;
    sumObj.standVolumeWMSDensityPerHectareMads =
      standVolumeWMSDensityPerHectareMads;
    sumObj.standVolumeWMS = standVolumeWMS;

    sumObj.standVolumeMads = standVolumeMads;

    sumObj.hardCodedSpeciesPrice = hardCodedSpeciesPrice;
    sumObj.speciesPriceMads = speciesPriceMads;
    sumObj.totalESTGrossValueWMS = totalESTGrossValueWMS;
    sumObj.totalESTGrossValueMads = totalESTGrossValueMads;

    let content =
      `<h3 style="color: black; text-align: center;">${sumObj.title}</h3>` +
      '<table style="margin-bottom: 10px; border-collapse: collapse; border: 1px solid black;">' +
      '<tr>';
    Object.values(desiredAttributesWithUnits).forEach((attr) => {
      content += `<th style="padding: 5px; border: 1px solid black;">${attr}</th>`;
    });
    content += `
          <th style="padding: 5px; border: 1px solid black;">Tømmertetthet (m^3/daa)</th>
          <th style="padding: 5px; border: 1px solid black;">Tømmervolum (m^3)</th>
          <th style="padding: 5px; border: 1px solid black;">Årlig vekst (%)</th>
          <th style="padding: 5px; border: 1px solid black;">Forv. gj.sn pris per m^3 (kr)</th>
          <th style="padding: 5px; border: 1px solid black;">Forv. brutto verdi (kr)</th>
        </tr>`;

    features.forEach((feature) => {
      const props = feature.properties;
      content += '<tr>';
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

    content += '</table>';

    const MISConetntDiv = document.createElement('div');
    MISConetntDiv.className = 'mis-popup-content';
    MISConetntDiv.innerHTML = content;

    if (sumObj.isMIS) {
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

        MISFeature.forEach((feature, index) => {
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
          openPopupWithContent(MISConetntDiv);
        });

        MISBackButtonContainer.appendChild(MISBackButton);
        MISContent.appendChild(MISBackButtonContainer);

        openPopupWithContent(MISContent);
      };

      MISButton.addEventListener('click', createCollapsibleContent);
      MISConetntDiv.appendChild(MISButton);
      content = MISConetntDiv;
    }

    const openPopupWithContent = (popupContent) => {
      const popup = L.popup({
        interactive: true,
        maxWidth: 'auto',
        minWidth: 300, // Adjust this value as needed
        maxHeight: 'auto',
      })
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);

      const popupContainer = popup.getElement();
      popupContainer.style.width = 'auto';
      popupContainer.style.height = 'auto';
    };

    openPopupWithContent(content);
  } else {
    // Single polygon selection switch is selected

    if (
      features.length > 0 &&
      features[0] &&
      features[0].properties &&
      features[0].properties.teig_best_nr &&
      !clickedOnLineRef.current
    ) {
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
      sumObj.arealDAA = convertAndformatTheStringArealM2ToDAA(
        properties.arealm2
      );

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

      // Add the additional row if hogstkl_verdi is 4 or 5
      if (
        properties.hogstkl_verdi === '4' ||
        properties.hogstkl_verdi === '5'
      ) {
        const {
          standVolumeWMSDensityPerHectareWMS,
          standVolumeWMS,
          hardCodedSpeciesPrice,
          totalESTGrossValueWMS,
        } = calculateVolumeAndGrossValue(granCSVData, furuCSVData, properties);

        const foundFeatureCSVRow = CSVFeatureInfosData.find(
          (row) => row.bestand_id === feature.properties.teig_best_nr
        );

        sumObj.standVolumeWMSDensityPerHectareWMS =
          standVolumeWMSDensityPerHectareWMS;
        sumObj.standVolumeWMSDensityPerHectareMads = parseFloat(
          foundFeatureCSVRow.volume_per_hectare_without_bark
        );
        sumObj.standVolumeWMS = standVolumeWMS;
        sumObj.standVolumeMads = foundFeatureCSVRow.volume_without_bark;
        sumObj.hardCodedSpeciesPrice = hardCodedSpeciesPrice;
        sumObj.speciesPriceMads = parseFloat(feature.properties.avg_price_m3);
        sumObj.totalESTGrossValueWMS = totalESTGrossValueWMS;
        sumObj.totalESTGrossValueMads = parseFloat(
          foundFeatureCSVRow.gross_value_standing_volume
        );
      }

      let content =
        // Add the layer name as the title with black color and centered alignment
        `<h3 style="color: black; text-align: center;">${sumObj.title}</h3>` +
        // Add margin-bottom and border styles
        '<table style="margin-bottom: 10px; border-collapse: collapse; border: 1px solid black;">' +
        // Add the ID row
        `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">ID</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.teig_best_nr}</td>
        </tr>` +
        // Add Hogstklasse
        `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">${desiredAttributes['hogstkl_verdi']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.hogstkl_verdi}</td>
        </tr>` +
        // Add Bonitet
        `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">${desiredAttributes['bonitet_beskrivelse']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.bonitet_beskrivelse}</td>
        </tr>` +
        // Add the Treslag
        `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">${desiredAttributes['bontre_beskrivelse']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.bontre_beskrivelse}</td>
        </tr>` +
        // Add the ArealM2
        `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black; min-width: 110px">${desiredAttributes['arealDAA']}</td>
          <td style="padding: 5px; display: flex; justify-content: space-between; min-width: 110px">
            <span style="font-weight: bold">${sumObj.arealDAA}</span>
            <span>daa</span>
          </td>
        </tr>` +
        // Add the Alder
        `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">${desiredAttributes['alder']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.alder}</td>
        </tr>` +
        // Add the carbon_stored
        `<tr style="border: 1px solid black;">
            <td style="padding: 5px; border: 1px solid black;">${desiredAttributes['carbon_stored']}</td>
            <td style="padding: 5px; display: flex; justify-content: space-between;">
              <span style="font-weight: bold">${sumObj.carbon_stored}</span>
              <span>T</span>
            </td>
        </tr>` +
        // Add the carbon_captured_next_year
        `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">${desiredAttributes['carbon_captured_next_year']}</td>
          <td style="padding: 5px; display: flex; justify-content: space-between;">
            <span style="font-weight: bold">${sumObj.carbon_captured_next_year}</span>
            <span>T</span>
          </td>
        </tr>`;
      if (
        sumObj.standVolumeWMSDensityPerHectareWMS &&
        sumObj.standVolumeWMSDensityPerHectareMads
      ) {
        content += `
        <tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">Tømmertetthet</td>
          <td style="padding: 5px; display: flex; justify-content: space-between;">
            <span style="font-weight: bold">${formatNumber(sumObj.standVolumeWMSDensityPerHectareMads / 10, 'nb-NO', 1)}</span>
            <span>m^3/daa</span>
          </td>
        </tr>`;
        content += `
        <tr style="border: 1px solid black;">
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
        <tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">Forv. gj.sn pris per m^3</td>
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
      content += '</table>';

      const MISConetntDiv = document.createElement('div');
      MISConetntDiv.className = 'mis-popup-content';
      MISConetntDiv.innerHTML = content;

      if (sumObj.isMIS) {
        const MISButton = document.createElement('button');
        MISButton.textContent = 'View MIS Content!';
        MISButton.style.padding = '10px 10px';
        MISButton.style.backgroundColor = '#ffc107';
        MISButton.style.border = 'none';
        MISButton.style.borderRadius = '4px';
        MISButton.style.color = 'white';

        const createCollapsibleContent = () => {
          const popup = document.querySelector(
            '.leaflet-popup-content-wrapper'
          );
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

          MISFeature.forEach((feature, index) => {
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
            openPopupWithContent(MISConetntDiv);
          });

          MISBackButtonContainer.appendChild(MISBackButton);
          MISContent.appendChild(MISBackButtonContainer);

          openPopupWithContent(MISContent);
        };

        MISButton.addEventListener('click', createCollapsibleContent);
        MISConetntDiv.appendChild(MISButton);
        content = MISConetntDiv;
      }

      const openPopupWithContent = (popupContent) => {
        const popup = L.popup({
          interactive: true,
          maxWidth: 'auto',
          minWidth: 300, // Adjust this value as needed
          maxHeight: 'auto',
        })
          .setLatLng(e.latlng)
          .setContent(popupContent)
          .openOn(map);

        const popupContainer = popup.getElement();
        popupContainer.style.width = 'auto';
        popupContainer.style.height = 'auto';
      };

      openPopupWithContent(content);
    }
  }
};

export default SkogbrukWMSFeaturesHandler;
