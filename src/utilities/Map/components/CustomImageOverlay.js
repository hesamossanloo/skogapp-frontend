import PropTypes from 'prop-types';
import { ImageOverlay, LayersControl } from 'react-leaflet';
import { HIDE_POLYGON_ZOOM_LEVEL } from 'variables/forest';
import FeaturePopup from './FeaturePopup';

const { Overlay } = LayersControl;
const CustomImageOverlay = ({
  image,
  bounds,
  opacity = 0.5, // Default opacity
  zoomLevel,
  activeOverlay,
  overlayNames, // This is now an array to check multiple conditions
  activeFeature,
  setActiveFeature,
}) => {
  // Check if the overlay should be rendered based on zoom level
  const shouldRenderOverlay = image && zoomLevel > HIDE_POLYGON_ZOOM_LEVEL;

  // Additional condition to check multiple overlay visibility settings
  const isOverlayActive = overlayNames.some((name) => activeOverlay[name]);

  return shouldRenderOverlay && isOverlayActive ? (
    <Overlay checked={true} name={overlayNames.join(', ')}>
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
    </Overlay>
  ) : null;
};
CustomImageOverlay.propTypes = {
  image: PropTypes.string.isRequired,
  bounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  opacity: PropTypes.number,
  zoomLevel: PropTypes.number.isRequired,
  activeOverlay: PropTypes.object.isRequired,
  overlayNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeFeature: PropTypes.object.isRequired,
  setActiveFeature: PropTypes.func.isRequired,
};

export default CustomImageOverlay;
