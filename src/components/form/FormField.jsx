import { motion } from "framer-motion";
import { useForm } from "../../context/useForm";

const TYPE_BADGE_COLORS = {
  text: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  email:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
  number:
    "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
  date: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
  select: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-300",
  checkbox: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
};

export const FormField = ({ field, showErrors }) => {
  const {
    formValues,
    setFormValues,
    focusedFieldId,
    setFocusedFieldId,
    errors,
  } = useForm();

  const value = formValues[field.id] ?? "";
  const error = showErrors ? errors[field.id] : null;
  const isFocused = focusedFieldId === field.id;

  const handleChange = (newValue) => {
    setFormValues((prev) => ({
      ...prev,
      [field.id]: newValue,
    }));
  };

  const handleFocus = () => {
    setFocusedFieldId(field.id);
  };

  const renderInput = () => {
    switch (field.type) {
      case "text":
      case "email":
        return (
          <input
            type={field.type === "email" ? "email" : "text"}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={`w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-lg transition-all ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : isFocused
                  ? "border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-lg shadow-blue-500/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none font-medium`}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={`w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-lg transition-all ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : isFocused
                  ? "border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-lg shadow-blue-500/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none font-medium`}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            className={`w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-lg transition-all ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : isFocused
                  ? "border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-lg shadow-blue-500/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            } text-gray-900 dark:text-white focus:outline-none font-medium`}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            className={`w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 rounded-lg transition-all ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : isFocused
                  ? "border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-lg shadow-blue-500/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            } text-gray-900 dark:text-white focus:outline-none font-medium cursor-pointer`}
          >
            
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-3 cursor-pointer group">
            
            <div className="relative">
              
              <input
                type="checkbox"
                checked={value === true || value === "true"}
                onChange={(e) => handleChange(e.target.checked)}
                onFocus={handleFocus}
                className="sr-only"
              />
              <div
                className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                  value === true || value === "true"
                    ? "bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-500 shadow-lg shadow-blue-500/30"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 group-hover:border-blue-400 dark:group-hover:border-blue-400"
                }`}
              >
                {(value === true || value === "true") && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-gray-900 dark:text-white font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {field.label}     
            </span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        error
          ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10"
          : isFocused
            ? "border-slate-200 dark:border-slate-700 bg-blue-50/60 dark:bg-blue-900/10"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
      style={{
        transition: "all 0.2s ease",
        borderLeftColor: error ? "#f87171" : isFocused ? "#6c8ef7" : undefined,
        borderLeftWidth: isFocused || error ? "3px" : undefined,
      }}
    >
      
      <div className="flex items-start justify-between gap-2 mb-3">
        
        <label className="flex items-center gap-2">
          
          <span className="font-bold text-gray-900 dark:text-white">
            {field.label}    
          </span>
          {field.required && (
            <span className="text-red-500 font-bold text-lg">*</span>
          )}
        </label>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${
            TYPE_BADGE_COLORS[field.type] ?? TYPE_BADGE_COLORS.text
          }`}
        >
          {field.type}   
        </span>
      </div>
      {renderInput()}  
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 dark:text-red-400 text-sm mt-2 font-semibold flex items-center gap-1"
        >
          {error}   
        </motion.p>
      )}
    </div>
  );
};
