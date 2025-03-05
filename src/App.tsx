import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { ApiKeyGuard } from "@/components/ApiKeyGuard";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./components/form-builder/FormBuilder";
import PublicFormView from "./pages/PublicFormView";
import ApiKeysManagement from "./pages/ApiKeysManagement";
import { ApiKeyVerification } from "@/components/ApiKeyVerification";
import FormResponses from "@/pages/FormResponses";

// Add CSS to hide navigation in embedded views
import "./embed.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/verify-api-key" element={
            <AuthGuard>
              <ApiKeyVerification />
            </AuthGuard>
          } />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <ApiKeyGuard>
                  <Dashboard />
                </ApiKeyGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/builder"
            element={
              <AuthGuard>
                <ApiKeyGuard>
                  <FormBuilder />
                </ApiKeyGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/builder/:formId"
            element={
              <AuthGuard>
                <ApiKeyGuard>
                  <FormBuilder />
                </ApiKeyGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/api-keys"
            element={
              <AuthGuard>
                <ApiKeyGuard>
                  <ApiKeysManagement />
                </ApiKeyGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/form/:formId"
            element={
              <PublicFormView />
            }
          />
          <Route path="/forms/:formId/responses" element={<FormResponses />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
