import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Save, 
  Download, 
  Upload, 
  Grid, 
  Undo, 
  Redo, 
  Copy, 
  Trash2,
  Eye,
  Settings,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * FormToolbar Component
 * 
 * Provides controls for managing the form builder, including:
 * - Form title and description
 * - Save, import, and export functionality
 * - Grid and layout settings
 * - Preview options
 * 
 * @param title - The form title
 * @param description - The form description
 * @param onTitleChange - Callback when title changes
 * @param onDescriptionChange - Callback when description changes
 * @param onSave - Callback when save button is clicked
 * @param onImport - Callback when import button is clicked
 * @param onExport - Callback when export button is clicked
 * @param onReset - Callback when reset button is clicked
 * @param gridVisible - Whether the grid is visible
 * @param onToggleGrid - Callback to toggle grid visibility
 * @param snapToGrid - Whether elements snap to grid
 * @param onToggleSnapToGrid - Callback to toggle snap to grid
 * @param gridSize - The size of the grid
 * @param onGridSizeChange - Callback when grid size changes
 * @param onPreview - Callback to preview the form
 */
interface FormToolbarProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
  onImport: () => void;
  onExport: () => void;
  onReset: () => void;
  gridVisible: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnapToGrid: () => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  onPreview: () => void;
}

export const FormToolbar: React.FC<FormToolbarProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onImport,
  onExport,
  onReset,
  gridVisible,
  onToggleGrid,
  snapToGrid,
  onToggleSnapToGrid,
  gridSize,
  onGridSizeChange,
  onPreview,
}) => {
  return (
    <div className="border-b p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Form Title"
            className="text-lg font-medium border-none shadow-none focus-visible:ring-0 px-0 h-auto"
          />
          <Input
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Form Description"
            className="text-sm text-muted-foreground border-none shadow-none focus-visible:ring-0 px-0 h-auto"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onPreview}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview Form</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save Form</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onExport}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Form</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onImport}>
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import Form</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Separator orientation="vertical" className="h-6" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Separator orientation="vertical" className="h-6" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate Element</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onReset}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Form</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="layout" className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="grid-visible"
                checked={gridVisible}
                onCheckedChange={onToggleGrid}
              />
              <Label htmlFor="grid-visible">Show Grid</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="snap-to-grid"
                checked={snapToGrid}
                onCheckedChange={onToggleSnapToGrid}
              />
              <Label htmlFor="snap-to-grid">Snap to Grid</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="grid-size" className="min-w-[80px]">Grid Size:</Label>
              <Slider
                id="grid-size"
                defaultValue={[gridSize]}
                min={8}
                max={64}
                step={8}
                className="w-[120px]"
                onValueChange={(value) => onGridSizeChange(value[0])}
              />
              <span className="text-xs text-muted-foreground min-w-[30px]">{gridSize}px</span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="pt-4">
          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Tablet className="h-4 w-4 mr-2" />
              Tablet
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="pt-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Form Settings
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <Grid className="h-4 w-4 mr-2" />
              Layout Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 