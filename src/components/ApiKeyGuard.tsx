
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyApiKey } from "@/services/apiKeys";

export function ApiKeyGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkApiKey = async () => {
      const apiKey = localStorage.getItem("formbuilder_api_key");
      
      if (!apiKey) {
        navigate("/verify-api-key");
        return;
      }
      
      try {
        const isValid = await verifyApiKey(apiKey);
        
        if (!isValid) {
          // Remove invalid key from storage
          localStorage.removeItem("formbuilder_api_key");
          navigate("/verify-api-key");
          return;
        }
        
        setVerified(true);
      } catch (error) {
        console.error("API key verification error:", error);
        navigate("/verify-api-key");
      } finally {
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
