import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { verifyApiKey } from "@/services/apiKeys";
import { useToast } from "@/hooks/use-toast";

export function ApiKeyVerification() {
  const [apiKey, setApiKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if API key is already in localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem("formbuilder_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
      handleVerify(storedApiKey);
    }
  }, []);

  const handleVerify = async (keyToVerify: string) => {
    console.log('Starting verification process for key:', keyToVerify);
    
    if (!keyToVerify.trim()) {
      console.log('Empty API key provided');
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please enter your API key to continue",
      });
      return;
    }

    setIsVerifying(true);
    console.log('Setting verification state to true');
    
    try {
      console.log('Calling verifyApiKey function');
      const isValid = await verifyApiKey(keyToVerify);
      console.log('Verification result:', isValid);
      
      if (isValid) {
        console.log('API key is valid, storing in localStorage');
        localStorage.setItem("formbuilder_api_key", keyToVerify);
        setIsVerified(true);
        
        toast({
          title: "API Key Verified",
          description: "Your API key has been verified successfully!",
        });
        
        console.log('Starting navigation delay');
        setTimeout(() => {
          console.log('Navigating to dashboard');
          navigate("/dashboard");
        }, 1500);
      } else {
        console.log('API key is invalid');
        toast({
          variant: "destructive",
          title: "Invalid API Key",
          description: "The API key you entered is invalid or has been revoked. Please contact the administrator.",
        });
      }
    } catch (error) {
      console.error("Detailed API key verification error:", {
        error,
        message: error.message,
        stack: error.stack,
        details: error.details || 'No additional details'
      });
      
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "An error occurred while verifying your API key. Please try again.",
      });
    } finally {
      console.log('Setting verification state to false');
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>API Key Verification</CardTitle>
          <CardDescription>
            Enter your API key to access the form builder platform.
            If you don't have an API key, please contact the administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="apiKey"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isVerifying || isVerified}
                type="password"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleVerify(apiKey)} 
            disabled={isVerifying || isVerified || !apiKey.trim()}
            className="w-full"
          >
            {isVerifying ? "Verifying..." : isVerified ? "Verified ✓" : "Verify API Key"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
