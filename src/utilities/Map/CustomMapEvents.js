import L from 'leaflet';
import { WMSGetFeatureInfo } from 'ol/format';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import {
  CSV_URLS,
  MIS_BESTAND_IDs,
  nibioGetFeatInfoMISBaseParams,
} from 'variables/forest';
import useCsvData from './useCSVData';
import {
  calculateBoundingBox,
  calculateVolumeAndGrossValue,
  convertAndformatTheStringArealM2ToDAA,
  formatNumber,
  isPointInsideTeig,
} from './utililtyFunctions';

CustomMapEvents.propTypes = {
  activeOverlay: PropTypes.shape({
    Teig: PropTypes.bool,
    MIS: PropTypes.bool,
    Stands: PropTypes.bool,
    Skogbruksplan: PropTypes.bool,
  }).isRequired,
  setActiveOverlay: PropTypes.func.isRequired,
  setDeselectPolygons: PropTypes.func.isRequired,
  clickedOnLineRef: PropTypes.object.isRequired,
  selectedVectorFeatureRef: PropTypes.object.isRequired,
  multiPolygonSelect: PropTypes.bool.isRequired,
  deselectPolygons: PropTypes.bool.isRequired,
  madsTeig: PropTypes.object.isRequired,
  bjoernTeig: PropTypes.object.isRequired,
  knutTeig: PropTypes.object.isRequired,
  akselTeig: PropTypes.object.isRequired,
  selectedForest: PropTypes.object.isRequired,
};

