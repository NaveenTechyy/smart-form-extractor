import { useContext } from "react";
import { FormContext } from "./FormContext";

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within FormProvider");
  }
  return context;
};
