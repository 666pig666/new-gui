/**
 * StateManager.js
 * Save and load application state to/from localStorage
 */

export class StateManager {
  constructor() {
    this.storageKey = 'video-synth-sequencer-state';
    this.presetPrefix = 'vss-preset-';
    this.maxHistorySize = 10;
    this.history = [];
    this.currentHistoryIndex = -1;
  }

  /**
   * Save current application state
   * @param {object} state - Application state object
   * @returns {boolean} - Success status
   */
  saveState(state) {
    try {
      const stateString = JSON.stringify(state);
      localStorage.setItem(this.storageKey, stateString);

      // Add to history
      this.addToHistory(state);

      console.log('State saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save state:', error);
      return false;
    }
  }

  /**
   * Load application state
   * @returns {object|null} - Loaded state or null if not found
   */
  loadState() {
    try {
      const stateString = localStorage.getItem(this.storageKey);
      if (!stateString) {
        console.log('No saved state found');
        return null;
      }

      const state = JSON.parse(stateString);
      console.log('State loaded successfully');
      return state;
    } catch (error) {
      console.error('Failed to load state:', error);
      return null;
    }
  }

  /**
   * Save preset with custom name
   * @param {string} name - Preset name
   * @param {object} state - State to save
   * @returns {boolean}
   */
  savePreset(name, state) {
    try {
      const key = this.presetPrefix + name;
      const preset = {
        name,
        timestamp: Date.now(),
        state
      };
      localStorage.setItem(key, JSON.stringify(preset));
      console.log(`Preset "${name}" saved successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to save preset "${name}":`, error);
      return false;
    }
  }

  /**
   * Load preset by name
   * @param {string} name - Preset name
   * @returns {object|null}
   */
  loadPreset(name) {
    try {
      const key = this.presetPrefix + name;
      const presetString = localStorage.getItem(key);

      if (!presetString) {
        console.log(`Preset "${name}" not found`);
        return null;
      }

      const preset = JSON.parse(presetString);
      console.log(`Preset "${name}" loaded successfully`);
      return preset.state;
    } catch (error) {
      console.error(`Failed to load preset "${name}":`, error);
      return null;
    }
  }

  /**
   * Get list of all saved presets
   * @returns {array}
   */
  listPresets() {
    const presets = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(this.presetPrefix)) {
        try {
          const presetString = localStorage.getItem(key);
          const preset = JSON.parse(presetString);
          presets.push({
            name: preset.name,
            timestamp: preset.timestamp,
            date: new Date(preset.timestamp).toLocaleString()
          });
        } catch (error) {
          console.warn(`Failed to parse preset ${key}:`, error);
        }
      }
    }

    return presets.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Delete preset by name
   * @param {string} name
   * @returns {boolean}
   */
  deletePreset(name) {
    try {
      const key = this.presetPrefix + name;
      localStorage.removeItem(key);
      console.log(`Preset "${name}" deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to delete preset "${name}":`, error);
      return false;
    }
  }

  /**
   * Save quick preset to slot (1-9)
   * @param {number} slot - Slot number (1-9)
   * @param {object} state
   * @returns {boolean}
   */
  saveQuickPreset(slot, state) {
    if (slot < 1 || slot > 9) {
      console.error('Quick preset slot must be between 1 and 9');
      return false;
    }

    return this.savePreset(`quick-${slot}`, state);
  }

  /**
   * Load quick preset from slot (1-9)
   * @param {number} slot
   * @returns {object|null}
   */
  loadQuickPreset(slot) {
    if (slot < 1 || slot > 9) {
      console.error('Quick preset slot must be between 1 and 9');
      return null;
    }

    return this.loadPreset(`quick-${slot}`);
  }

  /**
   * Add state to history
   * @param {object} state
   */
  addToHistory(state) {
    // Remove any states after current index
    this.history = this.history.slice(0, this.currentHistoryIndex + 1);

    // Add new state
    this.history.push(JSON.parse(JSON.stringify(state))); // Deep clone

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentHistoryIndex++;
    }
  }

  /**
   * Undo to previous state
   * @returns {object|null}
   */
  undo() {
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
      return JSON.parse(JSON.stringify(this.history[this.currentHistoryIndex]));
    }
    return null;
  }

  /**
   * Redo to next state
   * @returns {object|null}
   */
  redo() {
    if (this.currentHistoryIndex < this.history.length - 1) {
      this.currentHistoryIndex++;
      return JSON.parse(JSON.stringify(this.history[this.currentHistoryIndex]));
    }
    return null;
  }

  /**
   * Export state as JSON file
   * @param {object} state
   * @param {string} filename
   */
  exportState(state, filename = 'video-synth-preset.json') {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
      console.log(`State exported as ${filename}`);
    } catch (error) {
      console.error('Failed to export state:', error);
    }
  }

  /**
   * Import state from JSON file
   * @param {File} file
   * @returns {Promise<object|null>}
   */
  async importState(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const state = JSON.parse(e.target.result);
          console.log('State imported successfully');
          resolve(state);
        } catch (error) {
          console.error('Failed to parse imported state:', error);
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('Failed to read file:', error);
        reject(error);
      };

      reader.readAsText(file);
    });
  }

  /**
   * Clear all saved data
   * @returns {boolean}
   */
  clearAll() {
    try {
      // Clear main state
      localStorage.removeItem(this.storageKey);

      // Clear all presets
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.presetPrefix)) {
          keys.push(key);
        }
      }

      keys.forEach(key => localStorage.removeItem(key));

      // Clear history
      this.history = [];
      this.currentHistoryIndex = -1;

      console.log('All state data cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear state data:', error);
      return false;
    }
  }

  /**
   * Get storage usage info
   * @returns {object}
   */
  getStorageInfo() {
    try {
      let totalSize = 0;
      let presetCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          totalSize += key.length + (value ? value.length : 0);

          if (key.startsWith(this.presetPrefix)) {
            presetCount++;
          }
        }
      }

      return {
        totalSize: Math.round(totalSize / 1024), // KB
        presetCount,
        hasMainState: localStorage.getItem(this.storageKey) !== null,
        historySize: this.history.length
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }
}
