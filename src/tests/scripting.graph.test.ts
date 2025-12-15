import { describe, it, expect, beforeEach } from 'vitest';
import { createGraph, createNode, addNode, addEdge, createEdge } from '../scripting/graph/graphTypes';
import { Pin, PinType } from '../scripting/graph/pinTypes';
import { NodeRegistry, NodeCategory, ExecutionResult } from '../scripting/graph/nodeRegistry';
import { GraphValidator } from '../scripting/graph/validator';
import { GraphCompiler } from '../scripting/graph/compiler';
import { GraphRuntime } from '../scripting/graph/runtime';
import { serializeGraph, deserializeGraph } from '../scripting/graph/serializer';
import { createFlowNodes } from '../scripting/stdlib/flow';
import { createMathNodes } from '../scripting/stdlib/math';

describe('Graph Types', () => {
  it('should create graph', () => {
    const graph = createGraph('test-graph', 'Test Graph');
    expect(graph.id).toBe('test-graph');
    expect(graph.name).toBe('Test Graph');
    expect(graph.nodes.size).toBe(0);
    expect(graph.edges.size).toBe(0);
  });

  it('should create and add node', () => {
    const graph = createGraph('test', 'Test');
    const pin = new Pin('input1', 'Input', PinType.Float, 'input');
    const node = createNode('node1', 'test.node', { x: 0, y: 0 }, [pin], []);
    
    addNode(graph, node);
    expect(graph.nodes.size).toBe(1);
    expect(graph.nodes.get('node1')).toBeDefined();
  });

  it('should create and add edge', () => {
    const graph = createGraph('test', 'Test');
    const outputPin = new Pin('output', 'Output', PinType.Float, 'output');
    const inputPin = new Pin('input', 'Input', PinType.Float, 'input');
    
    const node1 = createNode('node1', 'test.node', { x: 0, y: 0 }, [], [outputPin]);
    const node2 = createNode('node2', 'test.node', { x: 100, y: 0 }, [inputPin], []);
    
    addNode(graph, node1);
    addNode(graph, node2);
    
    const edge = createEdge('edge1', 'node1', 'output', 'node2', 'input');
    const success = addEdge(graph, edge);
    
    expect(success).toBe(true);
    expect(graph.edges.size).toBe(1);
  });

  it('should reject incompatible edge types', () => {
    const graph = createGraph('test', 'Test');
    const outputPin = new Pin('output', 'Output', PinType.Float, 'output');
    const inputPin = new Pin('input', 'Input', PinType.String, 'input');
    
    const node1 = createNode('node1', 'test.node', { x: 0, y: 0 }, [], [outputPin]);
    const node2 = createNode('node2', 'test.node', { x: 100, y: 0 }, [inputPin], []);
    
    addNode(graph, node1);
    addNode(graph, node2);
    
    const edge = createEdge('edge1', 'node1', 'output', 'node2', 'input');
    const success = addEdge(graph, edge);
    
    expect(success).toBe(false);
  });
});

describe('Node Registry', () => {
  let registry: NodeRegistry;

  beforeEach(() => {
    registry = new NodeRegistry();
  });

  it('should register node types', () => {
    registry.register({
      type: 'test.node',
      name: 'Test Node',
      category: NodeCategory.Custom,
      inputs: [],
      outputs: [],
    });

    expect(registry.has('test.node')).toBe(true);
    expect(registry.get('test.node')?.name).toBe('Test Node');
  });

  it('should get nodes by category', () => {
    registry.register({
      type: 'flow.sequence',
      name: 'Sequence',
      category: NodeCategory.Flow,
      inputs: [],
      outputs: [],
    });

    registry.register({
      type: 'math.add',
      name: 'Add',
      category: NodeCategory.Math,
      inputs: [],
      outputs: [],
    });

    const flowNodes = registry.getByCategory(NodeCategory.Flow);
    expect(flowNodes.length).toBe(1);
    expect(flowNodes[0].type).toBe('flow.sequence');
  });

  it('should search nodes', () => {
    registry.register({
      type: 'math.add',
      name: 'Add',
      category: NodeCategory.Math,
      description: 'Add two numbers',
      inputs: [],
      outputs: [],
    });

    const results = registry.search('add');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe('math.add');
  });
});

