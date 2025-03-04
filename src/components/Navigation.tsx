
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BookOpenText, KeyRound, LayoutDashboard, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function Navigation() {
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  // Check if we're in embedded mode
  const isEmbedded = location.search.includes('embed=true');
  
  // Hide navigation in embedded mode
  if (isEmbedded) {
    return null;
  }

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (data && !error) {
        setIsAdmin(true);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    // Clear API key from localStorage
    localStorage.removeItem("formbuilder_api_key");
    navigate("/auth");
  };

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          Form Builder
        </Link>
        
        <nav className="flex items-center gap-6">
          {!loading && user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-gray-600"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              
              <Link
                to="/builder"
                className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-gray-600"
              >
                <BookOpenText className="h-4 w-4" />
                New Form
              </Link>
              
              {isAdmin && (
                <Link
                  to="/api-keys"
                  className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-gray-600"
                >
                  <KeyRound className="h-4 w-4" />
                  API Keys
                </Link>
              )}
              
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">
                  <User className="h-4 w-4 inline-block mr-1" />
                  {user.email}
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-500">
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            !loading && (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  Sign in
                </Button>
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