export default function CustomMapEvents(props) {
  const {
    activeOverlay,
    setActiveOverlay,
    setDeselectPolygons,
    clickedOnLineRef,
    selectedVectorFeatureRef,
    madsTeig,
    bjoernTeig,
    knutTeig,
    akselTeig,
    multiPolygonSelect,
    deselectPolygons,
    selectedForest,
  } = props;
  const map = useMap();
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const granCSVData = useCsvData(CSV_URLS.GRAN).data;
  const furuCSVData = useCsvData(CSV_URLS.FURU).data;
  const CSVFeatureInfosData = useCsvData(CSV_URLS.FEATUREINFOS).data;

  const desiredAttributes = {
    teig_best_nr: 'Bestand nr',
    hogstkl_verdi: 'Hogstklasse',
    bonitet_beskrivelse: 'Bonitet',
    bontre_beskrivelse: 'Treslag',
    alder: 'Alder',
    arealDAA: 'Areal',
    volume_growth_factor: 'Årlig vekst',
    carbon_stored: 'CO2 lagret totalt',
    carbon_captured_next_year: 'CO2 lagret årlig',
  };

  useEffect(() => {
    if (deselectPolygons) {
      map.closePopup();
      setSelectedFeatures([]);
      setDeselectPolygons(false);
    } else {
      // This will reset the selected features when multiPolygonSelect changes
      setSelectedFeatures([...selectedFeatures]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiPolygonSelect, deselectPolygons]); // Dependency array includes multiPolygonSelect

  const handleSkogbrukWMSFeatures = (e, features, map, multi, MISFeature) => {
    const sumObj = {};
    sumObj.title = 'Bestand';
    const isMIS = MISFeature && MISFeature.length > 0;
    isMIS && (sumObj.title = 'MIS Bestand');
    isMIS && (sumObj.isMIS = true);

    // Multi polygon selection switch is selected
    if (
      multi &&
      features[0] &&
      features[0].properties &&
      features[0].properties.teig_best_nr
    ) {
      const joinedTeigBestNr = features
        .map((feature) => feature.properties.teig_best_nr)
        .join(', ');
      const joinedHogstklVerdi = features
        .map((feature) => feature.properties.hogstkl_verdi)
        .join(', ');
      const joinedBonitetBeskrivelse = features
        .map((feature) =>
          feature.properties.bonitet_beskrivelse.substring(
            feature.properties.bonitet_beskrivelse.indexOf(' ') + 1
          )
        )
        .join(', ');
      const joinedBontreBeskrivelse = features
        .map((feature) => feature.properties.bontre_beskrivelse)
        .join(', ');
      const joinedAlder = features
        .map((feature) => feature.properties.alder)
        .join(', ');
      const joinedVolumeGrowthFactor = features
        .map((feature) =>
          formatNumber(
            feature.properties.volume_growth_factor * 100,
            'nb-NO',
            2
          )
        )
        .join(', ');
      const totalArealM2 = features
        .map((feature) => parseInt(feature.properties.arealm2))
        .reduce((total, area) => total + area, 0);
      const totaslCarbonStored = features
        .map((feature) => parseInt(feature.properties.carbon_stored))
        .reduce((total, co2) => total + co2, 0);
      const totaslCarbonCapturedNextYear = features
        .map((feature) =>
          parseInt(feature.properties.carbon_captured_next_year)
        )
        .reduce((total, co2) => total + co2, 0);

      sumObj.teig_best_nr = joinedTeigBestNr;
      sumObj.hogstkl_verdi = joinedHogstklVerdi;
      sumObj.bonitet_beskrivelse = joinedBonitetBeskrivelse;
      sumObj.bontre_beskrivelse = joinedBontreBeskrivelse;
      sumObj.alder = joinedAlder;
      sumObj.volume_growth_factor = joinedVolumeGrowthFactor;
      // Convert it to Tonn
      sumObj.carbon_stored = formatNumber(
        totaslCarbonStored / 1000,
        'nb-NO',
        2
      );
      // Convert it to Tonn
      sumObj.carbon_captured_next_year = formatNumber(
        totaslCarbonCapturedNextYear / 1000,
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
          if (
            featProps.hogstkl_verdi === '4' ||
            featProps.hogstkl_verdi === '5'
          ) {
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
              parseFloat(foundFeatureCSVRow.volume_per_hectare_without_bark) ||
              0;
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
          }
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
        ); // Remove the first part and keep only the number

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
        // Get the carbon_stored and convert tit to Tonn
        sumObj.carbon_stored = formatNumber(
          properties.carbon_stored / 1000,
          'nb-NO',
          2
        ); // Get the carbon_captured_next_year and convert it to Tonn
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
          } = calculateVolumeAndGrossValue(
            granCSVData,
            furuCSVData,
            properties
          );

          // TODO: ATM we are getting the data from the CSV file and not WMS
          // in the future we need to either do it for all features or get it
          // directly from the GeoJSON.
          const foundFeatureCSVRow = CSVFeatureInfosData.find(
            (row) => row.bestand_id === feature.properties.teig_best_nr
          );

          // The tree density volume per stand
          sumObj.standVolumeWMSDensityPerHectareWMS =
            standVolumeWMSDensityPerHectareWMS;
          sumObj.standVolumeWMSDensityPerHectareMads = parseFloat(
            foundFeatureCSVRow.volume_per_hectare_without_bark
          );
          // sumObj.standVolumeWMSDensityPerHectareMads = parseFloat(
          //   feature.properties.Volume_per_hectare
          // );
          // The standVolumeWMS per decare (daa)
          sumObj.standVolumeWMS = standVolumeWMS;
          sumObj.standVolumeMads = foundFeatureCSVRow.volume_without_bark;
          // sumObj.standVolumeMads = parseFloat(feature.properties.Volume);
          // The price of the timber for a species
          sumObj.hardCodedSpeciesPrice = hardCodedSpeciesPrice;
          sumObj.speciesPriceMads = parseFloat(feature.properties.avg_price_m3);
          sumObj.treeCounts = parseFloat(feature.properties.ML_counted_trees);
          // The total volume
          sumObj.totalESTGrossValueWMS = totalESTGrossValueWMS;
          sumObj.totalESTGrossValueMads = parseFloat(
            foundFeatureCSVRow.gross_value_standing_volume
          );
        }
      }
    }
    if (
      features.length > 0 &&
      features[0] &&
      features[0].properties &&
      features[0].properties.teig_best_nr
    ) {
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
          <td style="padding: 5px; border: 1px solid black;">${desiredAttributes['arealDAA']}</td>
          <td style="padding: 5px; display: flex; justify-content: space-between;">
            <span style="font-weight: bold">${sumObj.arealDAA}</span>
            <span>daa</span>
          </td>
        </tr>` +
        // Add the Alder
        `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">${desiredAttributes['alder']}</td>
          <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.alder}</td>
        </tr>` +
        // Add the volume_growth_factor
        `<tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">${desiredAttributes['volume_growth_factor']}</td>
          <td style="padding: 5px; display: flex; justify-content: space-between;">
            <span style="font-weight: bold">${sumObj.volume_growth_factor}</span>
            <span>%</span>
          </td>
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
      // // Add the Tree counts
      // `<tr style="border: 1px solid black;">
      //   <td style="padding: 5px; border: 1px solid black;">Antall trær</td>
      //   <td style="padding: 5px; border: 1px solid black; font-weight: bold">${sumObj.treeCounts}</td>
      // </tr>`;
      if (
        sumObj.standVolumeWMSDensityPerHectareWMS &&
        sumObj.standVolumeWMSDensityPerHectareMads
      ) {
        // Showing the tree density volume per stand
        // content += `
        // <tr style="border: 1px solid black;">
        //   <td style="padding: 5px; border: 1px solid black;">Tømmervolum</td>
        //   <td style="padding: 5px; border: 1px solid black;"><span style="font-weight: bold">${formatNumber(sumObj.standVolumeWMSDensityPerHectareWMS, 'nb-NO', 1)}</span> m^3</td>
        // </tr>`;
        content += `
        <tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">Tømmervolum</td>
          <td style="padding: 5px; display: flex; justify-content: space-between;">
            <span style="font-weight: bold">${formatNumber(sumObj.standVolumeMads, 'nb-NO', 1)}</span>
            <span>m^3</span>
          </td>
        </tr>`;
        // Calculating the standVolumeWMS per decare (daa)
        // content += `
        // <tr style="border: 1px solid black;">
        //   <td style="padding: 5px; border: 1px solid black;">Tømmertetthet</td>
        //   <td style="padding: 5px; border: 1px solid black;"><span style="font-weight: bold">${formatNumber(sumObj.standVolumeWMS / 10, 'nb-NO', 1)}</span> m^3/daa</td>
        // </tr>`;
        content += `
        <tr style="border: 1px solid black;">
          <td style="padding: 5px; border: 1px solid black;">Tømmertetthet</td>
          <td style="padding: 5px; display: flex; justify-content: space-between; min-width: 110px">
            <span style="font-weight: bold">${formatNumber(sumObj.standVolumeWMSDensityPerHectareMads / 10, 'nb-NO', 1)}</span>
            <span>m^3/daa</span>
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
        // We are showing the total volume
        // content += `
        // <tr style="border: 1px solid black;">
        //   <td style="padding: 5px; border: 1px solid black;">Forv. brutto verdi</td>
        //   <td style="padding: 5px; border: 1px solid black;"><span style="font-weight: bold">${formatNumber(sumObj.totalESTGrossValueWMS, 'nb-NO', 0)}</span> kr</td>
        // </tr>`;
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

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;

      if (sumObj.isMIS) {
        const button = document.createElement('button');
        button.textContent = 'You clicked on an MIS Bestand!';
        button.style.padding = '10px 10px';
        button.style.backgroundColor = '#ffc107';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.color = 'white';

        // Function to set the content with the new message and back button
        const setNewContent = () => {
          console.log('Button clicked'); // Debug log

          const newContent = document.createElement('div');
          const message = document.createElement('p');
          message.textContent = 'Test';
          message.style.color = 'black';
          newContent.appendChild(message);

          const backButton = document.createElement('button');
          backButton.textContent = 'Go Back';
          backButton.style.padding = '10px 10px';
          backButton.style.backgroundColor = '#ffc107';
          backButton.style.border = 'none';
          backButton.style.borderRadius = '4px';
          backButton.style.color = 'white';

          backButton.addEventListener('click', function () {
            console.log('Back button clicked'); // Debug log
            openPopupWithContent(tempDiv);
          });

          newContent.appendChild(backButton);

          openPopupWithContent(newContent);
        };

        // Add the event listener to the button
        button.addEventListener('click', setNewContent);

        tempDiv.appendChild(button);
        content = tempDiv;
      }

      console.log(content); // Debug log for final content

      // Function to open popup with given content
      const openPopupWithContent = (popupContent) => {
        L.popup({ interactive: true })
          .setLatLng(e.latlng)
          .setContent(popupContent)
          .openOn(map);
      };

      // Open the popup with the modified content
      openPopupWithContent(content);
    }
    if (!features[0].properties.teig_best_nr) {
      L.popup({ interactive: true })
        .setLatLng(e.latlng)
        .setContent(
          '<h3 style="color: black; text-align: center;">This is not a Bestand!</h3>'
        )
        .openOn(map);
    }
  };

  useMapEvents({
    click: async (e) => {
      // Handle Clicks on Mads Forest
      if (clickedOnLineRef.current) {
        L.popup({ interactive: true })
          .setLatLng(e.latlng)
          .setContent(
            '<h3 style="color: black; text-align: center;">This is not a Bestand!</h3>'
          )
          .openOn(map);
      }
      if (
        !clickedOnLineRef.current &&
        (activeOverlay['Stands'] || activeOverlay['Skogbruksplan'])
      ) {
        // By default we are closing all the popups, in case there are any opens
        //  an then we will show the pop up after the new call to the WMS and once
        // the data are fetched.
        map.closePopup();

        // Check if the click is within the coordinates of a GeoJSON
        // In this case I am passing in the Mad's forest Teig Polygon
        const forests = [madsTeig, bjoernTeig, knutTeig, akselTeig];
        const forestName = selectedForest.name;
        const chosenForest = forests.find(
          (forest) => forest.name === forestName
        );
        let clickedOnGeoJSON = false;
        map.eachLayer((layer) => {
          if (layer instanceof L.GeoJSON) {
            layer.eachLayer((feature) => {
              if (
                feature.feature.properties.DN &&
                feature.getBounds().contains(e.latlng)
              ) {
                clickedOnGeoJSON = true;
              }
            });
          }
        });

        if (
          chosenForest &&
          isPointInsideTeig(
            e.latlng,
            chosenForest.features[0].geometry.coordinates
          ) &&
          clickedOnGeoJSON &&
          selectedVectorFeatureRef.current &&
          selectedVectorFeatureRef.current.properties
        ) {
          let MISClickedFeatureInfos;
          // In case the selected feature is already in the array,
          // which means the user has clicked on it before, we don't
          // need to add it to the array. That's why we check if the teigBestNr
          // already exists or not!
          // const teigBestNrLastSelected = newFeatures[0]?.properties?.teig_best_nr;

          const teigBestNrLastSelected =
            selectedVectorFeatureRef.current.properties.teig_best_nr;
          if (
            activeOverlay['MIS'] &&
            MIS_BESTAND_IDs.indexOf(teigBestNrLastSelected) > -1
          ) {
            // Preparing the request to GetFeatreInfo for MIS WMS
            // The NIBIO WMS expects the Query params to follow certain patterns. After
            // analysing how QGIS made the WMS call, reverse engineered the call
            // and here we are building one of those params, i.e. BBOX, size.x, size.y and the CRS
            const { CRS, size, BBOX } = calculateBoundingBox(map);
            // The params should be in uppercase, unless the WMS won't accept it
            const params = {
              ...nibioGetFeatInfoMISBaseParams,
              BBOX,
              CRS,
              WIDTH: size.x,
              HEIGHT: size.y,
              I: Math.round(e.containerPoint.x),
              J: Math.round(e.containerPoint.y),
            };
            const url = `https://wms.nibio.no/cgi-bin/mis?${new URLSearchParams(params).toString()}`;
            const response = await fetch(url);
            const data = await response.text();
            const WMSFeatureInfoRaw = new WMSGetFeatureInfo();
            MISClickedFeatureInfos = WMSFeatureInfoRaw.readFeatures(data);
          }

          // Reset selected features if not in multiPolygonSelect mode
          if (!multiPolygonSelect && clickedOnGeoJSON) {
            setSelectedFeatures([selectedVectorFeatureRef.current]); // Only the last selected feature is kept
            handleSkogbrukWMSFeatures(
              e,
              [selectedVectorFeatureRef.current],
              map,
              multiPolygonSelect,
              MISClickedFeatureInfos
            );
          } else {
            if (
              teigBestNrLastSelected &&
              !selectedFeatures.some(
                (feature) =>
                  feature.properties?.teig_best_nr === teigBestNrLastSelected
              ) &&
              clickedOnGeoJSON
            ) {
              // Add to selected features for multi selection mode
              setSelectedFeatures([
                ...selectedFeatures,
                selectedVectorFeatureRef.current,
              ]);
              handleSkogbrukWMSFeatures(
                e,
                selectedFeatures.concat([selectedVectorFeatureRef.current]),
                map,
                multiPolygonSelect,
                MISClickedFeatureInfos
              );
            } else {
              handleSkogbrukWMSFeatures(
                e,
                selectedFeatures,
                map,
                multiPolygonSelect,
                MISClickedFeatureInfos
              );
            }
          }
        }
      }
    },
    overlayadd: async (e) => {
      setActiveOverlay((prevOverlay) => ({
        ...prevOverlay,
        [e.name]: true,
      }));
    },
    overlayremove: async (e) => {
      if (activeOverlay['Stands'] || activeOverlay['Skogbruksplan']) {
        map.closePopup();
      }
    },
  });

  return null;
}
