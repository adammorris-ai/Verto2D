import { useState } from 'react';
import { NodeRegistry, NodeCategory } from '../scripting/graph/nodeRegistry';

interface NodePaletteProps {
  registry: NodeRegistry;
  onNodeSelect?: (nodeType: string) => void;
  beginnerMode?: boolean;
}

export default function NodePalette({ registry, onNodeSelect, beginnerMode = false }: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NodeCategory | 'all'>('all');

  const categories = registry.getCategories();
  let nodes = selectedCategory === 'all'
    ? registry.getAll()
    : registry.getByCategory(selectedCategory);

  // Filter by search query
  if (searchQuery) {
    nodes = registry.search(searchQuery);
  }

  // Filter beginner mode nodes
  if (beginnerMode) {
    const beginnerCategories = [NodeCategory.Flow, NodeCategory.Math, NodeCategory.Engine];
    nodes = nodes.filter(n => beginnerCategories.includes(n.category));
  }

  const handleNodeClick = (nodeType: string) => {
    onNodeSelect?.(nodeType);
  };

  return (
    <div style={{
      width: '250px',
      background: '#252525',
      borderRight: '1px solid #444',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <div style={{ padding: '8px', borderBottom: '1px solid #444' }}>
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            background: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#fff',
          }}
        />
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #444' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            flex: 1,
            padding: '6px',
            background: selectedCategory === 'all' ? '#3d3d3d' : 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              flex: 1,
              padding: '6px',
              background: selectedCategory === cat ? '#3d3d3d' : 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px' }}>
        {nodes.map(node => (
          <div
            key={node.type}
            onClick={() => handleNodeClick(node.type)}
            style={{
              padding: '8px',
              margin: '2px 0',
              background: '#2d2d2d',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '12px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3d3d3d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2d2d2d';
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{node.name}</div>
            {node.description && (
              <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                {node.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