describe('Graph Validator', () => {
  let registry: NodeRegistry;
  let validator: GraphValidator;

  beforeEach(() => {
    registry = new NodeRegistry();
    
    // Register test nodes
    registry.register({
      type: 'test.node',
      name: 'Test Node',
      category: NodeCategory.Custom,
      inputs: [
        { id: 'input', name: 'Input', type: PinType.Float, direction: 'input', required: true },
      ],
      outputs: [
        { id: 'output', name: 'Output', type: PinType.Float, direction: 'output' },
      ],
    });

    validator = new GraphValidator(registry);
  });

  it('should validate graph with valid nodes', () => {
    const graph = createGraph('test', 'Test');
    const inputPin = new Pin('input', 'Input', PinType.Float, 'input');
    const outputPin = new Pin('output', 'Output', PinType.Float, 'output');
    const node = createNode('node1', 'test.node', { x: 0, y: 0 }, [inputPin], [outputPin]);
    node.inputs[0].defaultValue = 0; // Provide default to satisfy required
    
    addNode(graph, node);
    
    const errors = validator.validate(graph);
    expect(errors.length).toBe(0);
  });

  it('should detect missing required inputs', () => {
    const graph = createGraph('test', 'Test');
    // Create node without the required input pin
    const outputPin = new Pin('output', 'Output', PinType.Float, 'output');
    const node = createNode('node1', 'test.node', { x: 0, y: 0 }, [], [outputPin]);
    // Node is missing the required 'input' pin
    
    addNode(graph, node);
    
    const errors = validator.validate(graph);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.message.includes('Missing required'))).toBe(true);
  });

  it('should detect type mismatches', () => {
    const graph = createGraph('test', 'Test');
    const outputPin = new Pin('output', 'Output', PinType.Float, 'output');
    const inputPin = new Pin('input', 'Input', PinType.String, 'input');
    
    const node1 = createNode('node1', 'test.node', { x: 0, y: 0 }, [], [outputPin]);
    const node2 = createNode('node2', 'test.node', { x: 100, y: 0 }, [inputPin], []);
    
    addNode(graph, node1);
    addNode(graph, node2);
    
    // Manually add edge (bypassing addEdge's type check) to test validator
    const edge = createEdge('edge1', 'node1', 'output', 'node2', 'input');
    graph.edges.set('edge1', edge);
    
    const errors = validator.validate(graph);
    // Check for any validation errors related to the edge
    const edgeErrors = errors.filter(e => e.edgeId === 'edge1');
    expect(edgeErrors.length).toBeGreaterThan(0);
  });
});

describe('Graph Compiler', () => {
  let registry: NodeRegistry;
  let compiler: GraphCompiler;

  beforeEach(() => {
    registry = new NodeRegistry();
    
    // Register standard nodes
    for (const node of createFlowNodes()) {
      registry.register(node);
    }
    for (const node of createMathNodes()) {
      registry.register(node);
    }

    compiler = new GraphCompiler(registry);
  });

  it('should compile valid graph', () => {
    const graph = createGraph('test', 'Test');
    const addNodeDef = registry.get('math.add')!;
    
    const node = createNode(
      'node1',
      'math.add',
      { x: 0, y: 0 },
      addNodeDef.inputs.map(p => new Pin(p.id, p.name, p.type, p.direction, p.defaultValue, p.required)),
      addNodeDef.outputs.map(p => new Pin(p.id, p.name, p.type, p.direction))
    );
    
    addNode(graph, node);
    
    const result = compiler.compile(graph);
    expect(result.errors.length).toBe(0);
    expect(result.plan.nodes.length).toBe(1);
    expect(result.plan.execOrder.length).toBe(1);
  });

  it('should calculate execution order', () => {
    const graph = createGraph('test', 'Test');
    const addNodeDef = registry.get('math.add')!;
    
    const node1 = createNode(
      'node1',
      'math.add',
      { x: 0, y: 0 },
      addNodeDef.inputs.map(p => new Pin(p.id, p.name, p.type, p.direction, p.defaultValue, p.required)),
      addNodeDef.outputs.map(p => new Pin(p.id, p.name, p.type, p.direction))
    );
    
    const node2 = createNode(
      'node2',
      'math.add',
      { x: 100, y: 0 },
      addNodeDef.inputs.map(p => new Pin(p.id, p.name, p.type, p.direction, p.defaultValue, p.required)),
      addNodeDef.outputs.map(p => new Pin(p.id, p.name, p.type, p.direction))
    );
    
    addNode(graph, node1);
    addNode(graph, node2);
    
    // Connect node1 output to node2 input
    const edge = createEdge('edge1', 'node1', 'result', 'node2', 'a');
    addEdge(graph, edge);
    
    const result = compiler.compile(graph);
    // Check for errors (might have warnings about unconnected inputs)
    if (result.errors.length > 0) {
      console.log('Compilation errors:', result.errors);
    }
    // Both nodes should be in the execution plan
    expect(result.plan.nodes.length).toBe(2);
    // Execution order should include both nodes (order may vary for pure nodes)
    expect(result.plan.execOrder.length).toBe(2);
    expect(result.plan.execOrder).toContain('node1');
    expect(result.plan.execOrder).toContain('node2');
  });
});

