import { useState, useRef, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import FloorPlanElement from './FloorPlanElement';
import FloorPlanToolbar from './FloorPlanToolbar';
import { ELEMENT_TYPE_DEFAULTS } from '../../services/api';

// Set the worker source for PDF.js - use CDN for reliable loading
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * FloorPlanEditor - Interactive editor for creating/editing floor plan elements
 *
 * Features:
 * - Draw lines, rectangles, circles
 * - Select and move elements
 * - Grid and snap-to-grid
 * - Touch support
 * - Dimension display while drawing
 * - Import floor plans for tracing
 */
export function FloorPlanEditor({
  floorPlan,
  elements,
  selectedElementId,
  onElementClick,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  getElementColor,
  className = '',
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Tool state
  const [activeTool, setActiveTool] = useState('select');
  const [activeElementType, setActiveElementType] = useState('wall');
  const [activeTrade, setActiveTrade] = useState('framing');

  // Grid state
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const gridSize = 20;

  // Enhanced drawing state
  const [lineWeight, setLineWeight] = useState(2);
  const [drawingScale, setDrawingScale] = useState(10); // pixels per foot for dimensions
  const [showDimensions, setShowDimensions] = useState(true);
  const [importedImage, setImportedImage] = useState(null);

  // Undo history - stores element IDs that were added
  const [undoHistory, setUndoHistory] = useState([]);

  // Dimension editing state
  const [editingDimension, setEditingDimension] = useState(null); // { elementId, dimension: 'length' | 'width' | 'height' | 'radius' }
  const [dimensionInput, setDimensionInput] = useState('');
  const dimensionInputRef = useRef(null);

  // Drag resize state
  const [isDraggingHandle, setIsDraggingHandle] = useState(null); // { elementId, handle: 'start' | 'end' | 'nw' | 'ne' | 'se' | 'sw' | 'radius' | 'move' }
  const [dragStartPos, setDragStartPos] = useState(null);
  const [dragElementOriginal, setDragElementOriginal] = useState(null); // Original svgData when drag started

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [drawCurrent, setDrawCurrent] = useState(null);

  // View state (pan/zoom reserved for future)
  const [scale] = useState(1);
  const [translate] = useState({ x: 0, y: 0 });

  // Parse viewBox
  const viewBox = floorPlan?.svgViewbox || '0 0 800 600';
  const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);

  // Convert screen coordinates to SVG coordinates
  const screenToSvg = useCallback((clientX, clientY) => {
    if (!svgRef.current || !containerRef.current) return { x: 0, y: 0 };

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Get position relative to container
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Account for scale and translate
    const svgX = (relX - translate.x) / scale;
    const svgY = (relY - translate.y) / scale;

    // Convert to viewBox coordinates
    const viewBoxX = vbX + (svgX / rect.width) * vbWidth;
    const viewBoxY = vbY + (svgY / rect.height) * vbHeight;

    return { x: viewBoxX, y: viewBoxY };
  }, [scale, translate, vbX, vbY, vbWidth, vbHeight]);

  // Snap point to grid
  const snapPoint = useCallback((point) => {
    if (!snapToGrid) return point;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  }, [snapToGrid, gridSize]);

  // Get all corner/endpoint coordinates from other elements (for corner snapping)
  const getSnapTargets = useCallback((excludeElementId) => {
    const targets = [];
    elements.forEach(el => {
      if (el.id === excludeElementId) return;

      switch (el.svgType) {
        case 'line':
          targets.push({ x: el.svgData.x1, y: el.svgData.y1 });
          targets.push({ x: el.svgData.x2, y: el.svgData.y2 });
          break;
        case 'rect':
          // Four corners of rectangle
          targets.push({ x: el.svgData.x, y: el.svgData.y });
          targets.push({ x: el.svgData.x + el.svgData.width, y: el.svgData.y });
          targets.push({ x: el.svgData.x, y: el.svgData.y + el.svgData.height });
          targets.push({ x: el.svgData.x + el.svgData.width, y: el.svgData.y + el.svgData.height });
          break;
        case 'circle':
          // Center and cardinal points
          targets.push({ x: el.svgData.cx, y: el.svgData.cy });
          break;
      }
    });
    return targets;
  }, [elements]);

  // Snap point to nearby corners/endpoints first, then fall back to grid
  const snapPointWithCorners = useCallback((point, excludeElementId, snapDistance = 15) => {
    if (!snapToGrid) return point;

    const targets = getSnapTargets(excludeElementId);

    // Check if we're close to any corner/endpoint
    for (const target of targets) {
      const dist = Math.sqrt(
        Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2)
      );
      if (dist < snapDistance) {
        return { x: target.x, y: target.y, snappedToCorner: true };
      }
    }

    // Fall back to grid snapping
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
      snappedToCorner: false,
    };
  }, [snapToGrid, gridSize, getSnapTargets]);

  // Convert pixels to feet and inches for dimension display
  const formatDimension = useCallback((pixels) => {
    const feet = pixels / drawingScale;
    const wholeFeet = Math.floor(feet);
    const inches = Math.round((feet - wholeFeet) * 12);

    if (inches === 12) {
      return `${wholeFeet + 1}' 0"`;
    }
    if (wholeFeet === 0) {
      return `${inches}"`;
    }
    return `${wholeFeet}' ${inches}"`;
  }, [drawingScale]);

  // Parse dimension input (accepts "10'6", "10' 6\"", "10.5", "126" for inches)
  const parseDimensionInput = useCallback((input) => {
    if (!input) return null;

    const trimmed = input.trim();

    // Try feet and inches format: 10'6" or 10' 6" or 10'6
    const feetInchesMatch = trimmed.match(/^(\d+)['′]\s*(\d+)?["″]?$/);
    if (feetInchesMatch) {
      const feet = parseInt(feetInchesMatch[1], 10);
      const inches = parseInt(feetInchesMatch[2] || '0', 10);
      return (feet + inches / 12) * drawingScale;
    }

    // Try just feet with decimal: 10.5'
    const decimalFeetMatch = trimmed.match(/^(\d+\.?\d*)['′]?$/);
    if (decimalFeetMatch) {
      return parseFloat(decimalFeetMatch[1]) * drawingScale;
    }

    // Try just inches: 126" or 126in
    const inchesMatch = trimmed.match(/^(\d+\.?\d*)["″]|(\d+\.?\d*)\s*in$/i);
    if (inchesMatch) {
      const inches = parseFloat(inchesMatch[1] || inchesMatch[2]);
      return (inches / 12) * drawingScale;
    }

    // Plain number - assume feet
    const plainNumber = parseFloat(trimmed);
    if (!isNaN(plainNumber)) {
      return plainNumber * drawingScale;
    }

    return null;
  }, [drawingScale]);

  // Start editing a dimension
  const startDimensionEdit = useCallback((elementId, dimension, currentPixels) => {
    setEditingDimension({ elementId, dimension });
    setDimensionInput(formatDimension(currentPixels));
    // Focus input on next tick
    setTimeout(() => dimensionInputRef.current?.focus(), 0);
  }, [formatDimension]);

  // Apply dimension change to element
  const applyDimensionChange = useCallback(() => {
    if (!editingDimension) return;

    const newPixels = parseDimensionInput(dimensionInput);
    if (newPixels === null || newPixels <= 0) {
      setEditingDimension(null);
      setDimensionInput('');
      return;
    }

    const element = elements.find(e => e.id === editingDimension.elementId);
    if (!element) {
      setEditingDimension(null);
      setDimensionInput('');
      return;
    }

    let newSvgData = { ...element.svgData };

    switch (element.svgType) {
      case 'line': {
        // For lines, scale the length while maintaining angle
        const dx = element.svgData.x2 - element.svgData.x1;
        const dy = element.svgData.y2 - element.svgData.y1;
        const currentLength = Math.sqrt(dx * dx + dy * dy);
        const ratio = newPixels / currentLength;

        // Keep start point, adjust end point
        newSvgData = {
          x1: element.svgData.x1,
          y1: element.svgData.y1,
          x2: element.svgData.x1 + dx * ratio,
          y2: element.svgData.y1 + dy * ratio,
        };
        break;
      }
      case 'rect': {
        if (editingDimension.dimension === 'width') {
          newSvgData.width = newPixels;
        } else if (editingDimension.dimension === 'height') {
          newSvgData.height = newPixels;
        }
        break;
      }
      case 'circle': {
        newSvgData.r = newPixels;
        break;
      }
    }

    onUpdateElement(element.id, { svgData: newSvgData });
    setEditingDimension(null);
    setDimensionInput('');
  }, [editingDimension, dimensionInput, elements, parseDimensionInput, onUpdateElement]);

  // Cancel dimension editing
  const cancelDimensionEdit = useCallback(() => {
    setEditingDimension(null);
    setDimensionInput('');
  }, []);

  // Render editable dimension labels for selected element (SVG only - no foreignObject)
  const renderSelectedElementDimensions = useCallback(() => {
    if (!selectedElementId || !showDimensions) return null;

    const element = elements.find(e => e.id === selectedElementId);
    if (!element) return null;

    const dimensionLabelProps = {
      fill: '#1E40AF',
      fontSize: '12',
      fontWeight: 'bold',
      style: { userSelect: 'none', cursor: 'pointer' },
    };

    const dimensionBgProps = {
      fill: 'white',
      stroke: '#3B82F6',
      strokeWidth: 1,
      rx: 3,
      ry: 3,
      cursor: 'pointer',
    };

    switch (element.svgType) {
      case 'line': {
        const { x1, y1, x2, y2 } = element.svgData;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        if (length < 20) return null;

        return (
          <g
            transform={`translate(${midX}, ${midY - 15})`}
            onClick={(e) => {
              e.stopPropagation();
              startDimensionEdit(element.id, 'length', length);
            }}
          >
            <rect x={-35} y={-10} width={70} height={20} {...dimensionBgProps} />
            <text textAnchor="middle" dominantBaseline="middle" {...dimensionLabelProps}>
              {formatDimension(length)}
            </text>
          </g>
        );
      }

      case 'rect': {
        const { x, y, width, height } = element.svgData;

        return (
          <g>
            {/* Width label (top) */}
            {width > 30 && (
              <g
                transform={`translate(${x + width / 2}, ${y - 15})`}
                onClick={(e) => {
                  e.stopPropagation();
                  startDimensionEdit(element.id, 'width', width);
                }}
              >
                <rect x={-35} y={-10} width={70} height={20} {...dimensionBgProps} />
                <text textAnchor="middle" dominantBaseline="middle" {...dimensionLabelProps}>
                  {formatDimension(width)}
                </text>
              </g>
            )}
            {/* Height label (right) */}
            {height > 30 && (
              <g
                transform={`translate(${x + width + 15}, ${y + height / 2})`}
                onClick={(e) => {
                  e.stopPropagation();
                  startDimensionEdit(element.id, 'height', height);
                }}
              >
                <rect x={-35} y={-10} width={70} height={20} {...dimensionBgProps} />
                <text textAnchor="middle" dominantBaseline="middle" {...dimensionLabelProps}>
                  {formatDimension(height)}
                </text>
              </g>
            )}
          </g>
        );
      }

      case 'circle': {
        const { cx, cy, r } = element.svgData;

        if (r < 20) return null;

        return (
          <g>
            {/* Radius line */}
            <line
              x1={cx}
              y1={cy}
              x2={cx + r}
              y2={cy}
              stroke="#3B82F6"
              strokeWidth={1}
              strokeDasharray="4,2"
              pointerEvents="none"
            />
            {/* Radius label */}
            <g
              transform={`translate(${cx + r / 2}, ${cy - 15})`}
              onClick={(e) => {
                e.stopPropagation();
                startDimensionEdit(element.id, 'radius', r);
              }}
            >
              <rect x={-40} y={-10} width={80} height={20} {...dimensionBgProps} />
              <text textAnchor="middle" dominantBaseline="middle" {...dimensionLabelProps}>
                r = {formatDimension(r)}
              </text>
            </g>
          </g>
        );
      }

      default:
        return null;
    }
  }, [selectedElementId, elements, showDimensions, formatDimension, startDimensionEdit]);

  // Handle resize handle drag start
  const handleResizeHandleMouseDown = useCallback((e, elementId, handle) => {
    e.stopPropagation();
    e.preventDefault();
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setDragElementOriginal({ ...element.svgData }); // Store original for move calculations
    }
    setIsDraggingHandle({ elementId, handle });
    setDragStartPos(screenToSvg(e.clientX, e.clientY));
  }, [screenToSvg, elements]);

  // Handle resize drag move
  const handleResizeDragMove = useCallback((e) => {
    if (!isDraggingHandle || !dragStartPos || !dragElementOriginal) return;

    const rawPos = screenToSvg(e.clientX, e.clientY);
    const element = elements.find(el => el.id === isDraggingHandle.elementId);
    if (!element) return;

    let newSvgData = { ...element.svgData };

    switch (element.svgType) {
      case 'line': {
        if (isDraggingHandle.handle === 'move') {
          // Move entire line while preserving length and angle
          // Calculate delta from drag start
          const deltaX = rawPos.x - dragStartPos.x;
          const deltaY = rawPos.y - dragStartPos.y;

          // Preserve original delta (length and angle)
          const origDx = dragElementOriginal.x2 - dragElementOriginal.x1;
          const origDy = dragElementOriginal.y2 - dragElementOriginal.y1;

          // Calculate potential new positions for both endpoints
          const potentialX1 = dragElementOriginal.x1 + deltaX;
          const potentialY1 = dragElementOriginal.y1 + deltaY;
          const potentialX2 = potentialX1 + origDx;
          const potentialY2 = potentialY1 + origDy;

          // Try to snap START point to a corner first
          const snappedStart = snapPointWithCorners(
            { x: potentialX1, y: potentialY1 },
            element.id,
            20 // snap distance for corners
          );

          // Try to snap END point to a corner
          const snappedEnd = snapPointWithCorners(
            { x: potentialX2, y: potentialY2 },
            element.id,
            20
          );

          // Prefer corner snap - if end snapped to corner, use that as anchor
          if (snappedEnd.snappedToCorner) {
            newSvgData = {
              x1: snappedEnd.x - origDx,
              y1: snappedEnd.y - origDy,
              x2: snappedEnd.x,
              y2: snappedEnd.y,
            };
          } else if (snappedStart.snappedToCorner) {
            // Start point snapped to corner
            newSvgData = {
              x1: snappedStart.x,
              y1: snappedStart.y,
              x2: snappedStart.x + origDx,
              y2: snappedStart.y + origDy,
            };
          } else {
            // No corner snap, fall back to grid snap on start point
            newSvgData = {
              x1: snappedStart.x,
              y1: snappedStart.y,
              x2: snappedStart.x + origDx,
              y2: snappedStart.y + origDy,
            };
          }
        } else if (isDraggingHandle.handle === 'start') {
          // Resizing from start - use corner snap
          const snappedPos = snapPointWithCorners(rawPos, element.id, 20);
          newSvgData.x1 = snappedPos.x;
          newSvgData.y1 = snappedPos.y;
        } else if (isDraggingHandle.handle === 'end') {
          // Resizing from end - use corner snap
          const snappedPos = snapPointWithCorners(rawPos, element.id, 20);
          newSvgData.x2 = snappedPos.x;
          newSvgData.y2 = snappedPos.y;
        }
        break;
      }
      case 'rect': {
        const currentPos = snapPoint(rawPos);
        if (isDraggingHandle.handle === 'move') {
          // Move entire rect
          const deltaX = rawPos.x - dragStartPos.x;
          const deltaY = rawPos.y - dragStartPos.y;
          const newX = snapPoint({ x: dragElementOriginal.x + deltaX, y: 0 }).x;
          const newY = snapPoint({ x: 0, y: dragElementOriginal.y + deltaY }).y;
          newSvgData.x = newX;
          newSvgData.y = newY;
        } else {
          const { x, y, width, height } = element.svgData;
          switch (isDraggingHandle.handle) {
            case 'nw':
              newSvgData.x = currentPos.x;
              newSvgData.y = currentPos.y;
              newSvgData.width = Math.max(10, x + width - currentPos.x);
              newSvgData.height = Math.max(10, y + height - currentPos.y);
              break;
            case 'ne':
              newSvgData.y = currentPos.y;
              newSvgData.width = Math.max(10, currentPos.x - x);
              newSvgData.height = Math.max(10, y + height - currentPos.y);
              break;
            case 'se':
              newSvgData.width = Math.max(10, currentPos.x - x);
              newSvgData.height = Math.max(10, currentPos.y - y);
              break;
            case 'sw':
              newSvgData.x = currentPos.x;
              newSvgData.width = Math.max(10, x + width - currentPos.x);
              newSvgData.height = Math.max(10, currentPos.y - y);
              break;
          }
        }
        break;
      }
      case 'circle': {
        if (isDraggingHandle.handle === 'move') {
          // Move entire circle
          const deltaX = rawPos.x - dragStartPos.x;
          const deltaY = rawPos.y - dragStartPos.y;
          const newCx = snapPoint({ x: dragElementOriginal.cx + deltaX, y: 0 }).x;
          const newCy = snapPoint({ x: 0, y: dragElementOriginal.cy + deltaY }).y;
          newSvgData.cx = newCx;
          newSvgData.cy = newCy;
        } else {
          const currentPos = snapPoint(rawPos);
          const dx = currentPos.x - element.svgData.cx;
          const dy = currentPos.y - element.svgData.cy;
          newSvgData.r = Math.max(10, Math.sqrt(dx * dx + dy * dy));
        }
        break;
      }
    }

    onUpdateElement(element.id, { svgData: newSvgData });
  }, [isDraggingHandle, dragStartPos, dragElementOriginal, elements, screenToSvg, snapPoint, snapPointWithCorners, onUpdateElement]);

  // Handle resize drag end
  const handleResizeDragEnd = useCallback(() => {
    setIsDraggingHandle(null);
    setDragStartPos(null);
    setDragElementOriginal(null);
  }, []);

  // Render resize handles for selected element
  const renderResizeHandles = useCallback(() => {
    if (!selectedElementId || activeTool !== 'select') return null;

    const element = elements.find(e => e.id === selectedElementId);
    if (!element) return null;

    const handleSize = 8;
    const handleProps = {
      width: handleSize,
      height: handleSize,
      fill: 'white',
      stroke: '#3B82F6',
      strokeWidth: 2,
      cursor: 'pointer',
      style: { cursor: 'grab' },
    };

    const circleHandleProps = {
      r: handleSize / 2,
      fill: 'white',
      stroke: '#3B82F6',
      strokeWidth: 2,
      cursor: 'pointer',
      style: { cursor: 'grab' },
    };

    // Move handle props - green to distinguish from resize handles
    const moveHandleProps = {
      r: handleSize / 2 + 2,
      fill: '#10B981',
      stroke: 'white',
      strokeWidth: 2,
      cursor: 'move',
      style: { cursor: 'move' },
    };

    switch (element.svgType) {
      case 'line': {
        const { x1, y1, x2, y2 } = element.svgData;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        return (
          <g>
            {/* Start point handle (resize) */}
            <rect
              x={x1 - handleSize / 2}
              y={y1 - handleSize / 2}
              {...handleProps}
              style={{ cursor: 'crosshair' }}
              onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'start')}
            />
            {/* Center move handle */}
            <circle
              cx={midX}
              cy={midY}
              {...moveHandleProps}
              onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'move')}
            />
            {/* End point handle (resize) */}
            <rect
              x={x2 - handleSize / 2}
              y={y2 - handleSize / 2}
              {...handleProps}
              style={{ cursor: 'crosshair' }}
              onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'end')}
            />
          </g>
        );
      }

      case 'rect': {
        const { x, y, width, height } = element.svgData;
        return (
          <g>
            {/* Center move handle */}
            <circle
              cx={x + width / 2}
              cy={y + height / 2}
              {...moveHandleProps}
              onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'move')}
            />
            {/* Corner handles */}
            <rect
              x={x - handleSize / 2}
              y={y - handleSize / 2}
              {...handleProps}
              style={{ cursor: 'nw-resize' }}
              onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'nw')}
            />
            <rect
              x={x + width - handleSize / 2}
              y={y - handleSize / 2}
              {...handleProps}
              style={{ cursor: 'ne-resize' }}
              onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'ne')}
            />
            <rect
              x={x + width - handleSize / 2}
              y={y + height - handleSize / 2}
              {...handleProps}
              style={{ cursor: 'se-resize' }}
              onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'se')}
            />
            <rect
              x={x - handleSize / 2}
              y={y + height - handleSize / 2}
              {...handleProps}
              style={{ cursor: 'sw-resize' }}
              onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'sw')}
            />
          </g>
        );
      }

      case 'circle': {
        const { cx, cy, r } = element.svgData;
        return (
          <g>
            {/* Center move handle */}
            <circle
              cx={cx}
              cy={cy}
              {...moveHandleProps}
              onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'move')}
            />
            {/* Radius handle (right side) */}
            <circle
              cx={cx + r}
              cy={cy}
              {...circleHandleProps}
              style={{ cursor: 'ew-resize' }}
              onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'radius')}
            />
          </g>
        );
      }

      default:
        return null;
    }
  }, [selectedElementId, activeTool, elements, handleResizeHandleMouseDown]);

  // Handle image/PDF import for tracing
  const handleImportImage = useCallback(async (file) => {
    if (file.type === 'application/pdf') {
      try {
        // Read PDF file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Load PDF with pdf.js
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        // Use higher scale for better quality
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;
        setImportedImage(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error loading PDF:', err);
        alert('Could not load PDF. Please try converting it to an image first.');
      }
    } else {
      // Regular image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle mouse/touch down
  const handlePointerDown = useCallback((e) => {
    if (activeTool === 'select') return;

    e.preventDefault();
    const point = snapPoint(screenToSvg(e.clientX, e.clientY));

    setIsDrawing(true);
    setDrawStart(point);
    setDrawCurrent(point);
  }, [activeTool, screenToSvg, snapPoint]);

  // Handle mouse/touch move
  const handlePointerMove = useCallback((e) => {
    if (!isDrawing) return;

    const point = snapPoint(screenToSvg(e.clientX, e.clientY));
    setDrawCurrent(point);
  }, [isDrawing, screenToSvg, snapPoint]);

  // Handle mouse/touch up
  const handlePointerUp = useCallback(() => {
    if (!isDrawing || !drawStart || !drawCurrent) {
      setIsDrawing(false);
      return;
    }

    // Calculate minimum size to avoid accidental tiny elements
    const dx = Math.abs(drawCurrent.x - drawStart.x);
    const dy = Math.abs(drawCurrent.y - drawStart.y);

    if (dx < 5 && dy < 5) {
      setIsDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
      return;
    }

    // Create element based on tool
    let svgType;
    let svgData;

    switch (activeTool) {
      case 'line':
        svgType = 'line';
        svgData = {
          x1: drawStart.x,
          y1: drawStart.y,
          x2: drawCurrent.x,
          y2: drawCurrent.y,
        };
        break;

      case 'rect':
        svgType = 'rect';
        svgData = {
          x: Math.min(drawStart.x, drawCurrent.x),
          y: Math.min(drawStart.y, drawCurrent.y),
          width: Math.abs(drawCurrent.x - drawStart.x),
          height: Math.abs(drawCurrent.y - drawStart.y),
        };
        break;

      case 'circle': {
        svgType = 'circle';
        const radius = Math.sqrt(dx * dx + dy * dy);
        svgData = {
          cx: drawStart.x,
          cy: drawStart.y,
          r: radius,
        };
        break;
      }

      default:
        setIsDrawing(false);
        setDrawStart(null);
        setDrawCurrent(null);
        return;
    }

    const defaults = ELEMENT_TYPE_DEFAULTS[activeElementType] || ELEMENT_TYPE_DEFAULTS.custom;

    // Add element and track for undo
    const addAndTrack = async () => {
      const result = await onAddElement({
        elementType: activeElementType,
        tradeCategory: activeTrade,
        svgType,
        svgData,
        strokeWidth: lineWeight,
        defaultColor: defaults.color,
        zIndex: elements.length,
      });
      // Track the new element ID for undo
      if (result?.success && result?.data?.id) {
        setUndoHistory(prev => [...prev, result.data.id]);
      }
    };
    addAndTrack();

    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  }, [isDrawing, drawStart, drawCurrent, activeTool, activeElementType, activeTrade, lineWeight, elements.length, onAddElement]);

  // Render drawing preview with dimensions
  const renderDrawingPreview = () => {
    if (!isDrawing || !drawStart || !drawCurrent) return null;

    const previewProps = {
      stroke: '#3B82F6',
      strokeWidth: lineWeight,
      strokeDasharray: '4,4',
      fill: activeTool === 'rect' ? 'rgba(59, 130, 246, 0.1)' : 'none',
      pointerEvents: 'none',
    };

    const dimensionLabelProps = {
      fill: '#1E40AF',
      fontSize: '12',
      fontWeight: 'bold',
      pointerEvents: 'none',
      style: { userSelect: 'none' },
    };

    const dimensionBgProps = {
      fill: 'white',
      rx: 3,
      ry: 3,
      pointerEvents: 'none',
    };

    const dx = drawCurrent.x - drawStart.x;
    const dy = drawCurrent.y - drawStart.y;
    const width = Math.abs(dx);
    const height = Math.abs(dy);

    switch (activeTool) {
      case 'line': {
        const length = Math.sqrt(dx * dx + dy * dy);
        const midX = (drawStart.x + drawCurrent.x) / 2;
        const midY = (drawStart.y + drawCurrent.y) / 2;

        return (
          <g>
            <line
              x1={drawStart.x}
              y1={drawStart.y}
              x2={drawCurrent.x}
              y2={drawCurrent.y}
              {...previewProps}
            />
            {showDimensions && length > 20 && (
              <g transform={`translate(${midX}, ${midY - 8})`}>
                <rect
                  x={-30}
                  y={-10}
                  width={60}
                  height={16}
                  {...dimensionBgProps}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  {...dimensionLabelProps}
                >
                  {formatDimension(length)}
                </text>
              </g>
            )}
          </g>
        );
      }

      case 'rect': {
        const rectX = Math.min(drawStart.x, drawCurrent.x);
        const rectY = Math.min(drawStart.y, drawCurrent.y);

        return (
          <g>
            <rect
              x={rectX}
              y={rectY}
              width={width}
              height={height}
              {...previewProps}
            />
            {showDimensions && (width > 30 || height > 30) && (
              <>
                {/* Width label (top) */}
                {width > 30 && (
                  <g transform={`translate(${rectX + width / 2}, ${rectY - 12})`}>
                    <rect
                      x={-30}
                      y={-8}
                      width={60}
                      height={16}
                      {...dimensionBgProps}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      {...dimensionLabelProps}
                    >
                      {formatDimension(width)}
                    </text>
                  </g>
                )}
                {/* Height label (right) */}
                {height > 30 && (
                  <g transform={`translate(${rectX + width + 12}, ${rectY + height / 2})`}>
                    <rect
                      x={-30}
                      y={-8}
                      width={60}
                      height={16}
                      {...dimensionBgProps}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      {...dimensionLabelProps}
                    >
                      {formatDimension(height)}
                    </text>
                  </g>
                )}
              </>
            )}
          </g>
        );
      }

      case 'circle': {
        const radius = Math.sqrt(dx * dx + dy * dy);

        return (
          <g>
            <circle
              cx={drawStart.x}
              cy={drawStart.y}
              r={radius}
              {...previewProps}
            />
            {/* Radius line */}
            <line
              x1={drawStart.x}
              y1={drawStart.y}
              x2={drawCurrent.x}
              y2={drawCurrent.y}
              stroke="#3B82F6"
              strokeWidth={1}
              strokeDasharray="2,2"
              pointerEvents="none"
            />
            {showDimensions && radius > 20 && (
              <g transform={`translate(${drawStart.x + radius / 2}, ${drawStart.y - 12})`}>
                <rect
                  x={-35}
                  y={-8}
                  width={70}
                  height={16}
                  {...dimensionBgProps}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  {...dimensionLabelProps}
                >
                  r = {formatDimension(radius)}
                </text>
              </g>
            )}
          </g>
        );
      }

      default:
        return null;
    }
  };

  // Handle element click
  const handleElementClick = useCallback((element) => {
    if (activeTool === 'select') {
      onElementClick?.(element);
    }
  }, [activeTool, onElementClick]);

  // Handle drag start from element body (not handles)
  const handleElementDragStart = useCallback((e, element) => {
    if (activeTool !== 'select') return;

    // Select the element first (so it shows as selected while dragging)
    onElementClick?.(element);

    // Start moving the element
    setDragElementOriginal({ ...element.svgData });
    setIsDraggingHandle({ elementId: element.id, handle: 'move' });
    setDragStartPos(screenToSvg(e.clientX, e.clientY));
  }, [activeTool, screenToSvg, onElementClick]);

  // Handle background click
  const handleBackgroundClick = useCallback((e) => {
    if (e.target === svgRef.current || e.target.dataset?.background) {
      if (activeTool === 'select') {
        onElementClick?.(null);
      }
    }
  }, [activeTool, onElementClick]);

  // Delete selected element
  const handleDeleteSelected = useCallback(() => {
    if (selectedElementId) {
      onDeleteElement(selectedElementId);
    }
  }, [selectedElementId, onDeleteElement]);

  // Duplicate selected element
  const handleDuplicateSelected = useCallback(() => {
    const element = elements.find(e => e.id === selectedElementId);
    if (!element) return;

    // Offset the duplicate slightly
    let newSvgData = { ...element.svgData };
    switch (element.svgType) {
      case 'line':
        newSvgData = {
          x1: element.svgData.x1 + 20,
          y1: element.svgData.y1 + 20,
          x2: element.svgData.x2 + 20,
          y2: element.svgData.y2 + 20,
        };
        break;
      case 'rect':
        newSvgData = {
          ...element.svgData,
          x: element.svgData.x + 20,
          y: element.svgData.y + 20,
        };
        break;
      case 'circle':
        newSvgData = {
          ...element.svgData,
          cx: element.svgData.cx + 20,
          cy: element.svgData.cy + 20,
        };
        break;
    }

    onAddElement({
      elementType: element.elementType,
      tradeCategory: element.tradeCategory,
      label: element.label ? `${element.label} (copy)` : null,
      svgType: element.svgType,
      svgData: newSvgData,
      strokeWidth: element.strokeWidth,
      defaultColor: element.defaultColor,
      zIndex: elements.length,
      notes: element.notes,
      specs: element.specs,
    });
  }, [selectedElementId, elements, onAddElement]);

  // Undo last added element
  const handleUndo = useCallback(() => {
    if (undoHistory.length === 0) return;

    const lastElementId = undoHistory[undoHistory.length - 1];
    onDeleteElement(lastElementId);
    setUndoHistory(prev => prev.slice(0, -1));
  }, [undoHistory, onDeleteElement]);

  // Clear imported image
  const handleClearImportedImage = useCallback(() => {
    setImportedImage(null);
  }, []);

  // Focus dimension input when editing starts
  useEffect(() => {
    if (editingDimension && dimensionInputRef.current) {
      dimensionInputRef.current.focus();
      dimensionInputRef.current.select();
    }
  }, [editingDimension]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If editing dimension, let the input handle its own events
      if (editingDimension) {
        if (e.key === 'Escape') {
          e.preventDefault();
          cancelDimensionEdit();
        }
        return;
      }

      // Undo with Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          handleUndo();
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
      if (e.key === 'Escape') {
        setActiveTool('select');
        onElementClick?.(null);
      }
      if (e.key === 'v' || e.key === 'V') {
        if (document.activeElement.tagName !== 'INPUT') {
          setActiveTool('select');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, handleDeleteSelected, handleUndo, onElementClick, editingDimension, cancelDimensionEdit]);

  const selectedElement = elements.find(e => e.id === selectedElementId);

  if (!floorPlan) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500">No floor plan selected</p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Toolbar */}
      <FloorPlanToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        activeElementType={activeElementType}
        onElementTypeChange={setActiveElementType}
        activeTrade={activeTrade}
        onTradeChange={setActiveTrade}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        selectedElement={selectedElement}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        // Enhanced drawing features
        lineWeight={lineWeight}
        onLineWeightChange={setLineWeight}
        scale={drawingScale}
        onScaleChange={setDrawingScale}
        showDimensions={showDimensions}
        onToggleDimensions={() => setShowDimensions(!showDimensions)}
        // Undo & Clear
        canUndo={undoHistory.length > 0}
        onUndo={handleUndo}
        hasImportedImage={!!importedImage}
        onClearImportedImage={handleClearImportedImage}
        onImportImage={handleImportImage}
      />

      {/* Canvas - Full height for maximum workspace */}
      <div
        ref={containerRef}
        className={`flex-1 min-h-[calc(100vh-180px)] bg-gray-100 ${
          activeTool !== 'select' ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onMouseDown={handlePointerDown}
        onMouseMove={(e) => {
          handlePointerMove(e);
          handleResizeDragMove(e);
        }}
        onMouseUp={() => {
          handlePointerUp();
          handleResizeDragEnd();
        }}
        onMouseLeave={() => {
          handlePointerUp();
          handleResizeDragEnd();
        }}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            handlePointerDown({
              clientX: e.touches[0].clientX,
              clientY: e.touches[0].clientY,
              preventDefault: () => e.preventDefault(),
            });
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) {
            e.preventDefault();
            handlePointerMove({
              clientX: e.touches[0].clientX,
              clientY: e.touches[0].clientY,
            });
          }
        }}
        onTouchEnd={handlePointerUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          onClick={handleBackgroundClick}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
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

          {/* Grid */}
          {showGrid && (
            <>
              <defs>
                <pattern
                  id="editor-grid"
                  width={gridSize}
                  height={gridSize}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                    fill="none"
                    stroke="#D1D5DB"
                    strokeWidth="0.5"
                  />
                </pattern>
                <pattern
                  id="editor-grid-large"
                  width={gridSize * 5}
                  height={gridSize * 5}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`}
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect
                x={vbX}
                y={vbY}
                width={vbWidth}
                height={vbHeight}
                fill="url(#editor-grid)"
                pointerEvents="none"
              />
              <rect
                x={vbX}
                y={vbY}
                width={vbWidth}
                height={vbHeight}
                fill="url(#editor-grid-large)"
                pointerEvents="none"
              />
            </>
          )}

          {/* Background Image from floor plan */}
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

          {/* Imported Image for Tracing */}
          {importedImage && (
            <image
              href={importedImage}
              x={vbX}
              y={vbY}
              width={vbWidth}
              height={vbHeight}
              opacity={0.5}
              preserveAspectRatio="xMidYMid meet"
              pointerEvents="none"
            />
          )}

          {/* Elements Layer */}
          <g>
            {elements
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((element) => (
                <FloorPlanElement
                  key={element.id}
                  element={element}
                  color={getElementColor?.(element) || element.defaultColor}
                  isSelected={element.id === selectedElementId}
                  onClick={handleElementClick}
                  onDragStart={handleElementDragStart}
                />
              ))}
          </g>

          {/* Drawing Preview */}
          {renderDrawingPreview()}

          {/* Selected Element Dimensions (editable) */}
          {renderSelectedElementDimensions()}

          {/* Resize Handles for Selected Element */}
          {renderResizeHandles()}
        </svg>
      </div>

      {/* Dimension Edit Input Overlay */}
      {editingDimension && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-lg shadow-xl border border-blue-500 p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Enter new {editingDimension.dimension === 'radius' ? 'radius' : editingDimension.dimension}:
            </div>
            <div className="flex gap-2">
              <input
                ref={dimensionInputRef}
                type="text"
                value={dimensionInput}
                onChange={(e) => setDimensionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyDimensionChange();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelDimensionEdit();
                  }
                }}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10'6&quot;"
                autoFocus
              />
              <button
                onClick={applyDimensionChange}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={cancelDimensionEdit}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Formats: 10'6", 10.5', 126", or just a number (feet)
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div>
          {activeTool === 'select' ? (
            selectedElement ? (
              <span>
                Selected: {selectedElement.label || selectedElement.elementType}
                <span className="ml-2 text-emerald-600">• Drag green handle to move</span>
                {showDimensions && (
                  <span className="ml-2 text-blue-600">• Click dimension to edit size</span>
                )}
              </span>
            ) : (
              <span>Click an element to select</span>
            )
          ) : (
            <span>Click and drag to draw a {activeTool}</span>
          )}
        </div>
        <div>
          {elements.length} elements
        </div>
      </div>
    </div>
  );
}

export default FloorPlanEditor;
