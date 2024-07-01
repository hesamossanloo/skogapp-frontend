// src/RecordsContext.js
import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import { fetchRecords } from '../services/airtable';

const FeatureInfosContext = createContext();

const FeatureInfosProvider = ({ children }) => {
  // Add 'children' to props validation
  FeatureInfosProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const [airTableBestandInfos, setAirTableBestandInfos] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    // Fetch Airtable Bestandsdata
    const getSheetRecords = async () => {
      setIsFetching(true);
      try {
        const records = await fetchRecords();
        setAirTableBestandInfos(records);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setIsFetching(false);
      }
    };

    getSheetRecords();
  }, []);

  return (
    <FeatureInfosContext.Provider
      value={{
        airTableBestandInfos,
        isFetching,
      }}
    >
      {children}
    </FeatureInfosContext.Provider>
  );
};

export { FeatureInfosContext, FeatureInfosProvider };
