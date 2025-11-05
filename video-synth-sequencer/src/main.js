/**
 * main.js
 * Main application entry point
 * Initializes and coordinates all systems
 */

import * as THREE from 'three';
import { VideoManager } from './video/VideoManager.js';
import { AudioEngine } from './audio/AudioEngine.js';
import { MIDIController } from './midi/MIDIController.js';
import { MIDIMapper } from './midi/MIDIMapper.js';
import { MIDILearn } from './midi/MIDILearn.js';
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';
import { StateManager } from './utils/StateManager.js';
import { OptimizationUtils } from './utils/OptimizationUtils.js';

class VideoSynthSequencer {
  constructor() {
    // Core systems
    this.videoManager = new VideoManager();
    this.audioEngine = new AudioEngine();
    this.midiController = new MIDIController();
    this.midiMapper = new MIDIMapper();
    this.midiLearn = new MIDILearn(this.midiController, this.midiMapper);
    this.performanceMonitor = new PerformanceMonitor();
    this.stateManager = new StateManager();

    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.videoMesh = null;
    this.videoTexture = null;
    this.particleSystem = null;

    // State
    this.isInitialized = false;
    this.guiVisible = true;
    this.midiMapVisible = false;

    // Effect parameters (controlled by MIDI CC 35-98)
    this.params = this.initializeParameters();

    // Animation
    this.clock = new THREE.Clock();
    this.animationId = null;

    // Initialize
    this.init();
  }

  /**
   * Initialize all parameters with default values
   */
  initializeParameters() {
    return {
      // Video (CC 35-45)
      videoPlaybackRate: 1.0,
      videoOpacity: 1.0,
      videoSaturation: 1.0,
      videoHueShift: 0,
      videoBrightness: 0,
      videoContrast: 1.0,
      videoBlur: 0,
      videoChromaticAberration: 0,
      videoScale: 1.0,
      videoRotationSpeed: 0,
      videoKaleidoscope: 1,

      // Particles (CC 46-57)
      particleCount: 1000,
      particleSize: 2.0,
      particleSpeed: 1.0,
      particleSpread: 20,
      particleLifetime: 3.0,
      particleGravity: 0,
      particleTurbulence: 0,
      particleTrailLength: 0,
      particleAudioReactivity: 0.5,
      particleColorHue: 200,
      particleOpacity: 0.8,
      particleEmissionRate: 50,

      // Camera (CC 81-90)
      cameraFOV: 75,
      cameraPositionX: 0,
      cameraPositionY: 0,
      cameraPositionZ: 30,
      cameraRotationSpeed: 0,
      cameraShake: 0,
      bgColorHue: 220,
      bgBrightness: 0.1,
      fogDensity: 0,
      fogColorHue: 200,

      // Audio Modulation (CC 91-98)
      bassToParticleSize: 0,
      midToColorShift: 0,
      trebleToBloom: 0,
      kickToFlash: 0,
      overallToScale: 0,
      audioSmoothing: 0.8,
      beatSensitivity: 1.0,
      globalAudioIntensity: 1.0
    };
  }

  /**
   * Initialize application
   */
  async init() {
    console.log('🎵 Initializing Video Synth Sequencer...');

    // Check for Apple Silicon
    const isAppleSilicon = OptimizationUtils.isAppleSilicon();
    console.log(`Platform: ${isAppleSilicon ? 'Apple Silicon' : 'Standard'}`);

    // Setup Three.js
    this.setupThreeJS();

    // Setup UI
    this.setupUI();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Setup MIDI callbacks
    this.setupMIDICallbacks();

    // Setup video callbacks
    this.setupVideoCallbacks();

    // Start performance monitoring
    this.performanceMonitor.start();

    // Start animation loop
    this.animate();

    this.isInitialized = true;
    console.log('✅ Initialization complete');
  }

  /**
   * Setup Three.js scene, camera, renderer
   */
  setupThreeJS() {
    const container = document.getElementById('canvas-container');

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a14);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 30;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Apply optimizations
    OptimizationUtils.configureRenderer(this.renderer);

    container.appendChild(this.renderer.domElement);

    // Create video plane
    this.createVideoPlane();

