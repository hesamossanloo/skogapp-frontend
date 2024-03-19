import PropTypes from 'prop-types';
import { ImageOverlay } from 'react-leaflet';
import FeaturePopup from './FeaturePopup';

const CustomImageOverlay = ({
  image,
  bounds,
  opacity = 0.5, // Default opacity
  activeOverlay,
  overlayNames, // This is now an array to check multiple conditions
  activeFeature,
  setActiveFeature,
}) => {
  // Check if the overlay should be rendered based on zoom level

  // Additional condition to check multiple overlay visibility settings
  const isOverlayActive = overlayNames.some((name) => activeOverlay[name]);

  return isOverlayActive ? (
    <>
      <ImageOverlay url={image} bounds={bounds} opacity={opacity} />
      {activeFeature && (
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
  ) : null;
};
CustomImageOverlay.propTypes = {
  image: PropTypes.string.isRequired,
  bounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  opacity: PropTypes.number,
  activeOverlay: PropTypes.object.isRequired,
  overlayNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeFeature: PropTypes.object.isRequired,
  setActiveFeature: PropTypes.func.isRequired,
};

export default CustomImageOverlay;
