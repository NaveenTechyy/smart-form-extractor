import { useState, useEffect } from "react";
import { FormProvider } from "./context/FormContext";
import { useForm } from "./context/useForm";
import { TopBar } from "./components/TopBar";
import { PDFUpload } from "./components/PDFUpload";
import { PDFViewer } from "./components/PDFViewer";
import { DynamicForm } from "./components/DynamicForm";

function AppContent() {
  const { fields } = useForm();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-gray-900 dark:text-white transition-colors flex flex-col">
      <TopBar />

      <div className="flex-1 w-full mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {fields.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <PDFUpload />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 h-full">
            {/* Left Panel - PDF Viewer */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                  PDF Document
                </h2>
              </div>
              <div className="flex-1 min-h-0 rounded-xl sm:rounded-2xl overflow-hidden">
                <PDFViewer />
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                  Extracted Form
                </h2>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto rounded-xl sm:rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm p-4 sm:p-6 border border-slate-200/50 dark:border-slate-700/50">
                <DynamicForm />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-blue-500/20 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border-2 border-slate-200 dark:border-slate-700"
        title="Toggle dark mode"
      >
        <span className="text-2xl">{isDarkMode ? "☀️" : "🌙"}</span>
      </button>
    </div>
  );
}

function App() {
  return (
    <FormProvider>
      <AppContent />
    </FormProvider>
  );
}

export default App;
