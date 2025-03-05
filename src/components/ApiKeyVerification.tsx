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
  const [userInfo, setUserInfo] = useState<{
    id?: string;
    name?: string;
    email?: string;
  }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if API key is already in localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem("formbuilder_api_key");
    const storedUserInfo = localStorage.getItem("formbuilder_user_info");
    
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    
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
    
    try {
      const isValid = await verifyApiKey(keyToVerify);
      
      if (isValid) {
        console.log('API key is valid, storing in localStorage');
        localStorage.setItem("formbuilder_api_key", keyToVerify);
        setIsVerified(true);
        
        toast({
          title: "API Key Verified",
          description: "Your API key has been verified successfully!",
        });
        
        // Instead of navigating, we'll show the onboarding form
        setTimeout(() => {
          setIsVerified(true);
        }, 500);
      } else {
        console.log('API key is invalid');
        toast({
          variant: "destructive",
          title: "Invalid API Key",
          description: "The API key you entered is invalid. Please try again with the correct key.",
        });
      }
    } catch (error) {
      console.error("API key verification error:", error);
      
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "An error occurred while verifying your API key. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    const formUrl = new URL("https://nogoforms-l6d1vj1wa-anshulscodes-projects.vercel.app/form/96ce8e8d-5942-4897-9002-18f9c5ac22ba");
    
    // Add user parameters if available
    if (userInfo.id) formUrl.searchParams.set("userId", userInfo.id);
    if (userInfo.name) formUrl.searchParams.set("userName", userInfo.name);
    if (userInfo.email) formUrl.searchParams.set("userEmail", userInfo.email);

    return (
      <div className="w-full h-[600px]">
        <iframe 
          src={formUrl.toString()}
          width="100%" 
          height="600" 
          frameBorder="0"
          title="Onboarding Form"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>API Key Verification</CardTitle>
          <CardDescription>
            Enter your API key to access the form builder platform.
            {import.meta.env.DEV && (
              <div className="mt-2 text-sm text-muted-foreground">
                (Development mode: try using "dev-key-123")
              </div>
            )}
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
