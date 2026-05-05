# Smart Form Extractor

A modern React + Vite + Tailwind CSS application for intelligent PDF form extraction using Claude AI. Extract form fields from scanned bank documents with automatic field detection and mapping.

## Features

- **AI-Powered PDF Analysis**: Uses Claude Sonnet 4 to intelligently extract form fields from PDF documents
- **Real-time PDF Viewer**: Interactive PDF viewer with visual field overlays and highlighting
- **Dynamic Form Rendering**: Automatically generates form UI based on extracted fields
- **Multiple Field Types**: Support for text, number, date, select, checkbox, and email fields
- **Form Validation**: Built-in inline validation for required fields
- **Drag & Drop Upload**: Easy-to-use drag-and-drop interface for PDF uploads
- **Dark Mode**: Full dark theme support with manual toggle
- **Smooth Animations**: Field interactions with framer-motion animations
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Fallback Demo Data**: Pre-configured bank form fields as fallback if API is unavailable

## Tech Stack

- **React 18**: UI framework
- **Vite 4**: Build tool and dev server
- **Tailwind CSS 3**: Styling with dark mode support
- **Framer Motion**: Animation library
- **PDF.js (pdfjs-dist)**: PDF rendering and manipulation
- **Claude API**: AI-powered form extraction
- **Anthropic SDK**: API integration

## Setup Instructions

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### Installation

1. **Clone or navigate to the project directory**

   ```bash
   cd smart-form-extractor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env
   ```

4. **Add your API key to .env**

   ```
   VITE_ANTHROPIC_API_KEY=your-actual-api-key-here
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Architecture & Approach

### State Management

The application uses **React Context API with useState hooks** for global state management:

```javascript
// FormContext provides:
- fields: Extracted form fields array
- formValues: Current form input values
- focusedFieldId: Currently focused field for PDF sync
- isExtracting: Loading state during API calls
- errors: Form validation errors
- pdf: PDF.js document object
- pdfPages: Total number of pages
```

**Why Context + useState?**

- Simple and lightweight - no external dependencies needed
- Perfect for mid-scale apps (10-50 form fields)
- Easy to debug with React DevTools
- Natural React patterns (no boilerplate like Redux)
- Fast re-renders through useContext subscriptions

### Component Structure

```
App.jsx (wraps with FormProvider)
├── TopBar (branding & header)
├── PDFUpload (drag-drop zone)
├── Grid Layout (when PDF loaded)
│   ├── PDFViewer
│   │   ├── Canvas (PDF.js rendering)
│   │   └── Overlay boxes (field highlights)
│   └── DynamicForm
│       ├── FormField (repeating for each field)
│       └── Submit button
```

### PDF Extraction Flow

1. **User uploads PDF** → PDFUpload component reads file
2. **File → Base64** → pdfService converts for API
3. **Claude API Call** → Sends PDF + extraction prompt
4. **Parse JSON Response** → Extract field coordinates and types
5. **Update Context** → Fields populate FormContext
6. **Render Form + PDF** → DynamicForm & PDFViewer subscribe to context changes
7. **Field Focus Sync** → Clicking form field highlights PDF box, scrolls to page

### AI Extraction Details

**API Call Structure:**

- Model: `claude-sonnet-4-20250514`
- Max tokens: 2000
- Input: PDF as base64 + structured extraction prompt
- Output: JSON array with field definitions

**Expected JSON Response:**

```json
[
  {
    "id": "field_unique_id",
    "label": "Field Label",
    "type": "text|number|date|select|checkbox",
    "value": "",
    "required": true,
    "options": ["opt1", "opt2"],
    "page": 1,
    "bbox": { "top": 0.15, "left": 0.1, "width": 0.3, "height": 0.05 }
  }
]
```

**Fallback Behavior:**
If API call fails or no key is provided, the app loads 10 demo bank form fields for testing.

## Handling Real OCR + AI

For production use with scanned forms:

### Option 1: Direct Claude Vision (Current)

- Pros: Simple, built-in, handles PDFs directly
- Cons: May miss text in poor-quality scans
- Best for: High-quality PDFs, documents with clear typography

### Option 2: OCR Pre-processing

```javascript
// Add to pdfService.js
import Tesseract from "tesseract.js";

export const ocrPDF = async pdfFile => {
  // Convert each PDF page to image
  // Run Tesseract.js OCR on images
  // Return extracted text
  // Pass text to Claude for field extraction
};
```

### Option 3: AWS Textract Integration

```javascript
// Replace claudeService.js API call
const textractClient = new TextractClient();
const extractedText = await textractClient.detectDocumentText(...);
// Send extracted text + layout to Claude
```

### Recommended Production Stack

1. **PDF → Image Conversion**: pdf-lib or sharp
2. **OCR**: Tesseract.js (free) or AWS Textract (fast)
3. **Field Detection**: Claude Sonnet 4 (excellent with multi-modal)
4. **Database**: PostgreSQL + pgvector for storing extracted data
5. **Validation**: Yup or Zod schemas matching field types

## Form Field Types

| Type     | HTML Input                | Validation         | Example         |
| -------- | ------------------------- | ------------------ | --------------- |
| text     | `<input type="text">`     | Non-empty string   | "John Doe"      |
| number   | `<input type="number">`   | Numeric value      | "1234567890"    |
| date     | `<input type="date">`     | YYYY-MM-DD         | "1990-05-15"    |
| select   | `<select>`                | Must match options | "Savings"       |
| checkbox | `<input type="checkbox">` | Boolean            | true/false      |
| email    | `<input type="email">`    | Email format       | "user@bank.com" |

## Styling

- **Dark Mode**: Controlled by `isDarkMode` state in App.jsx
- **Theme Toggle**: Bottom-right button toggles between light/dark
- **Tailwind Config**: Dark mode enabled via `darkMode: 'class'`
- **Color Scheme**: Blues for primary actions, grays for text, reds for errors

## Keyboard Shortcuts (Future Enhancement)

```
Tab/Shift+Tab: Navigate form fields
Enter: Submit form
Esc: Clear focus
D: Toggle dark mode
```

## Troubleshooting

### "API key not found" warning

- Check `.env` file exists and contains `VITE_ANTHROPIC_API_KEY`
- App will use demo data if key is missing
- Dev server must restart after changing `.env`

### PDF not rendering

- Ensure PDF is valid and not corrupted
- Check browser console for PDF.js worker errors
- Confirm CDN link in pdfService.js is accessible

### Form fields not syncing with PDF

- Check FormContext provider wraps entire app
- Verify focusedFieldId updates when clicking field
- Inspect React DevTools to see context state changes

### API rate limits

- Claude API has rate limits per plan
- Implement request debouncing for multiple PDFs
- Add exponential backoff for retries

## Performance Tips

1. **Large PDFs**: Consider splitting into pages
2. **Many Fields**: Implement pagination in form
3. **Animations**: Disable animations on lower-end devices
4. **Caching**: Store extracted fields in localStorage for repeat uploads

## License

MIT

## Contributing

Contributions welcome! Areas for enhancement:

- Multi-page PDF support (currently pages 1 only)
- Field auto-population from stored templates
- Export to CSV/JSON functionality
- Integration with form builders (Formik, React Hook Form)
- Undo/redo for form edits
- Field type auto-detection improvements

## Support

For issues or questions:

1. Check this README
2. Review Claude API docs at [docs.anthropic.com](https://docs.anthropic.com)
3. Check PDF.js documentation
