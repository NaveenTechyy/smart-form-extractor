import { useState } from "react";
import { motion } from "framer-motion";
import { FormField } from "./FormField";
import { useForm } from "../../context/useForm";

export const DynamicForm = () => {
  const { fields, formValues, setErrors, isExtracting } = useForm();
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required) {
        const value = formValues[field.id];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (validateForm()) {
      alert(" Form submitted successfully!");
    }
  };

  if (fields.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Upload a PDF to see form fields
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}
        className="space-y-3 flex-1 overflow-y-auto pr-2"
      >
        
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <FormField field={field} showErrors={submitted} />
            
          </motion.div>
        ))}
        
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 shrink-0"
      >
        
        <button
          type="submit"
          disabled={isExtracting}
          className={`w-full py-3 px-4 text-white font-bold rounded-xl transition-all shadow-lg text-base ${isExtracting
              ? "bg-gradient-to-r from-slate-400 to-slate-500 cursor-not-allowed opacity-60"
              : "bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 active:shadow-md"
            }`}
        >
          
          {isExtracting ? (
            <div className="flex items-center justify-center gap-2">
              
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Extracting...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>✓ Submit Form</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
                
              </svg>
              
            </div>
          )}
          
        </button>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-semibold"
        >
          Fields with <span className="text-red-500">*</span> are
          required
        </motion.div>
        
      </motion.div>
      
    </form>
  );
};
