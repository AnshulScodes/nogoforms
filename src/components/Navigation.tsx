import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpenText, KeyRound, LayoutDashboard } from "lucide-react";

export function Navigation() {
  const location = useLocation();
  
  // Check if we're in embedded mode
  const isEmbedded = location.search.includes('embed=true');
  if (isEmbedded) {
    return null;
  }

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
          <Link
            to="/api-keys"
            className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-gray-600"
          >
            <KeyRound className="h-4 w-4" />
            API Keys
          </Link>
        </nav>
      </div>
    </header>
  );
}
