import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const PROMPT = `Analyze this PDF form carefully. Extract ALL form fields and any values already filled in.
Return ONLY a valid JSON array, no markdown, no explanation.
Each item must have exactly these keys:
{
 "id": "unique_snake_case_id",
 "label": "Human readable field label",
 "type": "text|number|date|select|checkbox",
 "value": "value already in this field, or empty string if blank",
 "required": true,
 "options": [],
 "page": 1,
 "bbox": { "top": 0.0, "left": 0.0, "width": 0.0, "height": 0.0 }
}
Rules:
- bbox must point to the INPUT BOX / answer area, not the label
- Extract handwritten or typed text as value
- Checkbox checked → value = true, empty → value = false
- All coordinates normalized 0 to 1`;

const clamp = (v) => Math.min(1, Math.max(0, Number(v) || 0));

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Smart Form Extractor API" });
});

app.post("/api/extract", async (req, res) => {
  try {
    const { base64Pdf } = req.body;

    if (!base64Pdf) {
      return res
        .status(400)
        .json({ success: false, error: "base64Pdf is required" });
    }

    const result = await model.generateContent([
      { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
      PROMPT,
    ]);

    let text = (await result.response)
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      return res
        .status(422)
        .json({
          success: false,
          error: "Could not parse fields from response",
        });
    }

    const fields = JSON.parse(jsonMatch[0]).map((f, index) => ({
      id: f.id || `field_${index + 1}`,
      label: f.label || "",
      type: ["text", "number", "date", "select", "checkbox"].includes(f.type)
        ? f.type
        : "text",
      value: f.value != null ? f.value : "",
      required: Boolean(f.required),
      options: Array.isArray(f.options)
        ? f.options.filter((o) => typeof o === "string")
        : [],
      page: Number(f.page) || 1,
      bbox: {
        top: clamp(f?.bbox?.top),
        left: clamp(f?.bbox?.left),
        width: clamp(f?.bbox?.width || 0.2),
        height: clamp(f?.bbox?.height || 0.03),
      },
    }));

    return res.json({ success: true, fields });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: err.message || "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);
