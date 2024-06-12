import Papa from 'papaparse';
import { useEffect, useState } from 'react';

const useCsvData = (url) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text(); // Directly read text instead of using a reader
        Papa.parse(text, {
          complete: (results) => setData(results.data),
          header: true,
          error: (err) => setError(err), // Handle parsing errors
        });
      } catch (error) {
        setError(error);
        console.error('Failed to fetch or parse the CSV:', error);
      }
    };

    fetchData();
  }, [url]); // Dependency array to re-fetch only when URL changes

  return { data, error };
};

export default useCsvData;
