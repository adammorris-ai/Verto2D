import { useRef, useEffect } from 'react';
import { useEditorStore } from '../editor/appStore';
import { Renderer } from '../render/renderer';

export default function Viewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const { isRunning } = useEditorStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize renderer
    const renderer = new Renderer(canvas);
    if (renderer.init(canvas)) {
      rendererRef.current = renderer;
      renderer.resize(800, 600);
    }

    return () => {
      // Cleanup
    };
  }, []);

  useEffect(() => {
    if (!isRunning || !rendererRef.current) return;

    let animationFrame: number;

    const loop = () => {
      performance.now();

      const renderer = rendererRef.current;
      if (renderer) {
        renderer.beginFrame();
        renderer.clear(0.1, 0.1, 0.1, 1);
        // Render game content here
        renderer.endFrame();
      }

      if (isRunning) {
        animationFrame = requestAnimationFrame(loop);
      }
    };

    animationFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isRunning]);

  return (
    <div style={{
      flex: 1,
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          border: '1px solid #444',
        }}
      />
      {!isRunning && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
          Press Run to start
        </div>
      )}
    </div>
  );
}
