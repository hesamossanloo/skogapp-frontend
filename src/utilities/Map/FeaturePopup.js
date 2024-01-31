import React from 'react';
import { Popup } from 'react-leaflet';
import PropTypes from 'prop-types';

const FeaturePopup = ({ activeFeature, setActiveFeature }) => {
  return (
    <Popup
      position={[activeFeature.lng, activeFeature.lat]}
      onClose={() => setActiveFeature(null)}
    >
      <table
        style={{
          border: '1px solid black',
          borderCollapse: 'collapse',
        }}
      >
        <tbody>
          {Object.entries(activeFeature.properties).map(
            ([key, value], index) => (
              <tr key={index} style={{ border: '1px solid black' }}>
                <td
                  style={{
                    padding: '5px',
                    borderRight: '1px solid black',
                  }}
                >
                  {key}
                </td>
                <td style={{ padding: '5px' }}>{value}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </Popup>
  );
};

FeaturePopup.propTypes = {
  activeFeature: PropTypes.shape({
    lng: PropTypes.array.isRequired,
    lat: PropTypes.array.isRequired,
    properties: PropTypes.object.isRequired,
  }).isRequired,
  setActiveFeature: PropTypes.func.isRequired,
};

export default FeaturePopup;
