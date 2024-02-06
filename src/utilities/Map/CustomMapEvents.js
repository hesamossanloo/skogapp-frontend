import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { WMSGetFeatureInfo } from 'ol/format';
import { nibioGetFeatInfoBaseParams } from 'variables/forest';

CustomMapEvents.propTypes = {
  activeOverlay: PropTypes.shape({
    Hogstklasser: PropTypes.bool,
    HogstklasserWMS: PropTypes.bool,
    CLC: PropTypes.bool,
    AR50: PropTypes.bool,
  }).isRequired,
  setActiveOverlay: PropTypes.func.isRequired,
  setActiveFeature: PropTypes.func.isRequired,
  handleSkogbrukWMSFeatures: PropTypes.func.isRequired,
  hideLayerControlLabel: PropTypes.func.isRequired,
};

export default function CustomMapEvents({
  activeOverlay,
  setActiveOverlay,
  setActiveFeature,
  hideLayerControlLabel,
}) {
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

      let content =
        `<h3 style="color: black; text-align: center;">${activeOverlayNames[0]}</h3>` + // Add the layer name as the title with black color and centered alignment
        '<table style="margin-bottom: 10px; border-collapse: collapse; border: 1px solid black;">'; // Add margin-bottom and border styles
      for (const key in values) {
        if (desiredAttributes[key]) {
          content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">${desiredAttributes[key]}</td><td style="padding: 5px; border: 1px solid black;">${values[key]}</td></tr>`; // Add padding-right and border styles
        }
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
