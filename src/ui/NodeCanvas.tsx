import React, { useRef, useEffect } from 'react';
import { Graph, Node } from '../scripting/graph/graphTypes';
import { useEditorStore } from '../editor/appStore';

interface NodeCanvasProps {
  graph: Graph | null;
  onGraphChange?: (graph: Graph) => void;
}

export default function NodeCanvas({ graph }: NodeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { selectedNode, setSelectedNode } = useEditorStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graph) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw nodes
    for (const node of graph.nodes.values()) {
      drawNode(ctx, node, selectedNode === node.id);
    }

    // Draw edges
    for (const edge of graph.edges.values()) {
      drawEdge(ctx, graph, edge);
    }
  }, [graph, selectedNode]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;

    const gridSize = 20;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawNode = (ctx: CanvasRenderingContext2D, node: Node, selected: boolean) => {
    const x = node.position.x;
    const y = node.position.y;
    const width = 150;
    const height = 60;

    // Node background
    ctx.fillStyle = selected ? '#4a90e2' : '#2d2d2d';
    ctx.fillRect(x, y, width, height);

    // Node border
    ctx.strokeStyle = selected ? '#6ab0f3' : '#444';
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(x, y, width, height);

    // Node title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(node.title || node.type, x + 8, y + 20);

    // Input pins
    let pinY = y + 35;
    for (const input of node.inputs.slice(0, 3)) {
      drawPin(ctx, x, pinY, 'input', input.type);
      pinY += 15;
    }

    // Output pins
    pinY = y + 35;
    for (const output of node.outputs.slice(0, 3)) {
      drawPin(ctx, x + width, pinY, 'output', output.type);
      pinY += 15;
    }
  };

  const drawPin = (ctx: CanvasRenderingContext2D, x: number, y: number, _direction: 'input' | 'output', type: string) => {
    const pinSize = 8;
    ctx.fillStyle = getPinColor(type);
    ctx.beginPath();
    ctx.arc(x, y, pinSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const getPinColor = (type: string): string => {
    const colors: Record<string, string> = {
      exec: '#ffff00',
      bool: '#ff6b6b',
      int: '#4ecdc4',
      float: '#45b7d1',
      string: '#96ceb4',
      vec2: '#ffeaa7',
      vec3: '#fdcb6e',
    };
    return colors[type] || '#888';
  };

  const drawEdge = (ctx: CanvasRenderingContext2D, graph: Graph, edge: any) => {
    const fromNode = graph.nodes.get(edge.fromNode);
    const toNode = graph.nodes.get(edge.toNode);
    if (!fromNode || !toNode) return;

    const fromX = fromNode.position.x + 150;
    const fromY = fromNode.position.y + 40;
    const toX = toNode.position.x;
    const toY = toNode.position.y + 40;

    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.bezierCurveTo(fromX + 50, fromY, toX - 50, toY, toX, toY);
    ctx.stroke();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !graph) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a node
    for (const node of graph.nodes.values()) {
      if (
        x >= node.position.x &&
        x <= node.position.x + 150 &&
        y >= node.position.y &&
        y <= node.position.y + 60
      ) {
        setSelectedNode(node.id);
        return;
      }
    }

    // Deselect if clicked on empty space
    setSelectedNode(null);
  };

  return (
    <div style={{ flex: 1, position: 'relative', background: '#1a1a1a' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
        }}
      />
      {!graph && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#666',
          fontSize: '14px',
        }}>
          No graph open. Create a new graph to start.
        </div>
      )}
    </div>
  );
}
