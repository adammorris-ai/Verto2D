import { useEditorStore } from '../editor/appStore';
import { NodeRegistry } from '../scripting/graph/nodeRegistry';

export default function Inspector({ registry }: { registry: NodeRegistry }) {
  const { selectedNode, selectedEntity, currentGraph } = useEditorStore();

  if (!selectedNode && !selectedEntity) {
    return (
      <div style={{
        width: '300px',
        background: '#252525',
        borderLeft: '1px solid #444',
        padding: '16px',
        color: '#ccc',
        fontSize: '12px',
      }}>
        Select a node or entity to inspect
      </div>
    );
  }

  if (selectedNode && currentGraph) {
    const node = currentGraph.nodes.get(selectedNode);
    if (!node) return null;

    const definition = registry.get(node.type);

    return (
      <div style={{
        width: '300px',
        background: '#252525',
        borderLeft: '1px solid #444',
        padding: '16px',
        color: '#fff',
        overflowY: 'auto',
        height: '100%',
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Node Properties</h3>
        
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>Type</div>
          <div style={{ fontSize: '12px' }}>{node.type}</div>
        </div>

        {node.title && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>Title</div>
            <input
              type="text"
              value={node.title}
              onChange={(e) => {
                if (node) {
                  node.title = e.target.value;
                }
              }}
              style={{
                width: '100%',
                padding: '4px',
                background: '#1a1a1a',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          </div>
        )}

        {definition && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>Description</div>
            <div style={{ fontSize: '11px', color: '#ccc' }}>{definition.description || 'No description'}</div>
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>Position</div>
          <div style={{ fontSize: '11px' }}>
            X: {node.position.x.toFixed(0)}, Y: {node.position.y.toFixed(0)}
          </div>
        </div>

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #444' }}>
          <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>Inputs</div>
          {node.inputs.map(input => (
            <div key={input.id} style={{ marginBottom: '4px', fontSize: '11px' }}>
              <span style={{ color: '#4ecdc4' }}>{input.name}</span>
              <span style={{ color: '#666', marginLeft: '8px' }}>({input.type})</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #444' }}>
          <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>Outputs</div>
          {node.outputs.map(output => (
            <div key={output.id} style={{ marginBottom: '4px', fontSize: '11px' }}>
              <span style={{ color: '#4ecdc4' }}>{output.name}</span>
              <span style={{ color: '#666', marginLeft: '8px' }}>({output.type})</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '300px',
      background: '#252525',
      borderLeft: '1px solid #444',
      padding: '16px',
      color: '#fff',
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Entity Properties</h3>
      <div style={{ fontSize: '12px' }}>Entity ID: {selectedEntity}</div>
    </div>
  );
}
