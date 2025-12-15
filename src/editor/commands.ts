/**
 * Command system for undo/redo
 */

export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

export class CommandHistory {
  private history: Command[] = [];
  private currentIndex = -1;
  private maxHistory = 50;

  /**
   * Execute command and add to history
   */
  execute(command: Command): void {
    command.execute();
    
    // Remove any commands after current index (when undoing and then doing new action)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new command
    this.history.push(command);
    this.currentIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo last command
   */
  undo(): boolean {
    if (this.currentIndex < 0) {
      return false;
    }

    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;
    return true;
  }

  /**
   * Redo last undone command
   */
  redo(): boolean {
    if (this.currentIndex >= this.history.length - 1) {
      return false;
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.execute();
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get current command description
   */
  getUndoDescription(): string | null {
    if (this.currentIndex < 0) {
      return null;
    }
    return this.history[this.currentIndex].description;
  }

  /**
   * Get redo command description
   */
  getRedoDescription(): string | null {
    if (this.currentIndex >= this.history.length - 1) {
      return null;
    }
    return this.history[this.currentIndex + 1].description;
  }
}
