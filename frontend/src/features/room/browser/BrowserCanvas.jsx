import React, { useEffect, useRef } from 'react';
import './VirtualBrowser.css';

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

const BrowserCanvas = ({ frameBuffer, onInteraction }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Render incoming JPEG frame
  useEffect(() => {
    if (!frameBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    // Convert ArrayBuffer to Blob -> ObjectURL -> Image
    const blob = new Blob([frameBuffer], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      URL.revokeObjectURL(url); // Clean up memory
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [frameBuffer]);

  // Handle responsive scaling
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      const scale = Math.min(width / VIRTUAL_WIDTH, height / VIRTUAL_HEIGHT);
      
      canvas.style.width = `${VIRTUAL_WIDTH * scale}px`;
      canvas.style.height = `${VIRTUAL_HEIGHT * scale}px`;
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Map DOM coordinates to Virtual coordinates
  const getVirtualCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;

    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
    };
  };

  // Interaction handlers
  const handlePointerDown = (e) => {
    if (e.button !== 0) return; // Only left click
    const { x, y } = getVirtualCoords(e);
    onInteraction({ type: 'click', x, y });
    canvasRef.current?.focus(); // Ensure canvas has focus for keyboard events
  };

  const handlePointerMove = (e) => {
    const { x, y } = getVirtualCoords(e);
    onInteraction({ type: 'mousemove', x, y });
  };

  const handleWheel = (e) => {
    e.preventDefault(); // Prevent scrolling the whole page
    const { x, y } = getVirtualCoords(e);
    onInteraction({ 
      type: 'scroll', 
      x, y, 
      deltaX: e.deltaX, 
      deltaY: e.deltaY 
    });
  };

  const handleKeyDown = (e) => {
    e.preventDefault(); // Prevent default browser shortcuts
    onInteraction({ type: 'keydown', key: e.key });
  };

  const handleKeyUp = (e) => {
    e.preventDefault();
    onInteraction({ type: 'keyup', key: e.key });
  };

  return (
    <div ref={containerRef} className="vb-viewport">
      <canvas
        ref={canvasRef}
        className="vb-canvas"
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        tabIndex={0} // Make focusable for keyboard events
        style={{ outline: 'none' }} // Hide focus ring
      />
    </div>
  );
};

export default BrowserCanvas;
