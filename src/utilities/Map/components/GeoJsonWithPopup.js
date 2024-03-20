import PropTypes from 'prop-types';
import { GeoJSON } from 'react-leaflet';
import FeaturePopup from './FeaturePopup';

const GeoJsonWithPopup = ({
  data,
  onEachFeature,
  activeFeature,
  activeOverlay,
  overlayName,
  setActiveFeature,
}) => (
  <>
    <GeoJSON data={data} onEachFeature={onEachFeature} />
    {activeFeature && activeOverlay[overlayName] && (
      <FeaturePopup
        activeOverlay={activeOverlay}
        activeFeature={{
          lng: activeFeature.geometry.coordinates[0][0][0][1],
          lat: activeFeature.geometry.coordinates[0][0][0][0],
          properties: activeFeature.properties,
        }}
        setActiveFeature={setActiveFeature}
      />
    )}
  </>
);

GeoJsonWithPopup.propTypes = {
  data: PropTypes.object.isRequired,
  onEachFeature: PropTypes.func.isRequired,
  activeFeature: PropTypes.object,
  activeOverlay: PropTypes.object.isRequired,
  overlayName: PropTypes.string.isRequired,
  setActiveFeature: PropTypes.func.isRequired,
};

export default GeoJsonWithPopup;
