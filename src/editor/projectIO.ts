/**
 * Project I/O - save/load projects
 */

import { Project } from '../engine/project';
import { Graph } from '../scripting/graph/graphTypes';
import { serializeGraph } from '../scripting/graph/serializer';

export class ProjectIO {
  /**
   * Save project to JSON
   */
  static saveProject(project: Project): string {
    const data = project.serialize();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Load project from JSON
   */
  static loadProject(json: string): Project {
    const data = JSON.parse(json);
    const project = new Project('Loaded Project');
    project.deserialize(data);
    return project;
  }

  /**
   * Export build (creates playable game bundle)
   */
  static exportBuild(project: Project, graphs: Graph[]): {
    html: string;
    js: string;
    assets: Record<string, string>;
  } {
    // Serialize project and graphs
    const projectData = project.serialize();
    const graphsData = graphs.map(g => serializeGraph(g));

    // Generate HTML
    const html = this.generateHTML();
    
    // Generate JS bundle
    const js = this.generateJSBundle(projectData, graphsData);

    // Assets would be included here
    const assets: Record<string, string> = {};

    return { html, js, assets };
  }

  /**
   * Generate HTML for exported build
   */
  private static generateHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verto Game</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #000;
    }
    #game-canvas {
      display: block;
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <canvas id="game-canvas"></canvas>
  <script type="module" src="game.js"></script>
</body>
</html>`;
  }

  /**
   * Generate JS bundle for exported build
   */
  private static generateJSBundle(projectData: unknown, graphsData: unknown[]): string {
    // In a real implementation, this would bundle the engine code
    // For now, return a placeholder
    return `
// Verto Engine Web - Exported Game
// Project data and graphs would be embedded here
const projectData = ${JSON.stringify(projectData)};
const graphsData = ${JSON.stringify(graphsData)};

// Game initialization code would go here
console.log('Game loaded');
`;
  }

  /**
   * Download file
   */
  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Download as ZIP (client-side zip generation)
   */
  static async downloadBuild(build: { html: string; js: string; assets: Record<string, string> }): Promise<void> {
    // In a real implementation, would use a library like JSZip
    // For now, just download files separately
    this.downloadFile(build.html, 'index.html', 'text/html');
    this.downloadFile(build.js, 'game.js', 'application/javascript');
    
    // Note: Assets would need to be downloaded separately or bundled
    console.log('Build exported. Assets:', Object.keys(build.assets));
  }
}
