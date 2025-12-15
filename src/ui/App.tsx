import { useEffect, useState } from 'react';
import { useEditorStore } from '../editor/appStore';
import { NodeRegistry } from '../scripting/graph/nodeRegistry';
import { createFlowNodes } from '../scripting/stdlib/flow';
import { createMathNodes } from '../scripting/stdlib/math';
import { createTimeNodes } from '../scripting/stdlib/time';
import { APICatalog } from '../scripting/autogen/apiCatalog';
import { NodeAutoGenerator } from '../scripting/autogen/nodeAutoGen';
import { registerECSNodes } from '../scripting/engine_nodes/ecsNodes';
import { registerInputNodes } from '../scripting/engine_nodes/inputNodes';
import { registerPhysicsNodes } from '../scripting/engine_nodes/physicsNodes';
import { registerTransformNodes } from '../scripting/engine_nodes/transformNodes';
import { registerAudioNodes } from '../scripting/engine_nodes/audioNodes';
import { registerUINodes } from '../scripting/engine_nodes/uiNodes';
import { registerAnimationNodes } from '../scripting/engine_nodes/animationNodes';
import { AssetDB } from '../assets/assetDB';
import { AssetImporter } from '../assets/importer';
import { Project } from '../engine/project';
import { Scene } from '../engine/scene';
import { createGraph } from '../scripting/graph/graphTypes';

import Toolbar from './Toolbar';
import NodePalette from './NodePalette';
import NodeCanvas from './NodeCanvas';
import Viewport from './Viewport';
import Inspector from './Inspector';
import AssetPanel from './AssetPanel';
import ScenePanel from './ScenePanel';
import StatusBar from './StatusBar';

export default function App() {
  const [registry] = useState(() => {
    const reg = new NodeRegistry();
    
    // Register standard library nodes
    for (const node of createFlowNodes()) {
      reg.register(node);
    }
    for (const node of createMathNodes()) {
      reg.register(node);
    }
    for (const node of createTimeNodes()) {
      reg.register(node);
    }

    // Register engine nodes via auto-generation
    const catalog = new APICatalog();
    registerECSNodes(catalog);
    registerInputNodes(catalog);
    registerPhysicsNodes(catalog);
    registerTransformNodes(catalog);
    registerAudioNodes(catalog);
    registerUINodes(catalog);
    registerAnimationNodes(catalog);

    const generator = new NodeAutoGenerator(catalog);
    const autoNodes = generator.generateAllNodes();
    for (const node of autoNodes) {
      reg.register(node);
    }

    return reg;
  });

  const [assetDB] = useState(() => new AssetDB());
  const [importer] = useState(() => new AssetImporter(assetDB));

  const {
    currentGraph,
    viewMode,
    showAssetPanel,
    showScenePanel,
    setProject,
    setCurrentGraph,
    setCurrentScene,
  } = useEditorStore();

  useEffect(() => {
    // Initialize asset DB
    assetDB.init();

    // Create default project
    const defaultProject = new Project('New Project');
    const defaultScene = new Scene('Main Scene');
    defaultProject.addScene(defaultScene);
    setProject(defaultProject);
    setCurrentScene(defaultScene);

    // Create default graph
    const graph = createGraph('main-graph', 'Main Graph');
    setCurrentGraph(graph);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#1a1a1a',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <Toolbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', borderRight: '1px solid #444' }}>
          {showAssetPanel && <AssetPanel importer={importer} db={assetDB} />}
          {showScenePanel && <ScenePanel />}
          <NodePalette registry={registry} />
        </div>

        {/* Center Area */}
        <div style={{ display: 'flex', flex: 1, flexDirection: viewMode === 'split' ? 'row' : 'column' }}>
          {(viewMode === 'canvas' || viewMode === 'split') && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <NodeCanvas graph={currentGraph} />
            </div>
          )}
          {(viewMode === 'viewport' || viewMode === 'split') && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Viewport />
            </div>
          )}
        </div>

        {/* Right Panel */}
        <Inspector registry={registry} />
      </div>

      <StatusBar />
    </div>
  );
}
