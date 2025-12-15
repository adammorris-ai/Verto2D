import React from 'react';
import { useEditorStore } from '../editor/appStore';
import { ProjectIO } from '../editor/projectIO';

export default function Toolbar() {
  const { isRunning, setRunning, project, setStatus, beginnerMode, setBeginnerMode } = useEditorStore();

  const handleRun = () => {
    setRunning(true);
    setStatus('Running...');
  };

  const handleStop = () => {
    setRunning(false);
    setStatus('Stopped');
  };

  const handleSave = () => {
    if (!project) {
      setStatus('No project to save');
      return;
    }
    const json = ProjectIO.saveProject(project);
    ProjectIO.downloadFile(json, 'project.json', 'application/json');
    setStatus('Project saved');
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        file.text().then(text => {
          try {
            const loadedProject = ProjectIO.loadProject(text);
            useEditorStore.getState().setProject(loadedProject);
            setStatus('Project loaded');
          } catch (error) {
            setStatus(`Error loading project: ${error}`);
          }
        });
      }
    };
    input.click();
  };

  const handleExport = async () => {
    if (!project) {
      setStatus('No project to export');
      return;
    }
    const graphs: any[] = []; // Would get from editor state
    const build = ProjectIO.exportBuild(project, graphs);
    await ProjectIO.downloadBuild(build);
    setStatus('Build exported');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      background: '#2d2d2d',
      borderBottom: '1px solid #444',
    }}>
      <button
        onClick={isRunning ? handleStop : handleRun}
        style={{
          padding: '6px 12px',
          background: isRunning ? '#d32f2f' : '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {isRunning ? '⏹ Stop' : '▶ Run'}
      </button>

      <div style={{ width: '1px', height: '20px', background: '#444' }} />

      <button onClick={handleSave} style={buttonStyle}>
        💾 Save
      </button>
      <button onClick={handleLoad} style={buttonStyle}>
        📁 Load
      </button>
      <button onClick={handleExport} style={buttonStyle}>
        📦 Export Build
      </button>

      <div style={{ flex: 1 }} />

      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ccc', fontSize: '12px' }}>
        <input
          type="checkbox"
          checked={beginnerMode}
          onChange={(e) => setBeginnerMode(e.target.checked)}
        />
        Beginner Mode
      </label>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#3d3d3d',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};
