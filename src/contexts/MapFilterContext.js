import PropTypes from 'prop-types';
import { createContext, useState } from 'react';

export const MapFilterContext = createContext();

const defaultMapFilter = {
  Protected: false,
  HK4: false,
  HK5: false,
};
export const MapFilterProvider = ({ children }) => {
  const [mapFilter, setMapFilter] = useState(defaultMapFilter);

  return (
    <MapFilterContext.Provider value={[mapFilter, setMapFilter]}>
      {children}
    </MapFilterContext.Provider>
  );
};
MapFilterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
