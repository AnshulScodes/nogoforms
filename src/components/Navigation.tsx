
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "react-router-dom";

export function Navigation() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  // Check if we're in the embedded form view
  if (document.body.classList.contains('form-embed-view')) {
    return null;
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="font-semibold">
            Smart Form Builder
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className={`text-sm ${
                location.pathname === "/dashboard"
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
