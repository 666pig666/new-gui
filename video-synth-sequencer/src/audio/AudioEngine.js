/**
 * AudioEngine.js
 * Microphone input and audio analysis engine with low latency (<10ms)
 */

import { FrequencyAnalyzer } from './FrequencyAnalyzer.js';
import { BeatDetector } from './BeatDetector.js';

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.microphone = null;
    this.analyzer = null;
    this.frequencyAnalyzer = null;
    this.beatDetector = null;

    this.isEnabled = false;
    this.isRunning = false;

    // Audio processing
    this.source = null;
    this.gainNode = null;

    // Callbacks
    this.onPermissionGrantedCallback = null;
    this.onPermissionDeniedCallback = null;
    this.onErrorCallback = null;
    this.onAudioDataCallback = null;
  }

  /**
   * Request microphone permission and initialize audio context
   * @returns {Promise<boolean>}
   */
  async initialize() {
    try {
      // Create audio context with low latency settings
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive', // Low latency mode
        sampleRate: 48000 // High sample rate for quality
      });

      console.log(`Audio Context created: ${this.audioContext.sampleRate}Hz`);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          latency: 0
        },
        video: false
      });

      this.microphone = stream;
      this.isEnabled = true;

      console.log('Microphone access granted');

      // Create audio nodes
      this.setupAudioNodes(stream);

      // Create analyzers
      this.frequencyAnalyzer = new FrequencyAnalyzer(this.audioContext, this.analyzer);
      this.beatDetector = new BeatDetector();

      // Notify success
      if (this.onPermissionGrantedCallback) {
        this.onPermissionGrantedCallback();
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.isEnabled = false;

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        if (this.onPermissionDeniedCallback) {
          this.onPermissionDeniedCallback(error);
        }
      } else if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }

      return false;
    }
  }

  /**
   * Setup audio processing nodes
   * @param {MediaStream} stream
   */
  setupAudioNodes(stream) {
    // Create source from microphone
    this.source = this.audioContext.createMediaStreamSource(stream);

    // Create analyzer node
    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = 2048;
    this.analyzer.smoothingTimeConstant = 0.8;

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 1.0;

    // Connect nodes: source -> gain -> analyzer
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyzer);

    // Note: We don't connect to destination to avoid feedback
    console.log('Audio nodes configured');
  }

  /**
   * Start audio analysis
   */
  start() {
    if (!this.isEnabled) {
      console.warn('Audio engine not initialized');
      return false;
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isRunning = true;
    console.log('Audio analysis started');

    return true;
  }

  /**
   * Stop audio analysis
   */
  stop() {
    this.isRunning = false;
    console.log('Audio analysis stopped');
  }

  /**
   * Update audio analysis (call every frame)
   * @returns {object|null} Audio data
   */
  update() {
    if (!this.isRunning || !this.frequencyAnalyzer) {
      return null;
    }

    // Analyze frequencies
    this.frequencyAnalyzer.analyze();

    // Get levels
    const levels = this.frequencyAnalyzer.getAllLevels();

    // Detect beats
    const isBeat = this.beatDetector.analyze(levels);

    // Prepare audio data
    const audioData = {
      levels,
      smoothedLevels: this.frequencyAnalyzer.getAllSmoothedLevels(),
      beatDetector: this.beatDetector.getState(),
      isBeat,
      spectrum: this.frequencyAnalyzer.getSpectrumData()
    };

    // Notify callback
    if (this.onAudioDataCallback) {
      this.onAudioDataCallback(audioData);
    }

    return audioData;
  }

  /**
   * Get current audio levels
   * @returns {object}
   */
  getLevels() {
    return this.frequencyAnalyzer ? this.frequencyAnalyzer.getAllLevels() : null;
  }

  /**
   * Get smoothed audio levels
   * @returns {object}
   */
  getSmoothedLevels() {
    return this.frequencyAnalyzer ? this.frequencyAnalyzer.getAllSmoothedLevels() : null;
  }

  /**
   * Get beat detector state
   * @returns {object}
   */
  getBeatState() {
    return this.beatDetector ? this.beatDetector.getState() : null;
  }

  /**
   * Set beat detection sensitivity
   * @param {number} value - 0.1 to 2.0
   */
  setBeatSensitivity(value) {
    if (this.beatDetector) {
      this.beatDetector.setSensitivity(value);
    }
  }

  /**
   * Set FFT size for frequency analysis
   * @param {number} size - Power of 2 (256-32768)
   */
  setFFTSize(size) {
    if (this.frequencyAnalyzer) {
      this.frequencyAnalyzer.setFFTSize(size);
    }
  }

  /**
   * Set audio smoothing
   * @param {number} value - 0 to 1
   */
  setSmoothing(value) {
    if (this.frequencyAnalyzer) {
      this.frequencyAnalyzer.setSmoothing(value);
    }
  }

  /**
   * Set input gain/volume
   * @param {number} value - 0 to 2
   */
  setGain(value) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(2, value));
    }
  }

  /**
   * Get audio context latency info
   * @returns {object}
   */
  getLatencyInfo() {
    if (!this.audioContext) return null;

    return {
      baseLatency: this.audioContext.baseLatency ? (this.audioContext.baseLatency * 1000).toFixed(2) : 'N/A',
      outputLatency: this.audioContext.outputLatency ? (this.audioContext.outputLatency * 1000).toFixed(2) : 'N/A',
      sampleRate: this.audioContext.sampleRate,
      state: this.audioContext.state
    };
  }

  /**
   * Check if audio engine is ready
   * @returns {boolean}
   */
  isReady() {
    return this.isEnabled && this.audioContext !== null;
  }

  /**
   * Register callbacks
   */
  onPermissionGranted(callback) {
    this.onPermissionGrantedCallback = callback;
  }

  onPermissionDenied(callback) {
    this.onPermissionDeniedCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }

  onAudioData(callback) {
    this.onAudioDataCallback = callback;
  }

  /**
   * Register beat detection callbacks
   */
  onBeat(callback) {
    if (this.beatDetector) {
      this.beatDetector.onBeat(callback);
    }
  }

  onKick(callback) {
    if (this.beatDetector) {
      this.beatDetector.onKick(callback);
    }
  }

  onSnare(callback) {
    if (this.beatDetector) {
      this.beatDetector.onSnare(callback);
    }
  }

  onHiHat(callback) {
    if (this.beatDetector) {
      this.beatDetector.onHiHat(callback);
    }
  }

  /**
   * Disconnect and cleanup
   */
  dispose() {
    this.stop();

    // Disconnect audio nodes
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.analyzer) {
      this.analyzer.disconnect();
      this.analyzer = null;
    }

    // Stop microphone tracks
    if (this.microphone) {
      this.microphone.getTracks().forEach(track => track.stop());
      this.microphone = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Cleanup analyzers
    if (this.frequencyAnalyzer) {
      this.frequencyAnalyzer.dispose();
      this.frequencyAnalyzer = null;
    }

    if (this.beatDetector) {
      this.beatDetector.reset();
      this.beatDetector = null;
    }

    this.isEnabled = false;
    this.isRunning = false;

    console.log('Audio engine disposed');
  }

  /**
   * Get debug info
   * @returns {object}
   */
  getDebugInfo() {
    return {
      isEnabled: this.isEnabled,
      isRunning: this.isRunning,
      audioContext: this.audioContext ? this.audioContext.state : 'null',
      latency: this.getLatencyInfo(),
      beatStats: this.beatDetector ? this.beatDetector.getStatistics() : null
    };
  }
}
