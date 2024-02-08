// useCsvData.js
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const useCsvData = (url) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const reader = response.body.getReader();
        const result = await reader.read();
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value);
        Papa.parse(csv, {
          complete: (results) => setData(results.data),
          header: true,
        });
      } catch (error) {
        setError(error);
        console.error('Failed to fetch or parse the CSV:', error);
      }
    };

    fetchData();
  }, [url]);

  return { data, error };
};
export default useCsvData;
