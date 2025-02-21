
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Auth error details:", {
          code: error.status,
          name: error.name,
          message: error.message,
          details: error,
        });
        
        toast({
          variant: "destructive",
          title: `Error: ${error.name || 'Authentication Failed'}`,
          description: (
            <div className="mt-1">
              <p>{error.message}</p>
              <p className="text-xs mt-2 text-gray-500">
                Status code: {error.status || 'unknown'}
              </p>
              {error.status === 422 && (
                <p className="text-xs mt-1 text-gray-500">
                  This usually means the email/password format is invalid. 
                  Ensure your password is at least 6 characters long.
                </p>
              )}
              {error.status === 400 && (
                <p className="text-xs mt-1 text-gray-500">
                  This usually means invalid credentials or the email is not verified.
                </p>
              )}
            </div>
          ),
        });
        throw error;
      }

      // Log successful response for debugging
      console.log("Auth response:", {
        user: data?.user,
        session: data?.session,
      });

      toast({
        title: isSignUp ? "Account created!" : "Welcome back!",
        description: isSignUp
          ? "Please check your email to verify your account."
          : "Successfully signed in.",
      });

      if (!isSignUp) navigate("/builder");
    } catch (error: any) {
      // Log any unexpected errors
      console.error("Unexpected auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Loading..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </button>
        </div>
      </Card>
    </div>
  );
}
