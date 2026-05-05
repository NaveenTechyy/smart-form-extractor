import { DEMO_FIELDS } from "../utils/demoData";

export const extractFieldsFromPDF = async base64Pdf => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("API key not found, using demo data");
    return DEMO_FIELDS;
  }

  try {
    // Note: Direct browser requests to Claude API won't work due to CORS restrictions.
    // For production, use a backend proxy or serverless function.
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this PDF form and extract all form fields. Return a JSON array with the following structure for each field:
{
  "id": "unique_field_id",
  "label": "Field Label",
  "type": "text|number|date|select|checkbox|email",
  "value": "",
  "required": true|false,
  "options": ["option1", "option2"] (only for select type),
  "page": 1,
  "bbox": {"top": 0.0-1.0, "left": 0.0-1.0, "width": 0.0-1.0, "height": 0.0-1.0}
}

The bbox values should be normalized to 0-1 fractions representing percentages of the PDF page.
Return ONLY the JSON array, no other text.`,
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64Pdf,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("Could not parse JSON from API response, using demo data");
      return DEMO_FIELDS;
    }

    const fields = JSON.parse(jsonMatch[0]);
    return fields;
  } catch (error) {
    console.error("Error extracting fields:", error);
    console.warn("Using demo bank fields instead. For real AI extraction, use a backend proxy.");
    return DEMO_FIELDS;
  }
};
