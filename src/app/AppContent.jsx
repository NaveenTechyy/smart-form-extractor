import { useForm } from "../context/useForm";

import { TopBar } from "../components/layout/TopBar";

import { PDFUpload } from "../components/pdf/PDFUpload";
import { PDFViewer } from "../components/pdf/PDFViewer";

import { DynamicForm } from "../components/form/DynamicForm";

export function AppContent() {
  const { fields, pdfFileName } = useForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-gray-900 transition-colors flex flex-col">
      <TopBar />

      <div className="flex-1 w-full mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {fields.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <PDFUpload />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 h-full">
            {/* PDF Panel */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {pdfFileName || "PDF Document"}
                </h2>
              </div>

              <div className="flex-1 min-h-0 rounded-xl sm:rounded-2xl overflow-hidden">
                <PDFViewer />
              </div>
            </div>

            {/* Form Panel */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Extracted Form
                  </h2>
                </div>

                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  {fields.length} field
                  {fields.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex-1 min-h-0 rounded-xl sm:rounded-2xl bg-white/40 backdrop-blur-sm p-4 sm:p-6 border border-slate-200/50 flex flex-col overflow-hidden">
                <DynamicForm />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