    // Create basic particle system
    this.createParticleSystem();

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4a9eff, 1, 100);
    pointLight.position.set(10, 10, 10);
    this.scene.add(pointLight);

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

    console.log('✅ Three.js initialized');
  }

  /**
   * Create video display plane
   */
  createVideoPlane() {
    const geometry = new THREE.PlaneGeometry(16, 9);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0
    });

    this.videoMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.videoMesh);
  }

  /**
   * Update video texture
   */
  updateVideoTexture() {
    const videoElement = this.videoManager.getCurrentVideoElement();

    if (videoElement) {
      if (!this.videoTexture || this.videoTexture.image !== videoElement) {
        // Create new video texture
        this.videoTexture = new THREE.VideoTexture(videoElement);
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;

        this.videoMesh.material.map = this.videoTexture;
        this.videoMesh.material.needsUpdate = true;
      }
    }
  }

  /**
   * Create particle system
   */
  createParticleSystem() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();

      sizes[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  /**
   * Setup UI event listeners
   */
  setupUI() {
    // MIDI Permission
    document.getElementById('midi-permission-btn').addEventListener('click', () => {
      this.requestMIDIPermission();
    });

    // Audio Permission
    document.getElementById('audio-permission-btn').addEventListener('click', () => {
      this.requestAudioPermission();
    });

    // Video upload via drop zone
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('video-upload');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');

      const files = Array.from(e.dataTransfer.files).filter(f =>
        f.type.includes('video')
      );

      files.forEach(file => this.handleVideoUpload(file));
    });

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => this.handleVideoUpload(file));
      fileInput.value = ''; // Reset input
    });

    // Playback controls
    document.getElementById('play-pause-btn').addEventListener('click', () => {
      this.videoManager.togglePlayPause();
    });

    document.getElementById('next-video-btn').addEventListener('click', () => {
      this.videoManager.nextVideo();
    });

    document.getElementById('prev-video-btn').addEventListener('click', () => {
      this.videoManager.previousVideo();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      this.resetAllEffects();
    });

    // Setup audio level meters
    this.setupAudioMeters();

    // Setup MIDI CC list
    this.setupMIDIMapPanel();
  }

  /**
   * Setup audio level meters in UI
   */
  setupAudioMeters() {
    const container = document.getElementById('audio-meters');
    const bands = ['Bass', 'Mid', 'Treble', 'Overall'];

    bands.forEach(band => {
      const meter = document.createElement('div');
      meter.className = 'meter';
      meter.innerHTML = `
        <div class="meter-label">${band}</div>
        <div class="meter-bar">
          <div class="meter-fill" id="meter-${band.toLowerCase()}"></div>
        </div>
      `;
      container.appendChild(meter);
    });
  }

  /**
   * Setup MIDI map panel
   */
  setupMIDIMapPanel() {
    const container = document.getElementById('midi-cc-list');
    const mappings = this.midiMapper.getAllMappings();

    // Show first 20 mappings for demo
    mappings.slice(0, 20).forEach(mapping => {
      const item = document.createElement('div');
      item.className = 'midi-cc-item';
      item.id = `midi-cc-${mapping.cc}`;
      item.innerHTML = `
        <div class="cc-number">CC${mapping.cc}</div>
        <div class="cc-name">${mapping.name}</div>
        <div class="cc-value" id="cc-value-${mapping.cc}">0.00</div>
      `;
      container.appendChild(item);
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Prevent default for our shortcuts
      const shortcuts = ['g', 'm', 'h', ' ', 'n', 'p', 'r', 'f', 's', 'l'];
      if (shortcuts.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case 'g':
          this.toggleGUI();
          break;
        case 'm':
          this.toggleMIDIMap();
          break;
        case 'h':
          this.hideAll();
          break;
        case ' ':
          this.videoManager.togglePlayPause();
          break;
        case 'n':
          this.videoManager.nextVideo();
          break;
        case 'p':
          this.videoManager.previousVideo();
          break;
        case 'r':
          this.resetAllEffects();
          break;
        case 'f':
          this.toggleFullscreen();
          break;
        case 's':
          this.saveState();
          break;
        case 'l':
          this.loadState();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          this.loadQuickPreset(parseInt(e.key));
          break;
      }
    });
  }

  /**
   * Setup MIDI callbacks
   */
  setupMIDICallbacks() {
    this.midiMapper.onValueChange((data) => {
      this.handleMIDIValueChange(data);

      // Update UI
      const valueElement = document.getElementById(`cc-value-${data.cc}`);
      if (valueElement) {
        valueElement.textContent = data.value.toFixed(2);

        // Flash animation
        const item = document.getElementById(`midi-cc-${data.cc}`);
        if (item) {
          item.classList.add('active');
          setTimeout(() => item.classList.remove('active'), 500);
        }
      }
    });

    this.midiController.onCC((ccData) => {
      this.midiMapper.handleCC(ccData.cc, ccData.value);
    });

    this.midiController.onConnect(() => {
      const btn = document.getElementById('midi-permission-btn');
      btn.textContent = `✅ MIDI: ${this.midiController.getActiveDeviceName()}`;
      btn.classList.add('success');
      this.updateStats();
    });
  }

  /**
   * Handle MIDI value changes
   */
  handleMIDIValueChange(data) {
    const mapping = data.mapping;
    const value = data.value;

    // Update parameters based on target
    if (mapping.target.startsWith('video.')) {
      const prop = mapping.target.split('.')[1];
      this.params[`video${prop.charAt(0).toUpperCase() + prop.slice(1)}`] = value;

      // Apply to video manager
      if (prop === 'playbackRate') {
        this.videoManager.setPlaybackRate(value);
      } else if (prop === 'opacity' && this.videoMesh) {
        this.videoMesh.material.opacity = value;
      }
    } else if (mapping.target.startsWith('particles.')) {
      const prop = mapping.target.split('.')[1];
      this.params[`particle${prop.charAt(0).toUpperCase() + prop.slice(1)}`] = value;
    } else if (mapping.target.startsWith('camera.')) {
      const prop = mapping.target.split('.')[1];
      this.params[`camera${prop.charAt(0).toUpperCase() + prop.slice(1)}`] = value;
    } else if (mapping.target.startsWith('audioMod.')) {
      const prop = mapping.target.split('.')[1];
      this.params[prop] = value;

      if (prop === 'beatSensitivity' && this.audioEngine.beatDetector) {
        this.audioEngine.setBeatSensitivity(value);
      }
    }
  }

  /**
   * Setup video callbacks
   */
  setupVideoCallbacks() {
    this.videoManager.onVideoLoaded((video) => {
      this.updateVideoList();
      this.updateVideoTexture();
    });

    this.videoManager.onVideoChange((video) => {
      this.updateVideoTexture();
      this.updateStats();
    });
  }

  /**
   * Request MIDI permission
   */
  async requestMIDIPermission() {
    const success = await this.midiController.initialize();

    if (success) {
      console.log('✅ MIDI enabled');
    } else {
      alert('Failed to enable MIDI. Please check your browser permissions.');
    }
  }

  /**
   * Request audio permission
   */
  async requestAudioPermission() {
    const success = await this.audioEngine.initialize();

    if (success) {
      this.audioEngine.start();

      const btn = document.getElementById('audio-permission-btn');
      btn.textContent = '✅ Microphone Active';
      btn.classList.add('success');

      console.log('✅ Audio enabled');
      this.updateStats();
    } else {
      alert('Failed to enable microphone. Please check your browser permissions.');
    }
  }

  /**
   * Handle video upload
   */
  async handleVideoUpload(file) {
    try {
      await this.videoManager.addVideo(file);
      console.log(`✅ Video added: ${file.name}`);
    } catch (error) {
      console.error('Failed to add video:', error);
      alert(`Failed to add video: ${error.message}`);
    }
  }

  /**
   * Update video list in UI
   */
  updateVideoList() {
    const container = document.getElementById('video-list');
    const videos = this.videoManager.getAllVideos();

    container.innerHTML = '';

    videos.forEach(video => {
      const item = document.createElement('div');
      item.className = `video-item ${video.isCurrent ? 'active' : ''}`;
      item.innerHTML = `
        <span>${video.name}</span>
        <button onclick="app.removeVideo('${video.id}')">✕</button>
      `;
      container.appendChild(item);
    });
  }

  /**
   * Remove video
   */
  removeVideo(id) {
    this.videoManager.removeVideo(id);
    this.updateVideoList();
  }

  /**
   * Toggle GUI visibility
   */
  toggleGUI() {
    this.guiVisible = !this.guiVisible;
    const panel = document.getElementById('control-panel');
    panel.classList.toggle('hidden', !this.guiVisible);
  }

  /**
   * Toggle MIDI map visibility
   */
  toggleMIDIMap() {
    this.midiMapVisible = !this.midiMapVisible;
    const panel = document.getElementById('midi-map-panel');
    panel.classList.toggle('hidden', !this.midiMapVisible);
  }

  /**
   * Hide all UI panels
   */
  hideAll() {
    this.guiVisible = false;
    this.midiMapVisible = false;
    document.getElementById('control-panel').classList.add('hidden');
    document.getElementById('midi-map-panel').classList.add('hidden');
  }

  /**
   * Reset all effects to defaults
   */
  resetAllEffects() {
    this.params = this.initializeParameters();
    this.midiMapper.resetToDefaults();
    console.log('✅ All effects reset to defaults');
  }

  /**
   * Toggle fullscreen
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Save current state
   */
  saveState() {
    const state = {
      params: this.params,
      midiMappings: this.midiMapper.exportMappings(),
      videoState: this.videoManager.getState()
    };

    this.stateManager.saveState(state);
    console.log('✅ State saved');
  }

  /**
   * Load saved state
   */
  loadState() {
    const state = this.stateManager.loadState();

    if (state) {
      this.params = state.params || this.params;
      if (state.midiMappings) {
        this.midiMapper.importMappings(state.midiMappings);
      }
      console.log('✅ State loaded');
    }
  }

  /**
   * Load quick preset
   */
  loadQuickPreset(slot) {
    const state = this.stateManager.loadQuickPreset(slot);

    if (state) {
      this.params = state.params || this.params;
      console.log(`✅ Loaded preset ${slot}`);
    } else {
      console.log(`No preset in slot ${slot}`);
    }
  }

  /**
   * Update stats display
   */
  updateStats() {
    const stats = this.performanceMonitor.getStats();

    document.getElementById('fps-stat').textContent = `FPS: ${stats.fps}`;
    document.getElementById('frame-stat').textContent = `Frame: ${stats.frameTime}ms`;

    const videoState = this.videoManager.getState();
    if (videoState.currentVideo) {
      document.getElementById('video-stat').textContent =
        `Video: ${videoState.currentVideo.name}`;
    }

    document.getElementById('audio-stat').textContent =
      `Audio: ${this.audioEngine.isReady() ? 'Active' : 'Not active'}`;

    document.getElementById('midi-stat').textContent =
      `MIDI: ${this.midiController.isReady() ? this.midiController.getActiveDeviceName() : 'Not connected'}`;
  }

  /**
   * Update audio meters in UI
   */
  updateAudioMeters(levels) {
    if (!levels) return;

    const meterBass = document.getElementById('meter-bass');
    const meterMid = document.getElementById('meter-mid');
    const meterTreble = document.getElementById('meter-treble');
    const meterOverall = document.getElementById('meter-overall');

    if (meterBass) meterBass.style.width = `${levels.bass * 100}%`;
    if (meterMid) meterMid.style.width = `${levels.mid * 100}%`;
    if (meterTreble) meterTreble.style.width = `${levels.treble * 100}%`;
    if (meterOverall) meterOverall.style.width = `${levels.overall * 100}%`;
  }

  /**
   * Update scene based on parameters and audio
   */
  update() {
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Update video texture
    if (this.videoTexture) {
      this.videoTexture.needsUpdate = true;
    }

    // Update audio
    const audioData = this.audioEngine.update();
    if (audioData) {
      this.updateAudioMeters(audioData.levels);

      // Apply audio reactivity to particles
      if (this.particleSystem && this.params.particleAudioReactivity > 0) {
        const scale = 1 + (audioData.levels.overall * this.params.particleAudioReactivity);
        this.particleSystem.scale.setScalar(scale);
      }

      // Apply audio modulation
      if (this.params.bassToParticleSize > 0 && this.particleSystem) {
        const sizeModulation = 1 + (audioData.levels.bass * this.params.bassToParticleSize);
        this.particleSystem.material.size = this.params.particleSize * sizeModulation;
      }
    }

    // Rotate particles
    if (this.particleSystem) {
      this.particleSystem.rotation.y += deltaTime * 0.1;
      this.particleSystem.rotation.x += deltaTime * 0.05;
    }

    // Rotate video mesh
    if (this.videoMesh && this.params.videoRotationSpeed !== 0) {
      this.videoMesh.rotation.z += deltaTime * this.params.videoRotationSpeed;
    }

    // Update camera
    this.camera.fov = this.params.cameraFOV;
    this.camera.position.x = this.params.cameraPositionX;
    this.camera.position.y = this.params.cameraPositionY;
    this.camera.position.z = this.params.cameraPositionZ;
    this.camera.updateProjectionMatrix();

    // Update background color
    const hue = this.params.bgColorHue / 360;
    const brightness = this.params.bgBrightness;
    this.scene.background.setHSL(hue, 0.5, brightness);

    // Update performance monitor
    this.performanceMonitor.update(this.renderer);
  }

  /**
   * Render scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.update();
    this.render();

    // Update stats every 60 frames
    if (this.clock.elapsedTime % 1 < 0.016) {
      this.updateStats();
    }
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Cleanup and dispose
   */
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.performanceMonitor.stop();
    this.audioEngine.dispose();
    this.midiController.disconnect();
    this.videoManager.dispose();

    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Create and start application
const app = new VideoSynthSequencer();

// Expose app globally for debugging and UI callbacks
window.app = app;

// Handle page unload
window.addEventListener('beforeunload', () => {
  app.dispose();
});

console.log('🎵 Video Synth Sequencer loaded!');
