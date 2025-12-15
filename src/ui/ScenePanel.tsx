import { useEditorStore } from '../editor/appStore';

export default function ScenePanel() {
  const { currentScene, selectedEntity, setSelectedEntity } = useEditorStore();

  const entities = currentScene ? currentScene.getWorld().getAllEntities() : [];

  return (
    <div style={{
      width: '200px',
      background: '#252525',
      borderRight: '1px solid #444',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
        Scene Entities
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {entities.map(entity => (
          <div
            key={entity}
            onClick={() => setSelectedEntity(entity)}
            style={{
              padding: '6px',
              margin: '2px 0',
              background: selectedEntity === entity ? '#4a90e2' : '#2d2d2d',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              color: '#fff',
            }}
          >
            Entity {entity}
          </div>
        ))}
        {entities.length === 0 && (
          <div style={{ color: '#666', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>
            No entities in scene
          </div>
        )}
      </div>
    </div>
  );
}
