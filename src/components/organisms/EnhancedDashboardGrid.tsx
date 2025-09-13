import React, { useState, useRef, useEffect } from 'react';
import { 
  GripVertical, 
  MoreHorizontal, 
  Maximize2, 
  Minimize2, 
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/atoms/Icon';
import { Button } from '@/components/atoms/Button';

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ReactNode;
  gridArea: string;
  minHeight?: number;
  isVisible?: boolean;
  isExpanded?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

interface EnhancedDashboardGridProps {
  widgets: DashboardWidget[];
  onWidgetToggle?: (widgetId: string) => void;
  onWidgetExpand?: (widgetId: string) => void;
  onWidgetReorder?: (widgets: DashboardWidget[]) => void;
  className?: string;
  editMode?: boolean;
  onEditModeToggle?: () => void;
}

export const EnhancedDashboardGrid: React.FC<EnhancedDashboardGridProps> = ({
  widgets,
  onWidgetToggle = () => {},
  onWidgetExpand = () => {},
  onWidgetReorder = () => {},
  className,
  editMode = false,
  onEditModeToggle = () => {}
}) => {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const visibleWidgets = widgets.filter(widget => widget.isVisible !== false);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    if (!editMode) return;
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, widgetId: string) => {
    if (!editMode || !draggedWidget) return;
    e.preventDefault();
    setDragOverWidget(widgetId);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    if (!editMode || !draggedWidget) return;
    e.preventDefault();
    
    const newWidgets = [...widgets];
    const draggedIndex = newWidgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = newWidgets.findIndex(w => w.id === targetWidgetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const draggedWidget = newWidgets[draggedIndex];
      newWidgets.splice(draggedIndex, 1);
      newWidgets.splice(targetIndex, 0, draggedWidget);
      onWidgetReorder(newWidgets);
    }
    
    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const getGridTemplate = () => {
    // Dynamic grid template based on widget configurations
    const gridAreas = visibleWidgets.map(widget => {
      if (widget.isExpanded) {
        return `"${widget.id} ${widget.id}"`;
      }
      return widget.gridArea;
    }).join(' ');

    return {
      gridTemplateAreas: gridAreas,
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gridAutoRows: 'minmax(200px, auto)'
    };
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {editMode ? 'Customize your dashboard layout' : 'Your financial overview'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={onEditModeToggle}
            className="transition-all duration-200"
          >
            <Icon icon={Settings} size="sm" className="mr-2" />
            {editMode ? 'Done' : 'Customize'}
          </Button>
        </div>
      </div>

      {/* Edit Mode Notice */}
      {editMode && (
        <div className="card-enhanced p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <Icon icon={GripVertical} size="sm" />
            <span className="text-sm font-medium">
              Drag and drop widgets to reorder • Click eye icons to show/hide
            </span>
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      <div 
        ref={gridRef}
        className={cn(
          "grid gap-6 transition-all duration-300",
          editMode && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}
        style={!editMode ? getGridTemplate() : undefined}
      >
        {visibleWidgets.map((widget) => {
          const isDragged = draggedWidget === widget.id;
          const isDragOver = dragOverWidget === widget.id;
          
          return (
            <div
              key={widget.id}
              draggable={editMode && widget.isDraggable !== false}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, widget.id)}
              className={cn(
                "widget-container group transition-all duration-300",
                editMode && "cursor-move",
                isDragged && "opacity-50 scale-95",
                isDragOver && "ring-2 ring-blue-500",
                widget.isExpanded && "col-span-full",
                !editMode && `grid-area-${widget.id}`
              )}
              style={{
                gridArea: !editMode ? widget.id : undefined,
                minHeight: widget.minHeight || 200
              }}
            >
              <div className={cn(
                "card-enhanced h-full relative overflow-hidden",
                "transition-all duration-300",
                editMode && "ring-1 ring-gray-200 hover:ring-blue-300"
              )}>
                {/* Widget Header */}
                <div className={cn(
                  "flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-white",
                  editMode && "bg-gradient-to-r from-blue-50 to-white"
                )}>
                  <div className="flex items-center gap-3">
                    {editMode && widget.isDraggable !== false && (
                      <Icon 
                        icon={GripVertical} 
                        size="sm" 
                        className="text-gray-400 cursor-grab active:cursor-grabbing" 
                      />
                    )}
                    <h3 className="font-semibold text-lg">{widget.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {editMode && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onWidgetToggle(widget.id)}
                          className="opacity-60 hover:opacity-100"
                        >
                          <Icon icon={widget.isVisible !== false ? Eye : EyeOff} size="sm" />
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onWidgetExpand(widget.id)}
                      className={cn(
                        "opacity-60 hover:opacity-100 transition-opacity",
                        !editMode && "opacity-0 group-hover:opacity-60 group-hover:hover:opacity-100"
                      )}
                    >
                      <Icon 
                        icon={widget.isExpanded ? Minimize2 : Maximize2} 
                        size="sm" 
                      />
                    </Button>
                    
                    {!editMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Icon icon={MoreHorizontal} size="sm" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Widget Content */}
                <div className={cn(
                  "p-4 h-full overflow-auto",
                  editMode && "pointer-events-none"
                )}>
                  {widget.component}
                </div>

                {/* Edit Mode Overlay */}
                {editMode && (
                  <div className="absolute inset-0 bg-blue-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden Widgets Panel */}
      {editMode && widgets.some(w => w.isVisible === false) && (
        <div className="card-enhanced p-4">
          <h4 className="font-medium mb-3 text-gray-600">Hidden Widgets</h4>
          <div className="flex flex-wrap gap-2">
            {widgets
              .filter(w => w.isVisible === false)
              .map(widget => (
                <Button
                  key={widget.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onWidgetToggle(widget.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Icon icon={EyeOff} size="sm" className="mr-2" />
                  {widget.title}
                </Button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};
