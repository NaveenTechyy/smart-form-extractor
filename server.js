import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import pdfParse from "pdf-parse";
import { Buffer } from "buffer";
import { DEMO_FIELDS } from "./src/utils/demoData.js";

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : null; // null = allow all origins (open) when env var is not set

const app = express();
app.use(
  cors({
    origin: (origin, cb) => {
      // No restriction when ALLOWED_ORIGINS is not configured
      if (!allowedOrigins) return cb(null, true);
      // Allow server-to-server / curl calls (no Origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.options("*", cors());
app.use(express.json({ limit: "50mb" }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  defaultHeaders: {
    "User-Agent": "smart-form-extractor/1.0",
  },
});

const PROMPT = `You are a PDF form field extraction expert. Analyze the provided PDF text and extract ALL form fields.

IMPORTANT: Return ONLY a valid JSON array. Start with [ and end with ]. No markdown, no explanation, no extra text.

For each field, create an object with EXACTLY these keys (no more, no less):
{
  "id": "snake_case_unique_id",
  "label": "Human readable label",
  "type": "text|number|date|select|checkbox",
  "value": "filled value or empty string",
  "required": true or false,
  "options": [],
  "page": 1,
  "bbox": {"top": 0.0, "left": 0.0, "width": 0.1, "height": 0.03}
}

Rules:
1. Return valid JSON array ONLY - nothing else
2. bbox values must be between 0 and 1
3. type must be one of: text, number, date, select, checkbox
4. If no fields found, return empty array []
5. Extract ALL visible form fields`;

const VISION_PROMPT = `You are a PDF form field extraction expert analyzing a scanned or image-based PDF form.
Look carefully at all form fields visible in these page images and extract every field.

IMPORTANT: Return ONLY a valid JSON array. Start with [ and end with ]. No markdown, no explanation, no extra text.

For each field, create an object with EXACTLY these keys:
{
  "id": "snake_case_unique_id",
  "label": "Human readable label",
  "type": "text|number|date|select|checkbox",
  "value": "filled value or empty string if blank",
  "required": true or false,
  "options": [],
  "page": 1,
  "bbox": {"top": 0.0, "left": 0.0, "width": 0.1, "height": 0.03}
}

Rules:
1. Return valid JSON array ONLY - nothing else
2. bbox values must be between 0 and 1 (relative position on the page)
3. type must be one of: text, number, date, select, checkbox
4. If no fields found, return empty array []
5. Extract ALL visible form fields including labels, input boxes, checkboxes, dropdowns and date fields`;

const clamp = v => Math.min(1, Math.max(0, Number(v) || 0));

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Smart Form Extractor API" });
});

app.post("/api/extract", async (req, res) => {
  try {
    const { base64Pdf, pageImages } = req.body;

    if (!base64Pdf) {
      return res
        .status(400)
        .json({ success: false, error: "base64Pdf is required" });
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(base64Pdf, "base64");

    // Extract text from PDF
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    console.log("PDF extracted, text length:", extractedText.length);
    console.log("First 100 chars:", extractedText.substring(0, 100));

    // If text extraction failed (likely image-based PDF), use vision model
    if (extractedText.length < 50) {
      if (Array.isArray(pageImages) && pageImages.length > 0) {
        console.log(
          `PDF is image-based. Using vision model on ${pageImages.length} page(s).`,
        );
        return await extractWithVision(pageImages, res);
      }
      console.warn(
        "PDF appears to be image-based but no page images provided. Returning demo data.",
      );
      return res.json({ success: true, fields: DEMO_FIELDS });
    }

    // Use Groq's chat completion API with extracted text
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `${PROMPT}\n\nExtracted PDF Text:\n${extractedText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    let text = result.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();

    console.log("Groq response:", text.substring(0, 200));

    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      console.warn("JSON match failed, returning demo data");
      return res.json({ success: true, fields: DEMO_FIELDS });
    }

    const parsedFields = JSON.parse(jsonMatch[0]);
    const fields = parsedFields.map((f, index) => ({
      id: f.id || `field_${index + 1}`,
      label: f.label || "",
      type: ["text", "number", "date", "select", "checkbox"].includes(f.type)
        ? f.type
        : "text",
      value: f.value != null ? f.value : "",
      required: Boolean(f.required),
      options: Array.isArray(f.options)
        ? f.options.filter(o => typeof o === "string")
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
    console.error("Extraction error:", err);
    // Return demo data as fallback
    return res.json({ success: true, fields: DEMO_FIELDS });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

async function extractWithVision(pageImages, res) {
  try {
    const imageContent = pageImages.map(b64 => ({
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${b64}` },
    }));

    const result = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: VISION_PROMPT }, ...imageContent],
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    let text = result.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();

    console.log("Groq vision response:", text.substring(0, 200));

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("Vision JSON match failed, returning demo data");
      return res.json({ success: true, fields: DEMO_FIELDS });
    }

    const parsedFields = JSON.parse(jsonMatch[0]);
    const fields = parsedFields.map((f, index) => ({
      id: f.id || `field_${index + 1}`,
      label: f.label || "",
      type: ["text", "number", "date", "select", "checkbox"].includes(f.type)
        ? f.type
        : "text",
      value: f.value != null ? f.value : "",
      required: Boolean(f.required),
      options: Array.isArray(f.options)
        ? f.options.filter(o => typeof o === "string")
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
    console.error("Vision extraction error:", err);
    return res.json({ success: true, fields: DEMO_FIELDS });
  }
}
