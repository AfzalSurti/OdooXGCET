import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export function SidePanel({ isOpen, onClose, title, children, width = '320px' }: SidePanelProps) {
  return (
    <>
      {/* Desktop: Fixed side panel */}
      <div
        className={cn(
          "hidden lg:block fixed right-0 top-16 bottom-0 z-40 bg-card border-l border-border transition-all duration-220 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ width: isOpen ? width : '0px' }}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-base">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto panel-slide-in">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile: Sheet overlay */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="p-4 overflow-auto">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface SidePanelTriggerProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function SidePanelTrigger({ onClick, label = 'Open Panel', className }: SidePanelTriggerProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn("gap-2", className)}
    >
      <ChevronRight className="h-4 w-4" />
      {label}
    </Button>
  );
}

