/**
 * FrequencyAnalyzer.js
 * 8-band frequency analysis (sub-bass, bass, low-mid, mid, high-mid, treble, presence, air)
 */

export class FrequencyAnalyzer {
  constructor(audioContext, analyzerNode) {
    this.audioContext = audioContext;
    this.analyzer = analyzerNode;

    // Configure analyzer
    this.analyzer.fftSize = 2048;
    this.analyzer.smoothingTimeConstant = 0.8;

    this.frequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
    this.sampleRate = this.audioContext.sampleRate;

    // Define 8 frequency bands (Hz ranges)
    this.bands = {
      subBass: { min: 20, max: 60, level: 0, peak: 0 },      // Sub-bass
      bass: { min: 60, max: 250, level: 0, peak: 0 },        // Bass
      lowMid: { min: 250, max: 500, level: 0, peak: 0 },     // Low-mid
      mid: { min: 500, max: 2000, level: 0, peak: 0 },       // Mid
      highMid: { min: 2000, max: 4000, level: 0, peak: 0 },  // High-mid
      treble: { min: 4000, max: 6000, level: 0, peak: 0 },   // Treble
      presence: { min: 6000, max: 10000, level: 0, peak: 0 },// Presence
      air: { min: 10000, max: 20000, level: 0, peak: 0 }     // Air
    };

    // RMS and overall levels
    this.rmsLevel = 0;
    this.peakLevel = 0;
    this.overallLevel = 0;

    // Peak hold timing
    this.peakHoldTime = 1000; // ms
    this.peakHoldTimers = {};

    // History for smoothing
    this.history = {
      subBass: [],
      bass: [],
      lowMid: [],
      mid: [],
      highMid: [],
      treble: [],
      presence: [],
      air: []
    };
    this.historySize = 5;

    // Calculate bin indices for each band
    this.calculateBandIndices();
  }

  /**
   * Calculate frequency bin indices for each band
   */
  calculateBandIndices() {
    const nyquist = this.sampleRate / 2;
    const binCount = this.analyzer.frequencyBinCount;

    for (const [name, band] of Object.entries(this.bands)) {
      band.startBin = Math.floor((band.min / nyquist) * binCount);
      band.endBin = Math.floor((band.max / nyquist) * binCount);
    }
  }

  /**
   * Analyze audio and update frequency bands
   */
  analyze() {
    // Get frequency data
    this.analyzer.getByteFrequencyData(this.frequencyData);

    // Analyze each band
    for (const [name, band] of Object.entries(this.bands)) {
      const level = this.getAverageLevelInRange(band.startBin, band.endBin);
      band.level = level;

      // Update peak with hold
      if (level > band.peak) {
        band.peak = level;

        // Reset peak hold timer
        if (this.peakHoldTimers[name]) {
          clearTimeout(this.peakHoldTimers[name]);
        }

        this.peakHoldTimers[name] = setTimeout(() => {
          band.peak = band.level;
        }, this.peakHoldTime);
      }

      // Add to history for smoothing
      if (!this.history[name]) {
        this.history[name] = [];
      }

      this.history[name].push(level);

      if (this.history[name].length > this.historySize) {
        this.history[name].shift();
      }
    }

    // Calculate RMS
    this.rmsLevel = this.calculateRMS();

    // Calculate peak
    this.peakLevel = Math.max(...this.frequencyData) / 255;

    // Calculate overall level (average of all bands)
    this.overallLevel = this.calculateOverallLevel();
  }

  /**
   * Get average level in frequency bin range
   * @param {number} startBin
   * @param {number} endBin
   * @returns {number} Normalized level (0-1)
   */
  getAverageLevelInRange(startBin, endBin) {
    if (startBin >= endBin || startBin >= this.frequencyData.length) {
      return 0;
    }

    let sum = 0;
    let count = 0;

    for (let i = startBin; i < endBin && i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
      count++;
    }

    return count > 0 ? (sum / count) / 255 : 0;
  }

  /**
   * Calculate RMS level
   * @returns {number}
   */
  calculateRMS() {
    let sum = 0;

    for (let i = 0; i < this.frequencyData.length; i++) {
      const normalized = this.frequencyData[i] / 255;
      sum += normalized * normalized;
    }

    return Math.sqrt(sum / this.frequencyData.length);
  }

  /**
   * Calculate overall level (average of all bands)
   * @returns {number}
   */
  calculateOverallLevel() {
    const bandNames = Object.keys(this.bands);
    const sum = bandNames.reduce((acc, name) => acc + this.bands[name].level, 0);
    return sum / bandNames.length;
  }

  /**
   * Get smoothed level for a band
   * @param {string} bandName
   * @returns {number}
   */
  getSmoothedLevel(bandName) {
    const history = this.history[bandName];

    if (!history || history.length === 0) {
      return 0;
    }

    const sum = history.reduce((acc, val) => acc + val, 0);
    return sum / history.length;
  }

  /**
   * Get band level by name
   * @param {string} bandName
   * @returns {number}
   */
  getBandLevel(bandName) {
    return this.bands[bandName]?.level ?? 0;
  }

  /**
   * Get all band levels
   * @returns {object}
   */
  getAllLevels() {
    return {
      subBass: this.bands.subBass.level,
      bass: this.bands.bass.level,
      lowMid: this.bands.lowMid.level,
      mid: this.bands.mid.level,
      highMid: this.bands.highMid.level,
      treble: this.bands.treble.level,
      presence: this.bands.presence.level,
      air: this.bands.air.level,
      rms: this.rmsLevel,
      peak: this.peakLevel,
      overall: this.overallLevel
    };
  }

  /**
   * Get all smoothed levels
   * @returns {object}
   */
  getAllSmoothedLevels() {
    return {
      subBass: this.getSmoothedLevel('subBass'),
      bass: this.getSmoothedLevel('bass'),
      lowMid: this.getSmoothedLevel('lowMid'),
      mid: this.getSmoothedLevel('mid'),
      highMid: this.getSmoothedLevel('highMid'),
      treble: this.getSmoothedLevel('treble'),
      presence: this.getSmoothedLevel('presence'),
      air: this.getSmoothedLevel('air'),
      rms: this.rmsLevel,
      peak: this.peakLevel,
      overall: this.overallLevel
    };
  }

  /**
   * Set FFT size
   * @param {number} size - Must be power of 2 (256-32768)
   */
  setFFTSize(size) {
    const validSizes = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768];

    if (!validSizes.includes(size)) {
      console.warn(`Invalid FFT size: ${size}. Using 2048.`);
      size = 2048;
    }

    this.analyzer.fftSize = size;
    this.frequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
    this.calculateBandIndices();

    console.log(`FFT size set to ${size}`);
  }

  /**
   * Set smoothing time constant
   * @param {number} value - 0 to 1
   */
  setSmoothing(value) {
    this.analyzer.smoothingTimeConstant = Math.max(0, Math.min(1, value));
  }

  /**
   * Reset all peak values
   */
  resetPeaks() {
    for (const band of Object.values(this.bands)) {
      band.peak = band.level;
    }

    // Clear peak hold timers
    for (const timer of Object.values(this.peakHoldTimers)) {
      clearTimeout(timer);
    }
    this.peakHoldTimers = {};
  }

  /**
   * Get frequency spectrum data (for visualization)
   * @returns {Uint8Array}
   */
  getSpectrumData() {
    return this.frequencyData;
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    // Clear peak hold timers
    for (const timer of Object.values(this.peakHoldTimers)) {
      clearTimeout(timer);
    }
    this.peakHoldTimers = {};

    // Clear history
    for (const key in this.history) {
      this.history[key] = [];
    }
  }
}
