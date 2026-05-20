import { DEMO_FIELDS } from "../utils/demoData";

export const extractFieldsFromPDF = async (base64Pdf) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  try {
    const response = await fetch(`${apiUrl}/api/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Pdf }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    if (data.fields && data.fields.length > 0) return data.fields;
    return DEMO_FIELDS;
  } catch (error) {
    console.error('Extraction failed:', error);
    return DEMO_FIELDS;
  }
};
