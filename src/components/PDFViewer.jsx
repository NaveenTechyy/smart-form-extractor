import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "../context/useForm";
import { renderPDFPage, bboxToPixels } from "../services/pdfService";

export const PDFViewer = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { pdf, fields, focusedFieldId, setFocusedFieldId, pdfPages } =
    useForm();

  useEffect(() => {
    if (!pdf || !canvasRef.current || fields.length === 0) return;

    const render = async () => {
      try {
        setIsLoading(true);
        const currentPage = focusedFieldId
          ? fields.find((f) => f.id === focusedFieldId)?.page || 1
          : 1;

        await renderPDFPage(pdf, currentPage, canvasRef.current);
      } catch (error) {
        console.error("Error rendering PDF:", error);
      } finally {
        setIsLoading(false);
      }
    };

    render();
  }, [pdf, focusedFieldId, fields]);

  const currentPage = focusedFieldId
    ? fields.find((f) => f.id === focusedFieldId)?.page || 1
    : 1;

  const pageFields = fields.filter((f) => f.page === currentPage);

  if (!pdf) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl">
        <p className="text-slate-500 dark:text-slate-400 text-lg">Upload a PDF to get started</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-start bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-auto p-6"
    >
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg mb-4"
        >
          ⚡ Rendering PDF...
        </motion.div>
      )}

      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          className="shadow-2xl rounded-xl overflow-hidden"
          style={{
            maxWidth: "100%",
            height: "auto",
            display: "block",
          }}
        />

        {canvasRef.current &&
          canvasRef.current.width > 0 &&
          pageFields.map((field) => {
            const pixelBbox = bboxToPixels(
              field.bbox,
              canvasRef.current.width,
              canvasRef.current.height
            );
            const isFocused = focusedFieldId === field.id;

            return (
              <motion.div
                key={field.id}
                className={`absolute cursor-pointer transition-all rounded-lg ${
                  isFocused
                    ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-800 shadow-lg shadow-blue-500/50 bg-blue-500 bg-opacity-15"
                    : "ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-slate-800 shadow-md shadow-amber-400/30 bg-amber-400 bg-opacity-10 hover:shadow-lg hover:shadow-amber-400/40"
                }`}
                style={{
                  top: `${pixelBbox.top}px`,
                  left: `${pixelBbox.left}px`,
                  width: `${pixelBbox.width}px`,
                  height: `${pixelBbox.height}px`,
                }}
                onClick={() => setFocusedFieldId(field.id)}
                animate={isFocused ? { scale: 1.05 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute -top-7 left-0 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap z-10 shadow-md ${
                    isFocused
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900"
                  }`}
                >
                  {field.label}
                </motion.div>
              </motion.div>
            );
          })}
      </div>

      {pdfPages > 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
        >
          📄 Page {currentPage} of {pdfPages}
        </motion.div>
      )}
    </div>
  );
};
