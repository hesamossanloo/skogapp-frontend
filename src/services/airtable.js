const airtableURL = `https://api.airtable.com/v0/${process.env.REACT_APP_AIRTABLE_BASE_ID}/${process.env.REACT_APP_AIRTABLE_BESTAND_TABLE_ID}`;

const fetchRecords = async () => {
  let allRecords = [];
  let offset;

  try {
    do {
      const response = await fetch(`${airtableURL}?offset=${offset || ''}`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
        },
      });
      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset; // Airtable provides an offset if there are more records to fetch
    } while (offset); // Continue fetching until there's no offset, indicating all records have been fetched

    return allRecords;
  } catch (error) {
    console.error('Error fetching records from Airtable', error);
    throw error;
  }
};

const createRecord = async (record) => {
  try {
    const response = await fetch(airtableURL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: record }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating record in Airtable', error);
    throw error;
  }
};

export { createRecord, fetchRecords };
