import { FormProvider } from "./context/FormProvider";
import { AppContent } from "./app/AppContent";

function App() {
  return (
    <FormProvider>
      <AppContent />
    </FormProvider>
  );
}

export default App;
