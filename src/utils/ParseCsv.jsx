import Papa from 'papaparse';

export default function parseAndClean(csvText) {
    const { data, errors } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    if (errors.length) console.error('CSV parsing errors:', errors);
  
    return data.map(row => {
      const cleaned = {};
      Object.entries(row).forEach(([rawKey, rawVal]) => {
        const key = rawKey.trim();
        let val = rawVal;
        if (typeof val === 'string') val = val.trim();
        cleaned[key] = val;
      });
      return cleaned;
    });
  }