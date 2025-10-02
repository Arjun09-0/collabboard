import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text } from 'react-konva';

const Whiteboard = ({
  tool,
  strokeColor,
  strokeWidth,
  strokes,
  setStrokes,
  onStrokeComplete,
  isDrawing,
  setIsDrawing
}) => {
  const [currentStroke, setCurrentStroke] = useState([]);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isShapeDrawing, setIsShapeDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [showTextInput, setShowTextInput] = useState(false);
  const stageRef = useRef();
  const containerRef = useRef();
  const textInputRef = useRef();

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStageSize({
          width: rect.width - 20,
          height: rect.height - 20
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Focus text input when it becomes visible
  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextInput]);

  const handleMouseDown = (e) => {
    if (tool === 'pan') return;
    
    const pos = e.target.getStage().getPointerPosition();
    
    if (tool === 'text') {
      setTextPosition(pos);
      setShowTextInput(true);
      setTextInput('');
      return;
    }

    if (tool === 'pen' || tool === 'eraser') {
      setIsDrawing(true);
      const newStroke = {
        id: Date.now(),
        tool,
        points: [pos.x, pos.y],
        strokeColor: tool === 'eraser' ? '#FFFFFF' : strokeColor,
        strokeWidth,
        timestamp: Date.now()
      };
      setCurrentStroke(newStroke);
    } else if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
      setIsShapeDrawing(true);
      setStartPos(pos);
      const newShape = {
        id: Date.now(),
        tool,
        startX: pos.x,
        startY: pos.y,
        endX: pos.x,
        endY: pos.y,
        strokeColor,
        strokeWidth,
        timestamp: Date.now()
      };
      setCurrentStroke(newShape);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing && !isShapeDrawing) return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    if (tool === 'pen' || tool === 'eraser') {
      setCurrentStroke(prev => ({
        ...prev,
        points: [...prev.points, point.x, point.y]
      }));
    } else if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
      setCurrentStroke(prev => ({
        ...prev,
        endX: point.x,
        endY: point.y
      }));
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing && !isShapeDrawing) return;
    
    if (tool === 'pen' || tool === 'eraser') {
      setIsDrawing(false);
      if (currentStroke.points && currentStroke.points.length > 2) {
        setStrokes(prev => [...prev, currentStroke]);
        onStrokeComplete(currentStroke);
      }
    } else if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
      setIsShapeDrawing(false);
      // Only add shape if it has some size
      const minSize = 5;
      const width = Math.abs(currentStroke.endX - currentStroke.startX);
      const height = Math.abs(currentStroke.endY - currentStroke.startY);
      
      if (width > minSize || height > minSize) {
        setStrokes(prev => [...prev, currentStroke]);
        onStrokeComplete(currentStroke);
      }
    }
    
    setCurrentStroke([]);
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      const newText = {
        id: Date.now(),
        tool: 'text',
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        strokeColor,
        fontSize: strokeWidth * 8, // Scale font size with stroke width
        timestamp: Date.now()
      };
      
      setStrokes(prev => [...prev, newText]);
      onStrokeComplete(newText);
    }
    
    setShowTextInput(false);
    setTextInput('');
  };

  const handleTextKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setShowTextInput(false);
      setTextInput('');
    }
  };

  const renderStrokes = () => {
    const allStrokes = [...strokes];
    
    // Add current stroke/shape being drawn
    if ((isDrawing || isShapeDrawing) && currentStroke && Object.keys(currentStroke).length > 0) {
      allStrokes.push(currentStroke);
    }

    return allStrokes.map((stroke) => {
      const key = stroke.id || Math.random();
      
      if (stroke.tool === 'pen') {
        return (
          <Line
            key={key}
            points={stroke.points}
            stroke={stroke.strokeColor}
            strokeWidth={stroke.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        );
      } else if (stroke.tool === 'eraser') {
        return (
          <Line
            key={key}
            points={stroke.points}
            stroke="#FFFFFF"
            strokeWidth={stroke.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation="destination-out"
          />
        );
      } else if (stroke.tool === 'line') {
        return (
          <Line
            key={key}
            points={[stroke.startX, stroke.startY, stroke.endX, stroke.endY]}
            stroke={stroke.strokeColor}
            strokeWidth={stroke.strokeWidth}
            lineCap="round"
          />
        );
      } else if (stroke.tool === 'rectangle') {
        const width = stroke.endX - stroke.startX;
        const height = stroke.endY - stroke.startY;
        return (
          <Rect
            key={key}
            x={Math.min(stroke.startX, stroke.endX)}
            y={Math.min(stroke.startY, stroke.endY)}
            width={Math.abs(width)}
            height={Math.abs(height)}
            stroke={stroke.strokeColor}
            strokeWidth={stroke.strokeWidth}
            fill="transparent"
          />
        );
      } else if (stroke.tool === 'circle') {
        const radiusX = Math.abs(stroke.endX - stroke.startX) / 2;
        const radiusY = Math.abs(stroke.endY - stroke.startY) / 2;
        const centerX = (stroke.startX + stroke.endX) / 2;
        const centerY = (stroke.startY + stroke.endY) / 2;
        
        return (
          <Circle
            key={key}
            x={centerX}
            y={centerY}
            radiusX={radiusX}
            radiusY={radiusY}
            stroke={stroke.strokeColor}
            strokeWidth={stroke.strokeWidth}
            fill="transparent"
          />
        );
      } else if (stroke.tool === 'text') {
        return (
          <Text
            key={key}
            x={stroke.x}
            y={stroke.y}
            text={stroke.text}
            fontSize={stroke.fontSize || 16}
            fill={stroke.strokeColor}
            fontFamily="Inter, Arial, sans-serif"
            fontStyle="normal"
          />
        );
      }
      
      return null;
    });
  };

  const getCursor = () => {
    switch (tool) {
      case 'pan': return 'grab';
      case 'text': return 'text';
      case 'eraser': return 'crosshair';
      default: return 'crosshair';
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%', 
        cursor: getCursor(),
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {renderStrokes()}
        </Layer>
      </Stage>
      
      {/* Text Input Overlay */}
      {showTextInput && (
        <input
          ref={textInputRef}
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleTextKeyPress}
          onBlur={handleTextSubmit}
          style={{
            position: 'absolute',
            left: textPosition.x + 10,
            top: textPosition.y + 10,
            border: '2px solid #00ff88',
            borderRadius: '4px',
            padding: '8px',
            fontSize: `${strokeWidth * 8}px`,
            color: strokeColor,
            background: 'white',
            outline: 'none',
            zIndex: 1000,
            minWidth: '100px',
            fontFamily: 'Inter, Arial, sans-serif'
          }}
          placeholder="Type text here..."
        />
      )}
    </div>
  );
};

export default Whiteboard;