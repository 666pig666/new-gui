/**
 * BeatDetector.js
 * Transient/beat detection with adjustable sensitivity
 */

export class BeatDetector {
  constructor() {
    this.sensitivity = 1.0;
    this.threshold = 0.3;
    this.minTimeBetweenBeats = 100; // ms
    this.lastBeatTime = 0;

    this.isKick = false;
    this.isSnare = false;
    this.isHiHat = false;

    // Energy history for beat detection
    this.energyHistory = [];
    this.historySize = 43; // ~1 second at 60fps
    this.energyAverage = 0;
    this.energyVariance = 0;

    // Specific frequency ranges for different drum elements
    this.kickRange = { min: 60, max: 120 };      // Kick drum
    this.snareRange = { min: 150, max: 250 };    // Snare
    this.hiHatRange = { min: 5000, max: 10000 }; // Hi-hat

    // Beat callbacks
    this.onBeatCallback = null;
    this.onKickCallback = null;
    this.onSnareCallback = null;
    this.onHiHatCallback = null;
  }

  /**
   * Analyze audio levels and detect beats
   * @param {object} levels - Frequency levels from FrequencyAnalyzer
   */
  analyze(levels) {
    const currentTime = performance.now();

    // Use bass and low-mid for overall beat detection
    const energy = levels.bass * 0.7 + levels.lowMid * 0.3;

    // Add to history
    this.energyHistory.push(energy);

    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift();
    }

    // Calculate average and variance
    this.calculateStatistics();

    // Detect beat using adaptive threshold
    const isBeat = this.detectBeat(energy, currentTime);

    // Detect specific drum elements
    this.isKick = this.detectKick(levels, currentTime);
    this.isSnare = this.detectSnare(levels, currentTime);
    this.isHiHat = this.detectHiHat(levels, currentTime);

    // Trigger callbacks
    if (isBeat && this.onBeatCallback) {
      this.onBeatCallback({
        energy,
        confidence: this.calculateConfidence(energy),
        timestamp: currentTime
      });
    }

    if (this.isKick && this.onKickCallback) {
      this.onKickCallback({ timestamp: currentTime });
    }

    if (this.isSnare && this.onSnareCallback) {
      this.onSnareCallback({ timestamp: currentTime });
    }

    if (this.isHiHat && this.onHiHatCallback) {
      this.onHiHatCallback({ timestamp: currentTime });
    }

    return isBeat;
  }

  /**
   * Calculate energy statistics
   */
  calculateStatistics() {
    if (this.energyHistory.length === 0) return;

    // Calculate average
    const sum = this.energyHistory.reduce((acc, val) => acc + val, 0);
    this.energyAverage = sum / this.energyHistory.length;

    // Calculate variance
    const squaredDiffs = this.energyHistory.map(val => {
      const diff = val - this.energyAverage;
      return diff * diff;
    });

    const varianceSum = squaredDiffs.reduce((acc, val) => acc + val, 0);
    this.energyVariance = Math.sqrt(varianceSum / this.energyHistory.length);
  }

  /**
   * Detect beat using adaptive threshold
   * @param {number} energy
   * @param {number} currentTime
   * @returns {boolean}
   */
  detectBeat(energy, currentTime) {
    // Check minimum time between beats
    if (currentTime - this.lastBeatTime < this.minTimeBetweenBeats) {
      return false;
    }

    // Adaptive threshold based on variance and sensitivity
    const adaptiveThreshold = this.energyAverage + (this.energyVariance * this.sensitivity * 1.5);

    // Beat detected if energy exceeds threshold
    if (energy > adaptiveThreshold && energy > this.threshold) {
      this.lastBeatTime = currentTime;
      return true;
    }

    return false;
  }

  /**
   * Detect kick drum
   * @param {object} levels
   * @param {number} currentTime
   * @returns {boolean}
   */
  detectKick(levels, currentTime) {
    const kickEnergy = levels.bass + levels.subBass * 0.5;
    const kickThreshold = 0.4 * this.sensitivity;

    return kickEnergy > kickThreshold &&
           levels.bass > levels.mid * 1.2;
  }

  /**
   * Detect snare drum
   * @param {object} levels
   * @param {number} currentTime
   * @returns {boolean}
   */
  detectSnare(levels, currentTime) {
    const snareEnergy = levels.lowMid + levels.mid * 0.5;
    const snareThreshold = 0.35 * this.sensitivity;

    return snareEnergy > snareThreshold &&
           levels.mid > levels.bass * 0.8;
  }

  /**
   * Detect hi-hat
   * @param {object} levels
   * @param {number} currentTime
   * @returns {boolean}
   */
  detectHiHat(levels, currentTime) {
    const hiHatEnergy = levels.presence + levels.air * 0.5;
    const hiHatThreshold = 0.25 * this.sensitivity;

    return hiHatEnergy > hiHatThreshold &&
           levels.presence > levels.mid * 0.5;
  }

  /**
   * Calculate beat confidence (0-1)
   * @param {number} energy
   * @returns {number}
   */
  calculateConfidence(energy) {
    if (this.energyAverage === 0) return 0;

    const ratio = energy / this.energyAverage;
    return Math.min(1, Math.max(0, (ratio - 1) / 2));
  }

  /**
   * Set beat detection sensitivity
   * @param {number} value - 0.1 to 2.0
   */
  setSensitivity(value) {
    this.sensitivity = Math.max(0.1, Math.min(2.0, value));
    console.log(`Beat detection sensitivity set to ${this.sensitivity}`);
  }

  /**
   * Set base threshold
   * @param {number} value - 0 to 1
   */
  setThreshold(value) {
    this.threshold = Math.max(0, Math.min(1, value));
  }

  /**
   * Set minimum time between beats
   * @param {number} ms - Milliseconds
   */
  setMinTimeBetweenBeats(ms) {
    this.minTimeBetweenBeats = Math.max(50, ms);
  }

  /**
   * Get current beat detection state
   * @returns {object}
   */
  getState() {
    return {
      isKick: this.isKick,
      isSnare: this.isSnare,
      isHiHat: this.isHiHat,
      energyAverage: this.energyAverage,
      energyVariance: this.energyVariance,
      sensitivity: this.sensitivity
    };
  }

  /**
   * Check if any beat is detected
   * @returns {boolean}
   */
  isBeatDetected() {
    return this.isKick || this.isSnare || this.isHiHat;
  }

  /**
   * Reset beat detector state
   */
  reset() {
    this.energyHistory = [];
    this.energyAverage = 0;
    this.energyVariance = 0;
    this.lastBeatTime = 0;
    this.isKick = false;
    this.isSnare = false;
    this.isHiHat = false;
  }

  /**
   * Register callbacks
   */
  onBeat(callback) {
    this.onBeatCallback = callback;
  }

  onKick(callback) {
    this.onKickCallback = callback;
  }

  onSnare(callback) {
    this.onSnareCallback = callback;
  }

  onHiHat(callback) {
    this.onHiHatCallback = callback;
  }

  /**
   * Get beat statistics for debugging
   * @returns {object}
   */
  getStatistics() {
    return {
      historySize: this.energyHistory.length,
      energyAverage: this.energyAverage.toFixed(3),
      energyVariance: this.energyVariance.toFixed(3),
      threshold: this.threshold,
      sensitivity: this.sensitivity,
      minTimeBetweenBeats: this.minTimeBetweenBeats
    };
  }
}
