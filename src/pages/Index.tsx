import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Layout, PenSquare, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <main className="container px-6 py-12 mx-auto max-w-7xl">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24 animate-fade-down">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 mb-6 text-sm font-medium bg-gray-100 rounded-full animate-slide-up-fade">
              Introducing Smart Form Builder
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-balance">
              Create Beautiful Forms
              <br /> in Minutes
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
              Build high-converting forms with our intuitive drag-and-drop builder.
              No coding required.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => navigate("/builder")}
              >
                Start Building <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Layout />}
              title="Drag & Drop Builder"
              description="Create forms visually with our intuitive drag-and-drop interface."
            />
            <FeatureCard
              icon={<PenSquare />}
              title="Custom Styling"
              description="Customize every aspect of your forms to match your brand."
            />
            <FeatureCard
              icon={<Share2 />}
              title="Easy Integration"
              description="Embed forms anywhere with our lightweight SDK."
            />
          </div>
        </section>
      </main>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Card className="p-6 hover-card">
      <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Card>
  );
};

export default Index;
