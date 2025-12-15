import React, { useState } from 'react';
import { AssetImporter } from '../assets/importer';
import { AssetDB } from '../assets/assetDB';

interface AssetPanelProps {
  importer: AssetImporter;
  db: AssetDB;
}

export default function AssetPanel({ importer, db }: AssetPanelProps) {
  const [assets, setAssets] = useState<any[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const imported = await importer.importFiles(Array.from(files));
      for (const file of imported) {
        const metadata = importer.createMetadata(file);
        await db.store(metadata);
      }
      // Refresh asset list
      const allAssets = await db.getAll();
      setAssets(allAssets);
    } catch (error) {
      console.error('Error importing assets:', error);
    }
  };

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
      <div style={{ marginBottom: '8px' }}>
        <label style={{
          display: 'block',
          padding: '6px',
          background: '#3d3d3d',
          borderRadius: '4px',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '12px',
          textAlign: 'center',
        }}>
          📁 Import Assets
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {assets.map(asset => (
          <div
            key={asset.guid}
            style={{
              padding: '6px',
              margin: '2px 0',
              background: '#2d2d2d',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#fff',
            }}
          >
            {asset.name}
          </div>
        ))}
        {assets.length === 0 && (
          <div style={{ color: '#666', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>
            No assets imported
          </div>
        )}
      </div>
    </div>
  );
}