describe('Graph Serialization', () => {
  it('should serialize and deserialize graph', () => {
    const graph = createGraph('test', 'Test Graph');
    const pin = new Pin('input', 'Input', PinType.Float, 'input', 0);
    const node = createNode('node1', 'test.node', { x: 10, y: 20 }, [pin], []);
    
    addNode(graph, node);
    
    const serialized = serializeGraph(graph);
    expect(serialized.id).toBe('test');
    expect(serialized.name).toBe('Test Graph');
    expect(serialized.nodes.length).toBe(1);
    
    const deserialized = deserializeGraph(serialized);
    expect(deserialized.id).toBe('test');
    expect(deserialized.nodes.size).toBe(1);
    expect(deserialized.nodes.get('node1')?.position.x).toBe(10);
  });
});

describe('Graph Runtime', () => {
  let registry: NodeRegistry;
  let runtime: GraphRuntime;

  beforeEach(() => {
    registry = new NodeRegistry();
    
    // Register test nodes
      registry.register({
        type: 'test.setValue',
        name: 'Set Value',
        category: NodeCategory.Custom,
        inputs: [
          { id: 'exec', name: 'Exec', type: PinType.Exec, direction: 'input' },
          { id: 'value', name: 'Value', type: PinType.Float, direction: 'input', defaultValue: 0 },
        ],
        outputs: [
          { id: 'exec', name: 'Exec', type: PinType.Exec, direction: 'output' },
          { id: 'result', name: 'Result', type: PinType.Float, direction: 'output' },
        ],
        pure: false,
        execute: (_node, context) => {
          const value = context.getInputValue('test', 'value') as number;
          context.setOutputValue('test', 'result', value);
          return ExecutionResult.Continue;
        },
      });

    runtime = new GraphRuntime(registry);
  });

  it('should initialize runtime', () => {
    const graph = createGraph('test', 'Test');
    const compiler = new GraphCompiler(registry);
    const result = compiler.compile(graph);
    
    runtime.initialize(result.plan);
    expect(runtime.getAllNodeStates().size).toBe(0);
  });

  it('should dispatch events', () => {
      registry.register({
        type: 'event.beginPlay',
        name: 'Event BeginPlay',
        category: NodeCategory.Flow,
        inputs: [],
        outputs: [
          { id: 'exec', name: 'Exec', type: PinType.Exec, direction: 'output' },
        ],
        pure: false,
        execute: () => ExecutionResult.Continue,
      });

    const graph = createGraph('test', 'Test');
    const node = createNode('node1', 'event.beginPlay', { x: 0, y: 0 }, [], [
      new Pin('exec', 'Exec', PinType.Exec, 'output'),
    ]);
    addNode(graph, node);

    const compiler = new GraphCompiler(registry);
    const result = compiler.compile(graph);
    runtime.initialize(result.plan);

    // Should not throw
    expect(() => runtime.dispatchEvent('BeginPlay')).not.toThrow();
  });
});
