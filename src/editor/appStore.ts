/**
 * Editor state management using Zustand
 */

import { create } from 'zustand';
import { Graph } from '../scripting/graph/graphTypes';
import { Entity } from '../ecs/entity';
import { Project } from '../engine/project';
import { Scene } from '../engine/scene';

export interface EditorState {
  // Project state
  project: Project | null;
  currentScene: Scene | null;
  
  // Graph editing
  currentGraph: Graph | null;
  selectedNode: string | null;
  selectedEntity: Entity | null;
  
  // UI state
  beginnerMode: boolean;
  viewMode: 'canvas' | 'viewport' | 'split';
  showAssetPanel: boolean;
  showScenePanel: boolean;
  
  // Runtime state
  isRunning: boolean;
  
  // Status
  statusMessage: string;
  errors: string[];
  warnings: string[];
  
  // Actions
  setProject: (project: Project) => void;
  setCurrentScene: (scene: Scene) => void;
  setCurrentGraph: (graph: Graph) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEntity: (entity: Entity | null) => void;
  setBeginnerMode: (enabled: boolean) => void;
  setViewMode: (mode: 'canvas' | 'viewport' | 'split') => void;
  setRunning: (running: boolean) => void;
  setStatus: (message: string) => void;
  addError: (error: string) => void;
  addWarning: (warning: string) => void;
  clearErrors: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  project: null,
  currentScene: null,
  currentGraph: null,
  selectedNode: null,
  selectedEntity: null,
  beginnerMode: true,
  viewMode: 'split',
  showAssetPanel: true,
  showScenePanel: true,
  isRunning: false,
  statusMessage: 'Ready',
  errors: [],
  warnings: [],

  setProject: (project) => set({ project }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setCurrentGraph: (graph) => set({ currentGraph: graph }),
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  setBeginnerMode: (enabled) => set({ beginnerMode: enabled }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setRunning: (running) => set({ isRunning: running }),
  setStatus: (message) => set({ statusMessage: message }),
  addError: (error) => set((state) => ({ errors: [...state.errors, error] })),
  addWarning: (warning) => set((state) => ({ warnings: [...state.warnings, warning] })),
  clearErrors: () => set({ errors: [], warnings: [] }),
}));
