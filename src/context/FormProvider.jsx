import { useState } from "react";
import { FormContext } from "./FormContext";

export const FormProvider = ({ children }) => {
  const [fields, _setFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [focusedFieldId, setFocusedFieldId] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errors, setErrors] = useState({});
  const [pdf, setPdf] = useState(null);
  const [pdfPages, setPdfPages] = useState(0);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");

  const setFields = (extractedFields) => {
    _setFields(extractedFields);
    const init = {};
    extractedFields.forEach((f) => {
      if (f.type === "checkbox") {
        init[f.id] = f.value === true || f.value === "true" || f.value === 1;
      } else {
        init[f.id] = f.value != null && f.value !== "" ? String(f.value) : "";
      }
    });
    setFormValues(init);
  };

  const value = {
    fields,
    setFields,
    formValues,
    setFormValues,
    focusedFieldId,
    setFocusedFieldId,
    isExtracting,
    setIsExtracting,
    errors,
    setErrors,
    pdf,
    setPdf,
    pdfPages,
    setPdfPages,
    pdfFile,
    setPdfFile,
    pdfFileName,
    setPdfFileName,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};
