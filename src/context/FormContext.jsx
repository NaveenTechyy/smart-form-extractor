import { useState } from "react";
import { FormContext } from "./FormContextCreate";

export const FormProvider = ({ children }) => {
  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [focusedFieldId, setFocusedFieldId] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errors, setErrors] = useState({});
  const [pdf, setPdf] = useState(null);
  const [pdfPages, setPdfPages] = useState(0);

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
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};
