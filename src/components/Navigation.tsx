import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpenText, KeyRound, LayoutDashboard, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function Navigation() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  // Check if we're in embedded mode
  const isEmbedded = location.search.includes('embed=true');
  if (isEmbedded) {
    return null;
  }
  // Admin check logic can remain if needed
  useEffect(() => {
    const checkAdminStatus = async () => {
      // You may want to keep or remove this logic depending on your needs
      // For now, we'll just set admin to true for demonstration
      setIsAdmin(true);
    };
    checkAdminStatus();
  }, []);
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          NogoForms
        </Link>
        <nav className="flex items-center gap-6">
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
        </nav>
      </div>
    </header>
  );
}
