import { memo } from 'react';

/**
 * FloorPlanElement - Renders a single SVG element based on its type
 *
 * Supports: line, rect, circle, polygon, path
 * Handles selection highlighting and click events
 */
function FloorPlanElement({
  element,
  color,
  isSelected = false,
  onClick,
  onDoubleClick,
  onDragStart,
}) {
  const {
    id,
    svgType,
    svgData,
    strokeWidth,
    elementType,
  } = element;

  // Common props for all element types
  const commonProps = {
    stroke: color,
    strokeWidth: isSelected ? strokeWidth + 2 : strokeWidth,
    fill: elementType === 'zone' ? `${color}20` : 'none',
    cursor: 'pointer',
    onClick: (e) => {
      e.stopPropagation();
      onClick?.(element);
    },
    onDoubleClick: (e) => {
      e.stopPropagation();
      onDoubleClick?.(element);
    },
    style: {
      transition: 'stroke 0.2s, stroke-width 0.2s',
    },
  };

  // Selection highlight (rendered behind the element)
  const renderSelectionHighlight = () => {
    if (!isSelected) return null;

    const highlightProps = {
      stroke: '#3B82F6',
      strokeWidth: strokeWidth + 6,
      fill: 'none',
      opacity: 0.3,
      pointerEvents: 'none',
    };

    switch (svgType) {
      case 'line':
        return (
          <line
            x1={svgData.x1}
            y1={svgData.y1}
            x2={svgData.x2}
            y2={svgData.y2}
            {...highlightProps}
          />
        );
      case 'rect':
        return (
          <rect
            x={svgData.x}
            y={svgData.y}
            width={svgData.width}
            height={svgData.height}
            rx={svgData.rx || 0}
            {...highlightProps}
          />
        );
      case 'circle':
        return (
          <circle
            cx={svgData.cx}
            cy={svgData.cy}
            r={svgData.r}
            {...highlightProps}
          />
        );
      case 'polygon':
        return (
          <polygon
            points={svgData.points}
            {...highlightProps}
          />
        );
      case 'path':
        return (
          <path
            d={svgData.d}
            {...highlightProps}
          />
        );
      default:
        return null;
    }
  };

  // Render element based on type
  const renderElement = () => {
    switch (svgType) {
      case 'line':
        return (
          <g>
            {/* Invisible wider hit area for easier clicking and dragging */}
            <line
              x1={svgData.x1}
              y1={svgData.y1}
              x2={svgData.x2}
              y2={svgData.y2}
              stroke="transparent"
              strokeWidth={Math.max(strokeWidth + 10, 15)}
              cursor={isSelected ? 'move' : 'pointer'}
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(element);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClick?.(element);
              }}
              onMouseDown={(e) => {
                // Always allow drag start - it will select and start moving
                if (onDragStart) {
                  e.stopPropagation();
                  e.preventDefault();
                  onDragStart(e, element);
                }
              }}
            />
            {/* Visible line */}
            <line
              x1={svgData.x1}
              y1={svgData.y1}
              x2={svgData.x2}
              y2={svgData.y2}
              {...commonProps}
              pointerEvents="none"
            />
          </g>
        );

      case 'rect':
        return (
          <rect
            x={svgData.x}
            y={svgData.y}
            width={svgData.width}
            height={svgData.height}
            rx={svgData.rx || 0}
            {...commonProps}
            cursor={isSelected ? 'move' : 'pointer'}
            onMouseDown={(e) => {
              if (onDragStart) {
                e.stopPropagation();
                e.preventDefault();
                onDragStart(e, element);
              }
            }}
          />
        );

      case 'circle':
        return (
          <circle
            cx={svgData.cx}
            cy={svgData.cy}
            r={svgData.r}
            {...commonProps}
            cursor={isSelected ? 'move' : 'pointer'}
            onMouseDown={(e) => {
              if (onDragStart) {
                e.stopPropagation();
                e.preventDefault();
                onDragStart(e, element);
              }
            }}
          />
        );

      case 'polygon':
        return (
          <polygon
            points={svgData.points}
            {...commonProps}
          />
        );

      case 'path':
        return (
          <path
            d={svgData.d}
            {...commonProps}
          />
        );

      default:
        console.warn(`Unknown SVG type: ${svgType}`);
        return null;
    }
  };

  return (
    <g data-element-id={id}>
      {renderSelectionHighlight()}
      {renderElement()}
    </g>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(FloorPlanElement, (prevProps, nextProps) => {
  return (
    prevProps.element.id === nextProps.element.id &&
    prevProps.element.updatedAt === nextProps.element.updatedAt &&
    prevProps.color === nextProps.color &&
    prevProps.isSelected === nextProps.isSelected
  );
});
