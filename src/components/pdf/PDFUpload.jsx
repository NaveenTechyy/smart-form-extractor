import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "../../context/useForm";
import {
  loadPDF,
  getPDFAsBase64,
  getPDFAsDataURL,
} from "../../services/pdfService";
import { extractFieldsFromPDF } from "../../services/extractionService";

export const PDFUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const {
    setFields,
    setIsExtracting,
    setPdf,
    setPdfPages,
    setFocusedFieldId,
    setPdfFile,
    setPdfFileName,
  } = useForm();

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processPDF = async (file) => {
    try {
      setIsExtracting(true);
      setStatusMessage(" Loading PDF...");
      const pdf = await loadPDF(file);
      setPdf(pdf);
      setPdfPages(pdf.numPages);
      setPdfFileName(file.name);

      const [base64, dataUrl] = await Promise.all([
        getPDFAsBase64(file),
        getPDFAsDataURL(file),
      ]);
      setPdfFile(dataUrl);

      setStatusMessage(" Processing form fields...");
      const extractedFields = await extractFieldsFromPDF(base64);

      setFields(extractedFields);

      if (extractedFields.length > 0) {
        setFocusedFieldId(extractedFields[0].id);
      }

      setStatusMessage(" PDF loaded successfully!");
      setTimeout(() => setStatusMessage(""), 2000);
    } catch {
      setStatusMessage(" Error loading PDF. Please try again.");
      setTimeout(() => setStatusMessage(""), 3000);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      processPDF(files[0]);
    } else {
      setStatusMessage(" Please drop a PDF file");
      setTimeout(() => setStatusMessage(""), 2000);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      processPDF(file);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
        className={`border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 shadow-xl shadow-blue-500/20"
            : "border-slate-300 dark:border-slate-600 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg"
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          id="pdf-input"
        />

        <label htmlFor="pdf-input" className="cursor-pointer block">
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            className="mb-4 inline-block"
          >
            <svg
              className="w-20 h-20 mx-auto text-blue-500 dark:text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"
              />
            </svg>
          </motion.div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isDragging ? "Drop PDF here" : "Drag & drop your PDF"}
          </p>

          <p className="text-slate-600 dark:text-slate-300 text-lg">
            or click to select a file
          </p>
        </label>
      </motion.div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
            statusMessage.includes("Error") || statusMessage.includes(" ")
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
          }`}
        >
          {statusMessage}
        </motion.div>
      )}
    </div>
  );
};
