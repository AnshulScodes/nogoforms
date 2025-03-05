
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyApiKey } from "@/services/apiKeys";

export function ApiKeyGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkApiKey = async () => {
      console.log('ApiKeyGuard: Starting API key check');
      const apiKey = localStorage.getItem("formbuilder_api_key");
      console.log('ApiKeyGuard: Retrieved API key from localStorage:', apiKey ? 'Key exists' : 'No key found');
      
      if (!apiKey) {
        console.log('ApiKeyGuard: No API key found, redirecting to verification');
        navigate("/verify-api-key");
        return;
      }
      
      try {
        console.log('ApiKeyGuard: Verifying API key');
        const isValid = await verifyApiKey(apiKey);
        console.log('ApiKeyGuard: Verification result:', isValid);
        
        if (!isValid) {
          console.log('ApiKeyGuard: Invalid key, removing from storage and redirecting');
          localStorage.removeItem("formbuilder_api_key");
          navigate("/verify-api-key");
          return;
        }
        
        console.log('ApiKeyGuard: API key verified successfully');
        setVerified(true);
      } catch (error) {
        console.error("ApiKeyGuard: Error during verification:", error);
        navigate("/verify-api-key");
      } finally {
        console.log('ApiKeyGuard: Setting loading to false');
        setLoading(false);
      }
    };
    
    checkApiKey();
  }, [navigate]);

  if (loading) {
    return <div>Verifying access...</div>;
  }

  return verified ? <>{children}</> : null;
}
