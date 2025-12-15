import { useEditorStore } from '../editor/appStore';

export default function StatusBar() {
  const { statusMessage, errors, warnings } = useEditorStore();

  return (
    <div style={{
      height: '24px',
      background: '#1a1a1a',
      borderTop: '1px solid #444',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      fontSize: '11px',
      color: '#ccc',
    }}>
      <span>{statusMessage}</span>
      {errors.length > 0 && (
        <span style={{ marginLeft: '16px', color: '#f44336' }}>
          ⚠ {errors.length} error{errors.length > 1 ? 's' : ''}
        </span>
      )}
      {warnings.length > 0 && (
        <span style={{ marginLeft: '16px', color: '#ff9800' }}>
          ⚠ {warnings.length} warning{warnings.length > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
