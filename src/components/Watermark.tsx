import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export function Watermark() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-2 right-2 text-xs text-muted-foreground/50 hover:text-muted-foreground cursor-pointer transition-colors"
      >
        made by Nogo
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Build Your Own Custom Form</DialogTitle>
            <DialogDescription className="space-y-4 pt-3">
              <p>
                Want a form like this for your business? We're a focused team that prioritizes delivering value to our clients 
                rather than maintaining a fancy corporate image. This allows us to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep costs lower for you</li>
                <li>Provide faster turnaround times</li>
                <li>Maintain direct communication</li>
                <li>Focus entirely on client satisfaction</li>
              </ul>
              <div className="pt-2">
                <p className="font-medium">Get in touch with us:</p>
                <ul className="pt-2 space-y-1">
                  <li>
                    <a 
                      href="https://getnogo.vercel.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      getnogo.vercel.app
                    </a>
                  </li>
                  <li>
                    <a 
                      href="mailto:anshul.ganu@gmail.com" 
                      className="text-primary hover:underline"
                    >
                      anshul.ganu@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
} 