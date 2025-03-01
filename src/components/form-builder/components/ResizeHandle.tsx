import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * ResizeHandle Component
 * 
 * A draggable handle that allows resizing elements in the form builder.
 * Shows dimensions while resizing and supports both pixel and percentage values.
 * 
 * @param onResize - Callback function that receives the new dimensions
 * @param minWidth - Minimum allowed width in pixels
 * @param maxWidth - Maximum allowed width in pixels
 * @param minHeight - Minimum allowed height in pixels
 * @param maxHeight - Maximum allowed height in pixels
 * @param initialWidth - Starting width in pixels
 * @param initialHeight - Starting height in pixels
 * @param showPercentage - Whether to display percentage values
 * @param className - Additional CSS classes
 */
interface ResizeHandleProps {
  onResize?: (dimensions: { width: number; height: number; percentage: number }) => void;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  initialWidth?: number;
  initialHeight?: number;
  showPercentage?: boolean;
  className?: string;
  parentRef?: React.RefObject<HTMLElement>;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResize,
  minWidth = 200,
  maxWidth,
  minHeight = 50,
  maxHeight,
  initialWidth,
  initialHeight,
  showPercentage = true,
  className = "",
  parentRef
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({ 
    width: initialWidth || 0, 
    height: initialHeight || 0,
    percentage: 0 
  });
  const handleRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!handleRef.current) return;
    
    setIsResizing(true);
    const startX = e.pageX;
    const startY = e.pageY;
    
    const element = handleRef.current.parentElement;
    if (!element) return;
    
    const startWidth = element.offsetWidth;
    const startHeight = element.offsetHeight;
    
    // Get parent width for percentage calculation
    const parentElement = parentRef?.current || element.parentElement;
    const parentWidth = parentElement?.offsetWidth || 1000;

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing || !element) return;

      const newWidth = Math.max(minWidth, Math.min(maxWidth || 10000, startWidth + e.pageX - startX));
      const newHeight = Math.max(minHeight, Math.min(maxHeight || 10000, startHeight + e.pageY - startY));
      const widthPercentage = (newWidth / parentWidth) * 100;

      setDimensions({ 
        width: newWidth, 
        height: newHeight,
        percentage: Math.round(widthPercentage)
      });

      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
      
      onResize?.({ width: newWidth, height: newHeight, percentage: widthPercentage });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [isResizing, minWidth, maxWidth, minHeight, maxHeight, onResize, parentRef]);

  return (
    <>
      <div
        ref={handleRef}
        className={cn(
          "absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group",
          className
        )}
        onMouseDown={startResizing}
      >
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary/10 rounded-tl group-hover:bg-primary/20 transition-colors">
          <svg 
            viewBox="0 0 24 24" 
            className="w-full h-full text-primary/50 group-hover:text-primary/70"
          >
            <path 
              fill="currentColor" 
              d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z"
            />
          </svg>
        </div>
      </div>
      
      {isResizing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-md text-sm font-mono z-50"
        >
          {dimensions.width}px × {dimensions.height}px
          {showPercentage && <span className="ml-2">({dimensions.percentage}%)</span>}
        </motion.div>
      )}
    </>
  );
}; 