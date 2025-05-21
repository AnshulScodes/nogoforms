import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./components/form-builder/FormBuilder";
import PublicFormView from "./pages/PublicFormView";
import ApiKeysManagement from "./pages/ApiKeysManagement";
import { ApiKeyVerification } from "@/components/ApiKeyVerification";
import FormResponses from "./pages/FormResponses";
import { posthog } from "@/integrations/posthog/client";

// Add CSS to hide navigation in embedded views
import "./embed.css";

const queryClient = new QueryClient();

// Initialize PostHog
posthog.init('phc_eAmZrRWDpb8NH0mfkB2EJmPddKkgMEzdGfDZxMxd55X', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'always',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
    }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/verify-api-key" element={<ApiKeyVerification />} />
          <Route path="/dashboard" element={<ApiKeyGuard><Dashboard /></ApiKeyGuard>} />
          <Route path="/builder" element={<ApiKeyGuard><FormBuilder /></ApiKeyGuard>} />
          <Route path="/builder/:formId" element={<ApiKeyGuard><FormBuilder /></ApiKeyGuard>} />
          <Route path="/api-keys" element={<ApiKeyGuard><ApiKeysManagement /></ApiKeyGuard>} />
          <Route path="/form/:formId" element={<PublicFormView />} />
          <Route path="/forms/:formId/responses" element={<ApiKeyGuard><FormResponses /></ApiKeyGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
