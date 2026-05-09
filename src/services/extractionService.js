import { DEMO_FIELDS } from "../utils/demoData";

export const extractFieldsFromPDF = async (base64Pdf) => {
  try {
    const response = await fetch("/api/extract", {
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
  } catch {
    return DEMO_FIELDS;
  }
};
