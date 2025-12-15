import { describe, it, expect, beforeEach } from 'vitest';
import { APICatalog } from '../scripting/autogen/apiCatalog';
import { NodeAutoGenerator } from '../scripting/autogen/nodeAutoGen';
import { NodeRegistry, NodeCategory, ExecutionContext, ExecutionResult } from '../scripting/graph/nodeRegistry';
import { PinType } from '../scripting/graph/pinTypes';
import { registerECSNodes } from '../scripting/engine_nodes/ecsNodes';
import { registerInputNodes } from '../scripting/engine_nodes/inputNodes';
import { registerPhysicsNodes } from '../scripting/engine_nodes/physicsNodes';

describe('API Catalog', () => {
  let catalog: APICatalog;

  beforeEach(() => {
    catalog = new APICatalog();
  });

  it('should register API functions', () => {
    catalog.register({
      name: 'test.function',
      displayName: 'Test Function',
      category: NodeCategory.Custom,
      parameters: [
        { name: 'param1', type: PinType.Float },
      ],
      returnType: PinType.Float,
    });

    expect(catalog.get('test.function')).toBeDefined();
    expect(catalog.get('test.function')?.displayName).toBe('Test Function');
  });

  it('should get functions by category', () => {
    catalog.register({
      name: 'engine.spawn',
      displayName: 'Spawn',
      category: NodeCategory.Engine,
      parameters: [],
    });

    catalog.register({
      name: 'math.add',
      displayName: 'Add',
      category: NodeCategory.Math,
      parameters: [],
    });

    const engineFunctions = catalog.getByCategory(NodeCategory.Engine);
    expect(engineFunctions.length).toBe(1);
    expect(engineFunctions[0].name).toBe('engine.spawn');
  });

  it('should search functions', () => {
    catalog.register({
      name: 'spawnEntity',
      displayName: 'Spawn Entity',
      category: NodeCategory.Engine,
      description: 'Create a new entity',
      parameters: [],
    });

    const results = catalog.search('spawn');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('spawnEntity');
  });
});

describe('Node Auto Generator', () => {
  let catalog: APICatalog;
  let generator: NodeAutoGenerator;

  beforeEach(() => {
    catalog = new APICatalog();
    generator = new NodeAutoGenerator(catalog);
  });

  it('should generate node from API function', () => {
    catalog.register({
      name: 'test.add',
      displayName: 'Add',
      category: NodeCategory.Math,
      parameters: [
        { name: 'a', type: PinType.Float, defaultValue: 0 },
        { name: 'b', type: PinType.Float, defaultValue: 0 },
      ],
      returnType: PinType.Float,
      pure: true,
    });

    const nodeDef = generator.generateNode(catalog.get('test.add')!);
    expect(nodeDef.type).toBe('auto.test.add');
    expect(nodeDef.name).toBe('Add');
    expect(nodeDef.inputs.length).toBe(2);
    expect(nodeDef.outputs.length).toBe(1);
    expect(nodeDef.pure).toBe(true);
  });

  it('should generate node with exec pins', () => {
    catalog.register({
      name: 'test.action',
      displayName: 'Test Action',
      category: NodeCategory.Engine,
      parameters: [],
      execInput: true,
      execOutput: true,
      pure: false,
    });

    const nodeDef = generator.generateNode(catalog.get('test.action')!);
    expect(nodeDef.inputs.some(p => p.name === 'Exec')).toBe(true);
    expect(nodeDef.outputs.some(p => p.name === 'Exec')).toBe(true);
  });

  it('should register implementation', () => {
    catalog.register({
      name: 'test.func',
      displayName: 'Test',
      category: NodeCategory.Custom,
      parameters: [],
      returnType: PinType.Float,
    });

    let executed = false;
    generator.registerImplementation('test.func', () => {
      executed = true;
      return ExecutionResult.Continue;
    });

    const nodeDef = generator.generateNode(catalog.get('test.func')!);
    expect(nodeDef.execute).toBeDefined();
    
    // Execute would be called by runtime
    expect(executed).toBe(false); // Not executed yet
  });

  it('should generate all nodes from catalog', () => {
    catalog.register({
      name: 'func1',
      displayName: 'Func 1',
      category: NodeCategory.Math,
      parameters: [],
    });

    catalog.register({
      name: 'func2',
      displayName: 'Func 2',
      category: NodeCategory.Math,
      parameters: [],
    });

    const nodes = generator.generateAllNodes();
    expect(nodes.length).toBe(2);
  });
});

describe('Engine Node Registration', () => {
  let catalog: APICatalog;

  beforeEach(() => {
    catalog = new APICatalog();
  });

  it('should register ECS nodes', () => {
    registerECSNodes(catalog);
    
    expect(catalog.get('spawnEntity')).toBeDefined();
    expect(catalog.get('destroyEntity')).toBeDefined();
    expect(catalog.get('getComponent')).toBeDefined();
    expect(catalog.get('setComponent')).toBeDefined();
  });

  it('should register input nodes', () => {
    registerInputNodes(catalog);
    
    expect(catalog.get('getInputActionValue')).toBeDefined();
    expect(catalog.get('isInputActionPressed')).toBeDefined();
    expect(catalog.get('isInputActionHeld')).toBeDefined();
  });

  it('should register physics nodes', () => {
    registerPhysicsNodes(catalog);
    
    expect(catalog.get('setVelocity')).toBeDefined();
    expect(catalog.get('addForce')).toBeDefined();
    expect(catalog.get('onCollisionEnter')).toBeDefined();
    expect(catalog.get('onCollisionExit')).toBeDefined();
  });
});

describe('Auto-Generated Node Integration', () => {
  let catalog: APICatalog;
  let generator: NodeAutoGenerator;
  let registry: NodeRegistry;

  beforeEach(() => {
    catalog = new APICatalog();
    generator = new NodeAutoGenerator(catalog);
    registry = new NodeRegistry();

    // Register engine nodes
    registerECSNodes(catalog);
    registerInputNodes(catalog);
  });

  it('should register auto-generated nodes in registry', () => {
    const nodes = generator.generateAllNodes();
    
    for (const node of nodes) {
      registry.register(node);
    }

    expect(registry.has('auto.spawnEntity')).toBe(true);
    expect(registry.has('auto.getInputActionValue')).toBe(true);
  });

  it('should generate nodes with correct pin types', () => {
    const spawnNode = generator.generateNode(catalog.get('spawnEntity')!);
    
    expect(spawnNode.inputs.some(p => p.name === 'prefabName' && p.type === PinType.String)).toBe(true);
    expect(spawnNode.outputs.some(p => p.name === 'Result' && p.type === PinType.EntityRef)).toBe(true);
  });
});
