import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { WMSGetFeatureInfo } from 'ol/format';
import { nibioGetFeatInfoBaseParams } from 'variables/forest';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

CustomMapEvents.propTypes = {
  activeOverlay: PropTypes.shape({
    Hogstklasser: PropTypes.bool,
    HogstklasserWMS: PropTypes.bool,
    CLC: PropTypes.bool,
    AR50: PropTypes.bool,
  }).isRequired,
  setActiveOverlay: PropTypes.func.isRequired,
  setActiveFeature: PropTypes.func.isRequired,
  hideLayerControlLabel: PropTypes.func.isRequired,
};

const N = 200;
export default function CustomMapEvents({
  activeOverlay,
  setActiveOverlay,
  setActiveFeature,
  hideLayerControlLabel,
}) {
  const [granCSVData, setGranCSVData] = useState([]);
  const [furuCSVData, setFuruCSVData] = useState([]);

  useEffect(() => {
    // URL to your CSV file, can be a local static file or a remote resource
    const granCSVFileUrl = '/csvs/gran.csv';
    const furuCSVFileUrl = '/csvs/furu.csv';

    async function fetchData(filepath, setData) {
      const response = await fetch(filepath);
      const reader = response.body.getReader();
      const result = await reader.read(); // raw stream
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value); // convert stream to csv text
      Papa.parse(csv, {
        complete: function (results) {
          setData(results.data);
        },
        header: true, // Set to true if your CSV has header rows, it will parse them as object keys
      });
    }

    const handleGranCSVData = (data) => {
      setGranCSVData(data);
    };

    const handleFuruCSVData = (data) => {
      setFuruCSVData(data);
    };

    fetchData(granCSVFileUrl, handleGranCSVData);
    fetchData(furuCSVFileUrl, handleFuruCSVData);
  }, []); // Empty dependency array means this effect will only run once, after the initial render

  const handleSkogbrukWMSFeatures = (e, features, map) => {
    if (features.length > 0 && features[0]) {
      const feature = features[0];
      const values = feature.values_;

      const desiredAttributes = {
        hogstkl_verdi: 'Hogstklasse',
        bonitet_beskrivelse: 'Bonitet',
        bontre_beskrivelse: 'Treslag',
        regdato: 'Registreringsdato',
        alder: 'Bestandsalder',
        areal: 'Areal daa)',
        sl_sdeid: 'ID',
      };

      const activeOverlayNames = Object.keys(activeOverlay).filter(
        (key) => activeOverlay[key] === true
      );
      // Step 1
      let estimatedHeight;
      // Step 2
      // Gu = exp( -12.920 - 0.021*alder + 2.379*ln(alder) + 0.540*ln(N) + 1.587*ln(bonitet_beskrivelse))
      let crossSectionArea;
      // Step 3
      let estimatedStandVolume;
      // Step 4
      let estimatedStandVolumeM3HAA;

      let content =
        `<h3 style="color: black; text-align: center;">${activeOverlayNames[0]}</h3>` + // Add the layer name as the title with black color and centered alignment
        '<table style="margin-bottom: 10px; border-collapse: collapse; border: 1px solid black;">'; // Add margin-bottom and border styles
      for (const key in values) {
        if (desiredAttributes[key]) {
          let value = values[key];
          if (key === 'bonitet_beskrivelse') {
            value = value.substring(value.indexOf(' ') + 1); // Remove the first part and keep only the number
          }
          content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">${desiredAttributes[key]}</td><td style="padding: 5px; border: 1px solid black;">${value}</td></tr>`; // Add padding-right and border styles
        }
      }

      // Add the additional row if hogstkl_verdi is 4 or 5
      if (values.hogstkl_verdi === '4' || values.hogstkl_verdi === '5') {
        if (values.bontre_beskrivelse === 'Gran') {
          if (granCSVData.length > 0) {
            const row = granCSVData.find(
              (row) =>
                row.H40 ===
                values.bonitet_beskrivelse.substring(
                  values.bonitet_beskrivelse.indexOf(' ') + 1
                )
            ); // Use the temporary variable in the find function
            if (row) {
              estimatedHeight = row[values.alder];
              if (parseInt(values.alder) >= 110) {
                estimatedHeight = row['110'];
              }
              if (estimatedHeight) {
                crossSectionArea = Math.exp(
                  -12.92 -
                    0.021 * parseInt(values.alder) +
                    2.379 * Math.log(values.alder) +
                    0.54 * Math.log(N) +
                    1.587 *
                      Math.log(
                        values.bonitet_beskrivelse.substring(
                          values.bonitet_beskrivelse.indexOf(' ') + 1
                        )
                      )
                );
              }
            }
          }
        }
        if (values.bontre_beskrivelse === 'Furu') {
          if (furuCSVData.length > 0) {
            const row = furuCSVData.find(
              (row) =>
                row.H40 ===
                values.bonitet_beskrivelse.substring(
                  values.bonitet_beskrivelse.indexOf(' ') + 1
                )
            ); // Use the temporary variable in the find function
            if (row) {
              estimatedHeight = row[values.alder];
              if (parseInt(values.alder) >= 110) {
                estimatedHeight = row['110'];
              }
              if (estimatedHeight) {
                crossSectionArea = Math.exp(
                  -12.92 -
                    0.021 * parseInt(values.alder) +
                    2.379 * Math.log(values.alder) +
                    0.54 * Math.log(N) +
                    1.587 *
                      Math.log(
                        values.bonitet_beskrivelse.substring(
                          values.bonitet_beskrivelse.indexOf(' ') + 1
                        )
                      )
                );
              }
            }
          }
        }
        content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">Overhøyde</td><td style="padding: 5px; border: 1px solid black;">${estimatedHeight}</td></tr>`;
        content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">Grunnflate</td><td style="padding: 5px; border: 1px solid black;">${crossSectionArea}</td></tr>`;
        content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">Volum av tømmer i bestand</td><td style="padding: 5px; border: 1px solid black;">TBD</td></tr>`;
      }

      content += '</table>';

      L.popup().setLatLng(e.latlng).setContent(content).openOn(map);
    }
  };
  const map = useMap();

  const CRS = map.options.crs.code;
  // We need to make sure that the BBOX is in the EPSG:3857 format
  // For that we must to do following
  const size = map.getSize();
  const bounds = map.getBounds();
  const southWest = map.options.crs.project(bounds.getSouthWest());
  const northEast = map.options.crs.project(bounds.getNorthEast());
  const BBOX = [southWest.x, southWest.y, northEast.x, northEast.y].join(',');

  useMapEvents({
    click: async (e) => {
      map.closePopup();
      if (activeOverlay['HogstklasserWMS'] || activeOverlay['Hogstklasser']) {
        const params = {
          ...nibioGetFeatInfoBaseParams,
          BBOX,
          CRS,
          WIDTH: size.x,
          HEIGHT: size.y,
          I: Math.round(e.containerPoint.x),
          J: Math.round(e.containerPoint.y),
        };
        const url = `https://wms.nibio.no/cgi-bin/skogbruksplan?language=nor&${new URLSearchParams(params).toString()}`;
        const response = await fetch(url);
        const data = await response.text();
        const format = new WMSGetFeatureInfo();
        const features = format.readFeatures(data);
        handleSkogbrukWMSFeatures(e, features, map);
      }
    },
    overlayadd: async (e) => {
      if (activeOverlay['Hogstklasser'] || activeOverlay['HogstklasserWMS']) {
        // #root > div.wrapper > div.main-panel > div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-layers.leaflet-control > section > div.leaflet-control-layers-overlays > label:nth-child(5)
        // document.querySelector("#root > div.wrapper > div.main-panel > div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-layers.leaflet-control > section > div.leaflet-control-layers-overlays > label:nth-child(5)")

        // Wait for the next render cycle to ensure the layer control has been updated
        setTimeout(() => {
          hideLayerControlLabel('HogstklasserWMS');
        }, 0);

        setActiveOverlay((prevOverlay) => ({
          ...prevOverlay,
          Hogstklasser: true,
          HogstklasserWMS: true,
        }));
      }
      setActiveOverlay((prevOverlay) => ({
        ...prevOverlay,
        [e.name]: true,
      }));
    },
    overlayremove: async (e) => {
      if (
        activeOverlay['Hogstklasser'] ||
        activeOverlay['HogstklasserWMS'] ||
        activeOverlay['CLC'] ||
        activeOverlay['AR50']
      ) {
        map.closePopup();
        setActiveFeature(null);
      }
      if (activeOverlay['Hogstklasser'] || activeOverlay['HogstklasserWMS']) {
        // Wait for the next render cycle to ensure the layer control has been updated
        setTimeout(() => {
          hideLayerControlLabel('HogstklasserWMS');
        }, 0);
        setActiveOverlay((prevOverlay) => ({
          ...prevOverlay,
          Hogstklasser: false,
          HogstklasserWMS: false,
        }));
      }
      setActiveOverlay((prevOverlay) => ({
        ...prevOverlay,
        [e.name]: false,
      }));
    },
  });

  return null;
}
