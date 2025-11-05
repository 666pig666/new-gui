/**
 * MIDILearn.js
 * MIDI learn functionality for custom CC mapping
 */

export class MIDILearn {
  constructor(midiController, midiMapper) {
    this.midiController = midiController;
    this.midiMapper = midiMapper;

    this.isLearning = false;
    this.learningTarget = null;
    this.learnTimeout = null;
    this.learnTimeoutDuration = 10000; // 10 seconds

    // Custom mappings (overrides)
    this.customMappings = new Map();

    // Callbacks
    this.onLearnStartCallback = null;
    this.onLearnSuccessCallback = null;
    this.onLearnCancelCallback = null;
    this.onLearnTimeoutCallback = null;

    // Load saved custom mappings
    this.loadCustomMappings();
  }

  /**
   * Start MIDI learn mode for a specific parameter
   * @param {number} targetCC - The CC to remap
   * @param {string} parameterName - Name of the parameter being mapped
   */
  startLearning(targetCC, parameterName) {
    if (this.isLearning) {
      this.cancelLearning();
    }

    this.isLearning = true;
    this.learningTarget = { cc: targetCC, name: parameterName };

    console.log(`MIDI Learn: Waiting for CC input for "${parameterName}"...`);

    // Set timeout
    this.learnTimeout = setTimeout(() => {
      this.handleLearnTimeout();
    }, this.learnTimeoutDuration);

    // Notify callback
    if (this.onLearnStartCallback) {
      this.onLearnStartCallback({ targetCC, parameterName });
    }

    // Listen for the next CC message
    this.tempCCHandler = (data) => {
      this.handleLearnCC(data.cc);
    };

    this.midiController.onCC(this.tempCCHandler);
  }

  /**
   * Handle CC received during learn mode
   * @param {number} cc
   */
  handleLearnCC(cc) {
    if (!this.isLearning) return;

    // Check if CC is in valid range (35-98)
    if (cc < this.midiMapper.ccRange.min || cc > this.midiMapper.ccRange.max) {
      console.warn(`CC ${cc} is outside valid range (35-98)`);
      return;
    }

    // Create custom mapping
    const originalMapping = this.midiMapper.getMapping(this.learningTarget.cc);

    if (originalMapping) {
      this.customMappings.set(cc, {
        originalCC: this.learningTarget.cc,
        mapping: { ...originalMapping }
      });

      console.log(`MIDI Learn: Mapped CC ${cc} to "${this.learningTarget.name}"`);

      // Save to localStorage
      this.saveCustomMappings();

      // Notify success
      if (this.onLearnSuccessCallback) {
        this.onLearnSuccessCallback({
          learnedCC: cc,
          targetCC: this.learningTarget.cc,
          parameterName: this.learningTarget.name
        });
      }
    }

    // End learn mode
    this.endLearning();
  }

  /**
   * Cancel learning mode
   */
  cancelLearning() {
    if (!this.isLearning) return;

    console.log('MIDI Learn: Cancelled');

    if (this.onLearnCancelCallback) {
      this.onLearnCancelCallback();
    }

    this.endLearning();
  }

  /**
   * Handle learn timeout
   */
  handleLearnTimeout() {
    console.log('MIDI Learn: Timeout');

    if (this.onLearnTimeoutCallback) {
      this.onLearnTimeoutCallback();
    }

    this.endLearning();
  }

  /**
   * End learning mode
   */
  endLearning() {
    this.isLearning = false;
    this.learningTarget = null;

    if (this.learnTimeout) {
      clearTimeout(this.learnTimeout);
      this.learnTimeout = null;
    }

    // Remove temp handler
    if (this.tempCCHandler) {
      this.midiController.onCC(null);
      this.tempCCHandler = null;
    }
  }

  /**
   * Get custom mapping for a CC
   * @param {number} cc
   * @returns {object|null}
   */
  getCustomMapping(cc) {
    return this.customMappings.get(cc) ?? null;
  }

  /**
   * Get all custom mappings
   * @returns {array}
   */
  getAllCustomMappings() {
    const result = [];
    for (const [cc, data] of this.customMappings.entries()) {
      result.push({
        cc,
        originalCC: data.originalCC,
        name: data.mapping.name,
        target: data.mapping.target
      });
    }
    return result;
  }

  /**
   * Remove custom mapping for a CC
   * @param {number} cc
   */
  removeCustomMapping(cc) {
    if (this.customMappings.delete(cc)) {
      console.log(`Custom mapping for CC ${cc} removed`);
      this.saveCustomMappings();
      return true;
    }
    return false;
  }

  /**
   * Clear all custom mappings
   */
  clearAllCustomMappings() {
    this.customMappings.clear();
    this.saveCustomMappings();
    console.log('All custom MIDI mappings cleared');
  }

  /**
   * Check if a CC has a custom mapping
   * @param {number} cc
   * @returns {boolean}
   */
  hasCustomMapping(cc) {
    return this.customMappings.has(cc);
  }

  /**
   * Process incoming CC with custom mappings
   * @param {number} cc
   * @param {number} value
   */
  processCC(cc, value) {
    const customMapping = this.customMappings.get(cc);

    if (customMapping) {
      // Use custom mapping - route to original CC
      this.midiMapper.handleCC(customMapping.originalCC, value);
    } else {
      // Use default mapping
      this.midiMapper.handleCC(cc, value);
    }
  }

  /**
   * Save custom mappings to localStorage
   */
  saveCustomMappings() {
    try {
      const data = {};

      for (const [cc, mapping] of this.customMappings.entries()) {
        data[cc] = {
          originalCC: mapping.originalCC,
          mapping: mapping.mapping
        };
      }

      localStorage.setItem('midi-learn-custom-mappings', JSON.stringify(data));
      console.log('Custom MIDI mappings saved');
    } catch (error) {
      console.error('Failed to save custom mappings:', error);
    }
  }

  /**
   * Load custom mappings from localStorage
   */
  loadCustomMappings() {
    try {
      const dataString = localStorage.getItem('midi-learn-custom-mappings');
      if (!dataString) return;

      const data = JSON.parse(dataString);

      for (const [cc, mapping] of Object.entries(data)) {
        this.customMappings.set(parseInt(cc), mapping);
      }

      console.log(`Loaded ${this.customMappings.size} custom MIDI mappings`);
    } catch (error) {
      console.error('Failed to load custom mappings:', error);
    }
  }

  /**
   * Export custom mappings
   * @returns {object}
   */
  exportCustomMappings() {
    const data = {};
    for (const [cc, mapping] of this.customMappings.entries()) {
      data[cc] = mapping;
    }
    return data;
  }

  /**
   * Import custom mappings
   * @param {object} data
   */
  importCustomMappings(data) {
    try {
      this.customMappings.clear();

      for (const [cc, mapping] of Object.entries(data)) {
        this.customMappings.set(parseInt(cc), mapping);
      }

      this.saveCustomMappings();
      console.log('Custom MIDI mappings imported');
    } catch (error) {
      console.error('Failed to import custom mappings:', error);
    }
  }

  /**
   * Register callbacks
   */
  onLearnStart(callback) {
    this.onLearnStartCallback = callback;
  }

  onLearnSuccess(callback) {
    this.onLearnSuccessCallback = callback;
  }

  onLearnCancel(callback) {
    this.onLearnCancelCallback = callback;
  }

  onLearnTimeout(callback) {
    this.onLearnTimeoutCallback = callback;
  }
}
