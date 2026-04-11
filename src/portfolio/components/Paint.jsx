import React, { useRef, useState, useEffect } from 'react';

const COLORS = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'
];

// Placeholder array for the curated stamps you will upload.
// Just drop your .png artifacts into the public folder and update these paths!
const STAMPS = [
  '/stamps/stamp1.png',
  '/stamps/stamp2.png',
  '/stamps/stamp3.png',
  '/stamps/stamp4.png',
];

const Paint = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawing = useRef(false);

  const [activeColor, setActiveColor] = useState('#000000');
  const [activeTool, setActiveTool] = useState('pencil'); // 'pencil' | 'eraser' | 'stamp'
  const [activeStamp, setActiveStamp] = useState(0);
  const [brushSize, setBrushSize] = useState(2);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Ghost Tracker State
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up standard logic context
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill background solid white to prevent transparent exports
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = ctx;
  }, []);

  const getCoordinates = (e) => {
    // If it's a touch event, calculate relative offset manually
    if (e.touches && e.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    // Mouse fallback explicitly relies on offsets
    return {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    };
  };

  const applyStamp = (x, y) => {
    const stampSrc = STAMPS[activeStamp];
    const img = new window.Image();
    // Cache bust so updated stamp files aren't stuck on old checkerboard versions
    img.src = stampSrc + '?t=' + Date.now();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      if (!contextRef.current) return;

      const maxStampSize = 120;
      let drawWidth = img.width;
      let drawHeight = img.height;
      if (drawWidth > maxStampSize || drawHeight > maxStampSize) {
          const ratio = Math.min(maxStampSize / drawWidth, maxStampSize / drawHeight);
          drawWidth *= ratio;
          drawHeight *= ratio;
      }

      // Chroma-Key Processing via Offscreen Canvas
      const offCanvas = document.createElement('canvas');
      offCanvas.width = drawWidth;
      offCanvas.height = drawHeight;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(img, 0, 0, drawWidth, drawHeight);

      const imgData = offCtx.getImageData(0, 0, drawWidth, drawHeight);
      const data = imgData.data;

      // Detect background color dynamically from the top-left pixel
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];
      const tolerance = 70; // High tolerance for compression artifacts

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Strip out pixels that match the localized background
        if (Math.abs(r - bgR) < tolerance && 
            Math.abs(g - bgG) < tolerance && 
            Math.abs(b - bgB) < tolerance) {
          data[i + 3] = 0; // Alpha -> 0
        }
      }
      
      offCtx.putImageData(imgData, 0, 0);

      // Render the cutout stamp fully tracking the pointer
      contextRef.current.drawImage(offCanvas, x - drawWidth / 2, y - drawHeight / 2);
    };
    
    img.onerror = () => {
      console.error("Failed to load stamp:", stampSrc);
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    
    if (activeTool === 'stamp') {
      applyStamp(x, y);
      return; // Do not trigger continuous drawing mode for stamps
    }

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    isDrawing.current = true;

    // Dot on single click helper
    draw(e); 
  };

  const draw = (e) => {
    const { x, y } = getCoordinates(e);

    // Update ghost tracking overlay
    if (activeTool === 'stamp') {
      setCursorPos({ x, y });
    }

    if (!isDrawing.current || !contextRef.current || activeTool === 'stamp') return;

    const ctx = contextRef.current;
    ctx.lineTo(x, y);

    // Apply tools
    ctx.strokeStyle = activeTool === 'eraser' ? '#ffffff' : activeColor;
    ctx.lineWidth = activeTool === 'eraser' ? brushSize * 4 : brushSize;

    ctx.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    isDrawing.current = false;
  };

  const handleSaveAs = () => {
    if (!canvasRef.current) return;
    setDropdownOpen(false);
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'my_masterpiece.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="paint-container">
      {/* Menu Nav */}
      <div className="paint-menubar">
        <div className="paint-menu-item">
          <span onClick={() => setDropdownOpen(!dropdownOpen)}>File</span>
          {dropdownOpen && (
            <div className="paint-dropdown bevel-outset">
              <div className="paint-dropdown-item" onClick={handleSaveAs}>Save As...</div>
            </div>
          )}
        </div>
      </div>

      <div className="paint-body">
        {/* Left Toolbar */}
        <div className="paint-sidebar">
          <div 
            className={`paint-tool ${activeTool === 'pencil' ? 'active-tool bevel-inset' : 'bevel-outset'}`}
            onClick={() => setActiveTool('pencil')}
            title="Pencil"
          >
            ✏️
          </div>
          <div 
            className={`paint-tool ${activeTool === 'eraser' ? 'active-tool bevel-inset' : 'bevel-outset'}`}
            onClick={() => setActiveTool('eraser')}
            title="Eraser"
          >
            🧼
          </div>
          <div 
            className={`paint-tool ${activeTool === 'stamp' ? 'active-tool bevel-inset' : 'bevel-outset'}`}
            onClick={() => setActiveTool('stamp')}
            title="Curated Stamps"
          >
            ⭐
          </div>
        </div>

        {/* Canvas Workspace */}
        <div 
           className="paint-canvas-wrapper bevel-inset" 
           style={{ position: 'relative', overflow: 'hidden' }}
           onPointerEnter={() => setIsHovering(true)}
           onPointerLeave={() => { setIsHovering(false); stopDrawing(); }}
        >
          <div style={{ position: 'relative', width: 600, height: 400 }}>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              style={{ touchAction: 'none' }}
              className={activeTool === 'stamp' ? 'canvas-stamp' : (activeTool === 'eraser' ? 'canvas-eraser' : 'canvas-pencil')}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              // pointerOut is essentially handled by wrapper leave
            />
            
            {/* Ghost Sticker Overlay */}
            {activeTool === 'stamp' && isHovering && STAMPS[activeStamp] && (
              <img 
                src={STAMPS[activeStamp] + '?t=' + Date.now()} 
                alt="ghost preview"
                style={{
                  position: 'absolute',
                  top: cursorPos.y,
                  left: cursorPos.x,
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '120px',
                  maxHeight: '120px',
                  opacity: 0.5,
                  pointerEvents: 'none',
                  zIndex: 20
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer Palette */}
      <div className="paint-palette-bar">
        {activeTool === 'stamp' ? (
          // Render Stamp Selection UI when stamp tool is active
          STAMPS.map((src, index) => (
            <div
              key={src}
              className={`paint-color-swatch ${activeStamp === index ? 'active-swatch bevel-inset' : 'bevel-outset'}`}
              style={{ backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2px' }}
              onClick={() => setActiveStamp(index)}
              title={`Curated Stamp ${index + 1}`}
            >
              <img src={src + '?t=' + Date.now()} alt={`stamp ${index+1}`} style={{ width: '100%', height: '100%', objectFit: 'scale-down' }} />
            </div>
          ))
        ) : (
          // Render classic colors when drawing tools are active
          COLORS.map((hex) => (
            <div
              key={hex}
              className={`paint-color-swatch ${activeColor === hex ? 'active-swatch bevel-inset' : 'bevel-outset'}`}
              style={{ backgroundColor: hex }}
              onClick={() => setActiveColor(hex)}
              title={hex}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Paint;
