import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';
import FloorPlanElement from './FloorPlanElement';

/**
 * FloorPlanViewer - Interactive SVG floor plan viewer with pan/zoom
 *
 * Features:
 * - Mouse wheel zoom
 * - Click and drag pan
 * - Touch support (pinch zoom, drag)
 * - Double-tap/click to reset view
 * - Background image support
 * - Element click handling
 */
export function FloorPlanViewer({
  floorPlan,
  elements,
  selectedElementId,
  onElementClick,
  onElementDoubleClick,
  onBackgroundClick,
  getElementColor,
  showLabels = false,
  className = '',
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // View transform state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartTranslate, setDragStartTranslate] = useState({ x: 0, y: 0 });

  // Touch state for pinch zoom
  const [lastTouchDistance, setLastTouchDistance] = useState(null);

  // Parse viewBox
  const viewBox = floorPlan?.svgViewbox || '0 0 800 600';
  const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);

  // Reset view
  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.25, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.25, 0.25));
  }, []);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.25), 5));
  }, []);

  // Handle mouse down (start drag)
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragStartTranslate({ ...translate });
  }, [translate]);

  // Handle mouse move (dragging)
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setTranslate({
      x: dragStartTranslate.x + dx,
      y: dragStartTranslate.y + dy,
    });
  }, [isDragging, dragStart, dragStartTranslate]);

  // Handle mouse up (end drag)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle double click (reset view)
  const handleDoubleClick = useCallback((e) => {
    // Only reset if clicking on background, not an element
    if (e.target === svgRef.current || e.target.tagName === 'rect' && e.target.dataset.background) {
      resetView();
    }
  }, [resetView]);

  // Touch handlers
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      // Single touch - start drag
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setDragStartTranslate({ ...translate });
    } else if (e.touches.length === 2) {
      // Two touches - prepare for pinch zoom
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  }, [translate]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      // Single touch drag
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      setTranslate({
        x: dragStartTranslate.x + dx,
        y: dragStartTranslate.y + dy,
      });
    } else if (e.touches.length === 2 && lastTouchDistance) {
      // Pinch zoom
      const newDistance = getTouchDistance(e.touches);
      if (newDistance) {
        const delta = newDistance / lastTouchDistance;
        setScale(prev => Math.min(Math.max(prev * delta, 0.25), 5));
        setLastTouchDistance(newDistance);
      }
    }
  }, [isDragging, dragStart, dragStartTranslate, lastTouchDistance]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouchDistance(null);
  }, []);

  // Add wheel listener with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Handle background click
  const handleSvgClick = useCallback((e) => {
    // Only trigger if clicking directly on SVG background
    if (e.target === svgRef.current || e.target.dataset?.background) {
      onBackgroundClick?.();
    }
  }, [onBackgroundClick]);

  if (!floorPlan) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500">No floor plan selected</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-white rounded-lg shadow-md border border-gray-200">
        <button
          onClick={zoomIn}
          className="p-2 hover:bg-gray-100 rounded-t-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 hover:bg-gray-100 transition-colors border-t border-gray-100"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={resetView}
          className="p-2 hover:bg-gray-100 rounded-b-lg transition-colors border-t border-gray-100"
          title="Reset View"
        >
          <Maximize className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Pan indicator */}
      {isDragging && (
        <div className="absolute top-3 left-3 z-10 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <Move className="w-3 h-3" />
          Panning
        </div>
      )}

      {/* Scale indicator */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/80 px-2 py-1 rounded text-xs text-gray-600">
        {Math.round(scale * 100)}%
      </div>

      {/* SVG Container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          onClick={handleSvgClick}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {/* Background */}
          <rect
            data-background="true"
            x={vbX}
            y={vbY}
            width={vbWidth}
            height={vbHeight}
            fill="#FAFAFA"
          />

          {/* Grid (subtle) */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect
            x={vbX}
            y={vbY}
            width={vbWidth}
            height={vbHeight}
            fill="url(#grid)"
            pointerEvents="none"
          />

          {/* Background Image */}
          {floorPlan.backgroundImageUrl && (
            <image
              href={floorPlan.backgroundImageUrl}
              x={vbX}
              y={vbY}
              width={vbWidth}
              height={vbHeight}
              opacity={0.4}
              preserveAspectRatio="xMidYMid slice"
              pointerEvents="none"
            />
          )}

          {/* Elements Layer - sorted by z-index */}
          <g>
            {elements
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((element) => (
                <FloorPlanElement
                  key={element.id}
                  element={element}
                  color={getElementColor?.(element) || element.defaultColor}
                  isSelected={element.id === selectedElementId}
                  onClick={onElementClick}
                  onDoubleClick={onElementDoubleClick}
                />
              ))}
          </g>

          {/* Labels Layer */}
          {showLabels && (
            <g>
              {elements
                .filter((e) => e.label)
                .map((element) => {
                  // Calculate label position based on element type
                  let x = 0, y = 0;
                  const { svgType, svgData } = element;

                  switch (svgType) {
                    case 'rect':
                      x = svgData.x + svgData.width / 2;
                      y = svgData.y + svgData.height / 2;
                      break;
                    case 'circle':
                      x = svgData.cx;
                      y = svgData.cy;
                      break;
                    case 'line':
                      x = (svgData.x1 + svgData.x2) / 2;
                      y = (svgData.y1 + svgData.y2) / 2 - 10;
                      break;
                    default:
                      return null;
                  }

                  return (
                    <g key={`label-${element.id}`} pointerEvents="none">
                      {/* Label background */}
                      <rect
                        x={x - element.label.length * 3}
                        y={y - 8}
                        width={element.label.length * 6 + 8}
                        height={14}
                        fill="white"
                        opacity={0.85}
                        rx={2}
                      />
                      {/* Label text */}
                      <text
                        x={x}
                        y={y + 3}
                        fontSize="10"
                        fill="#374151"
                        textAnchor="middle"
                        fontFamily="system-ui, sans-serif"
                      >
                        {element.label}
                      </text>
                    </g>
                  );
                })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

export default FloorPlanViewer;
