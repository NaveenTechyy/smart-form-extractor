import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useForm } from "../../context/useForm";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const SCALE = 1.4;

const PageCanvas = ({
  pdfDoc,
  pageNum,
  fields,
  focusedFieldId,
  setFocusedFieldId,
  wrapRef,
}) => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState(null);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const vp = page.getViewport({ scale: SCALE });
        if (cancelled) return;

        const canvas = canvasRef.current;
        canvas.width = vp.width;
        canvas.height = vp.height;

        await page.render({
          canvasContext: canvas.getContext("2d"),
          viewport: vp,
        }).promise;

        if (!cancelled) setCanvasSize({ width: vp.width, height: vp.height });
      } catch {
        // silently ignore render errors
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNum]);

  const pageFields = fields.filter((f) => (f.page || 1) === pageNum);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        display: "inline-block",
        marginBottom: "24px",
      }}
      className="shadow-2xl rounded-xl"
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", borderRadius: "inherit" }}
      />
      {canvasSize &&
        pageFields.map((field) => {
          const isFocused = focusedFieldId === field.id;
          return (
            <div
              key={field.id}
              onClick={() => setFocusedFieldId(field.id)}
              style={{
                position: "absolute",
                top: field.bbox.top * canvasSize.height + "px",
                left: field.bbox.left * canvasSize.width + "px",
                width: field.bbox.width * canvasSize.width + "px",
                height: field.bbox.height * canvasSize.height + "px",
                border: isFocused ? "2px solid #6c8ef7" : "2px solid #f59e0b",
                background: isFocused
                  ? "rgba(108,142,247,0.2)"
                  : "rgba(245,158,11,0.1)",
                borderRadius: "3px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxSizing: "border-box",
              }}
            />
          );
        })}
    </div>
  );
};

export const PDFViewer = () => {
  const { pdfFile, pdfFileName, fields, focusedFieldId, setFocusedFieldId } =
    useForm();
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pageWrapRefs = useRef({});
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!pdfFile) return;
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const base64 = pdfFile.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
        }
      } catch {
        // silently ignore load errors
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfFile]);

  // Scroll to the page containing the focused field
  useEffect(() => {
    if (!focusedFieldId || !fields.length) return;
    const field = fields.find((f) => f.id === focusedFieldId);
    if (!field) return;
    const wrap = pageWrapRefs.current[field.page || 1];
    if (wrap) wrap.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusedFieldId, fields]);

  const focusedField = fields.find((f) => f.id === focusedFieldId);

  if (!pdfFile) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl">
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Upload a PDF to get started
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shrink-0">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[60%]">
          {pdfFileName || "Document"}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {numPages} page{numPages !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Scrollable pages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto p-4 flex flex-col items-center min-h-0"
      >
        {isLoading && (
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4 animate-pulse">
            Rendering PDF...
          </p>
        )}
        {pdfDoc &&
          Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <PageCanvas
              key={pageNum}
              pdfDoc={pdfDoc}
              pageNum={pageNum}
              fields={fields}
              focusedFieldId={focusedFieldId}
              setFocusedFieldId={setFocusedFieldId}
              wrapRef={(el) => {
                pageWrapRefs.current[pageNum] = el;
              }}
            />
          ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shrink-0 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              {fields.length} field{fields.length !== 1 ? "s" : ""} detected
            </span>
          </div>
          {focusedField && (
            <span className="font-medium" style={{ color: "#6c8ef7" }}>
              Focused: {focusedField.label}
            </span>
          )}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "#f59e0b" }}
            />
            <span>idle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "#6c8ef7" }}
            />
            <span>focused</span>
          </div>
        </div>
      </div>
    </div>
  );
};
