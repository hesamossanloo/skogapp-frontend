import { useMap, useMapEvents } from 'react-leaflet';
import PropTypes from 'prop-types';
import { WMSGetFeatureInfo } from 'ol/format';

CustomMapEvents.propTypes = {
  activeOverlay: PropTypes.shape({
    HogstklasserPNG: PropTypes.bool,
    HogstklasserWMS: PropTypes.bool,
    CLC: PropTypes.bool,
    AR50: PropTypes.bool,
  }).isRequired,
  setActiveOverlay: PropTypes.func.isRequired,
  setActiveFeature: PropTypes.func.isRequired,
  handleSkogbrukWMSFeatures: PropTypes.func.isRequired,
  hideLayerControlLabel: PropTypes.func.isRequired,
  nibioGetFeatInfoBaseParams: PropTypes.object.isRequired,
};

export default function CustomMapEvents({
  activeOverlay,
  setActiveOverlay,
  setActiveFeature,
  handleSkogbrukWMSFeatures,
  hideLayerControlLabel,
  nibioGetFeatInfoBaseParams,
}) {
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
      if (
        activeOverlay['HogstklasserWMS'] ||
        activeOverlay['HogstklasserPNG']
      ) {
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
      if (
        activeOverlay['HogstklasserPNG'] ||
        activeOverlay['HogstklasserWMS']
      ) {
        // #root > div.wrapper > div.main-panel > div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-layers.leaflet-control > section > div.leaflet-control-layers-overlays > label:nth-child(5)
        // document.querySelector("#root > div.wrapper > div.main-panel > div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-layers.leaflet-control > section > div.leaflet-control-layers-overlays > label:nth-child(5)")

        // Wait for the next render cycle to ensure the layer control has been updated
        setTimeout(() => {
          hideLayerControlLabel('HogstklasserWMS');
        }, 0);

        setActiveOverlay((prevOverlay) => ({
          ...prevOverlay,
          HogstklasserPNG: true,
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
        activeOverlay['HogstklasserPNG'] ||
        activeOverlay['HogstklasserWMS'] ||
        activeOverlay['CLC'] ||
        activeOverlay['AR50']
      ) {
        map.closePopup();
        setActiveFeature(null);
      }
      if (
        activeOverlay['HogstklasserPNG'] ||
        activeOverlay['HogstklasserWMS']
      ) {
        // Wait for the next render cycle to ensure the layer control has been updated
        setTimeout(() => {
          hideLayerControlLabel('HogstklasserWMS');
        }, 0);
        setActiveOverlay((prevOverlay) => ({
          ...prevOverlay,
          HogstklasserPNG: false,
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
