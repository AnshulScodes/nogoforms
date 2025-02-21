
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormBlock } from '@/sdk';

interface FormPreviewProps {
  blocks: FormBlock[];
}

const FormPreview: React.FC<FormPreviewProps> = ({ blocks }) => {
  return (
    <Card className="p-6">
      <form className="space-y-6">
        {blocks.map((block) => (
          <div key={block.id} className="space-y-2">
            <Label>{block.label}</Label>
            
            {/* Text, Email, Number inputs */}
            {['text', 'email', 'number'].includes(block.type) && (
              <Input
                type={block.type}
                placeholder={block.placeholder}
                required={block.required}
              />
            )}

            {/* Select dropdown */}
            {block.type === 'select' && (
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={block.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {block.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Checkbox */}
            {block.type === 'checkbox' && (
              <div className="flex items-center space-x-2">
                <Checkbox id={block.id} />
                <label
                  htmlFor={block.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {block.placeholder || block.label}
                </label>
              </div>
            )}

            {/* Radio buttons */}
            {block.type === 'radio' && (
              <RadioGroup>
                {block.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${block.id}-${option}`} />
                    <Label htmlFor={`${block.id}-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        ))}

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Card>
  );
};

export default FormPreview;
