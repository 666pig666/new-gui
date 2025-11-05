/**
 * MIDIMapper.js
 * CC 35-98 mapping system with parameter control
 */

export class MIDIMapper {
  constructor() {
    // STRICT CC RANGE: 35-98 inclusive (64 total CCs)
    this.ccRange = { min: 35, max: 98 };
    this.mappings = this.initializeDefaultMappings();
    this.activeValues = new Map();
    this.lastUpdateTime = new Map();

    // Callbacks
    this.onValueChangeCallback = null;

    // Load saved mappings from localStorage
    this.loadMappings();
  }

  /**
   * Initialize default MIDI CC mappings
   * @returns {Map}
   */
  initializeDefaultMappings() {
    const mappings = new Map();

    // VIDEO EFFECTS (CC 35-45)
    mappings.set(35, { name: 'Video Playback Speed', min: 0.25, max: 4.0, default: 1.0, target: 'video.playbackRate', category: 'video' });
    mappings.set(36, { name: 'Video Opacity', min: 0, max: 1, default: 1.0, target: 'video.opacity', category: 'video' });
    mappings.set(37, { name: 'Video Saturation', min: -1, max: 2, default: 1.0, target: 'video.saturation', category: 'video' });
    mappings.set(38, { name: 'Video Hue Shift', min: 0, max: 360, default: 0, target: 'video.hueShift', category: 'video' });
    mappings.set(39, { name: 'Video Brightness', min: -1, max: 1, default: 0, target: 'video.brightness', category: 'video' });
    mappings.set(40, { name: 'Video Contrast', min: 0, max: 2, default: 1.0, target: 'video.contrast', category: 'video' });
    mappings.set(41, { name: 'Video Blur Amount', min: 0, max: 20, default: 0, target: 'video.blur', category: 'video' });
    mappings.set(42, { name: 'Chromatic Aberration', min: 0, max: 0.05, default: 0, target: 'video.chromaticAberration', category: 'video' });
    mappings.set(43, { name: 'Video Scale', min: 0.5, max: 3, default: 1.0, target: 'video.scale', category: 'video' });
    mappings.set(44, { name: 'Video Rotation Speed', min: -2, max: 2, default: 0, target: 'video.rotationSpeed', category: 'video' });
    mappings.set(45, { name: 'Kaleidoscope Segments', min: 1, max: 12, default: 1, target: 'video.kaleidoscope', category: 'video' });

    // PARTICLE SYSTEM (CC 46-57)
    mappings.set(46, { name: 'Particle Count', min: 0, max: 5000, default: 1000, target: 'particles.count', category: 'particles' });
    mappings.set(47, { name: 'Particle Size', min: 0.1, max: 20, default: 2.0, target: 'particles.size', category: 'particles' });
    mappings.set(48, { name: 'Particle Speed', min: 0, max: 10, default: 1.0, target: 'particles.speed', category: 'particles' });
    mappings.set(49, { name: 'Particle Spread', min: 0, max: 100, default: 20, target: 'particles.spread', category: 'particles' });
    mappings.set(50, { name: 'Particle Lifetime', min: 0.5, max: 10, default: 3.0, target: 'particles.lifetime', category: 'particles' });
    mappings.set(51, { name: 'Particle Gravity', min: -5, max: 5, default: 0, target: 'particles.gravity', category: 'particles' });
    mappings.set(52, { name: 'Particle Turbulence', min: 0, max: 5, default: 0, target: 'particles.turbulence', category: 'particles' });
    mappings.set(53, { name: 'Particle Trail Length', min: 0, max: 50, default: 0, target: 'particles.trailLength', category: 'particles' });
    mappings.set(54, { name: 'Audio Reactivity Amount', min: 0, max: 2, default: 0.5, target: 'particles.audioReactivity', category: 'particles' });
    mappings.set(55, { name: 'Particle Color Hue', min: 0, max: 360, default: 200, target: 'particles.colorHue', category: 'particles' });
    mappings.set(56, { name: 'Particle Opacity', min: 0, max: 1, default: 0.8, target: 'particles.opacity', category: 'particles' });
    mappings.set(57, { name: 'Emission Rate', min: 0, max: 200, default: 50, target: 'particles.emissionRate', category: 'particles' });

    // GEOMETRY/MESH EFFECTS (CC 58-68)
    mappings.set(58, { name: 'Mesh Displacement Amount', min: 0, max: 5, default: 0, target: 'mesh.displacement', category: 'geometry' });
    mappings.set(59, { name: 'Mesh Rotation X', min: -3.14, max: 3.14, default: 0, target: 'mesh.rotationX', category: 'geometry' });
    mappings.set(60, { name: 'Mesh Rotation Y', min: -3.14, max: 3.14, default: 0, target: 'mesh.rotationY', category: 'geometry' });
    mappings.set(61, { name: 'Mesh Rotation Z', min: -3.14, max: 3.14, default: 0, target: 'mesh.rotationZ', category: 'geometry' });
    mappings.set(62, { name: 'Mesh Scale', min: 0.1, max: 5, default: 1.0, target: 'mesh.scale', category: 'geometry' });
    mappings.set(63, { name: 'Wireframe Thickness', min: 0, max: 5, default: 0, target: 'mesh.wireframeThickness', category: 'geometry' });
    mappings.set(64, { name: 'Vertex Noise Amount', min: 0, max: 2, default: 0, target: 'mesh.vertexNoise', category: 'geometry' });
    mappings.set(65, { name: 'Mesh Opacity', min: 0, max: 1, default: 1.0, target: 'mesh.opacity', category: 'geometry' });
    mappings.set(66, { name: 'Normal Map Strength', min: 0, max: 2, default: 1.0, target: 'mesh.normalStrength', category: 'geometry' });
    mappings.set(67, { name: 'Metalness', min: 0, max: 1, default: 0.5, target: 'mesh.metalness', category: 'geometry' });
    mappings.set(68, { name: 'Roughness', min: 0, max: 1, default: 0.5, target: 'mesh.roughness', category: 'geometry' });

    // POST-PROCESSING (CC 69-80)
    mappings.set(69, { name: 'Bloom Strength', min: 0, max: 3, default: 0.5, target: 'post.bloomStrength', category: 'post' });
    mappings.set(70, { name: 'Bloom Threshold', min: 0, max: 1, default: 0.5, target: 'post.bloomThreshold', category: 'post' });
    mappings.set(71, { name: 'Bloom Radius', min: 0, max: 1, default: 0.5, target: 'post.bloomRadius', category: 'post' });
    mappings.set(72, { name: 'Glitch Intensity', min: 0, max: 1, default: 0, target: 'post.glitch', category: 'post' });
    mappings.set(73, { name: 'RGB Split Amount', min: 0, max: 0.1, default: 0, target: 'post.rgbSplit', category: 'post' });
    mappings.set(74, { name: 'Pixelation Amount', min: 1, max: 100, default: 1, target: 'post.pixelation', category: 'post' });
    mappings.set(75, { name: 'Vignette Strength', min: 0, max: 1, default: 0, target: 'post.vignette', category: 'post' });
    mappings.set(76, { name: 'Film Grain Amount', min: 0, max: 1, default: 0, target: 'post.filmGrain', category: 'post' });
    mappings.set(77, { name: 'Color Grading Temp', min: -1, max: 1, default: 0, target: 'post.colorTemp', category: 'post' });
    mappings.set(78, { name: 'Color Grading Tint', min: -1, max: 1, default: 0, target: 'post.colorTint', category: 'post' });
    mappings.set(79, { name: 'Distortion Amount', min: 0, max: 1, default: 0, target: 'post.distortion', category: 'post' });
    mappings.set(80, { name: 'Feedback Amount', min: 0, max: 0.95, default: 0, target: 'post.feedback', category: 'post' });

    // CAMERA & SCENE (CC 81-90)
    mappings.set(81, { name: 'Camera FOV', min: 20, max: 120, default: 75, target: 'camera.fov', category: 'camera' });
    mappings.set(82, { name: 'Camera Position X', min: -50, max: 50, default: 0, target: 'camera.positionX', category: 'camera' });
    mappings.set(83, { name: 'Camera Position Y', min: -50, max: 50, default: 0, target: 'camera.positionY', category: 'camera' });
    mappings.set(84, { name: 'Camera Position Z', min: -50, max: 50, default: 30, target: 'camera.positionZ', category: 'camera' });
    mappings.set(85, { name: 'Camera Rotation Speed', min: 0, max: 2, default: 0, target: 'camera.rotationSpeed', category: 'camera' });
    mappings.set(86, { name: 'Camera Shake Amount', min: 0, max: 5, default: 0, target: 'camera.shake', category: 'camera' });
    mappings.set(87, { name: 'Background Color Hue', min: 0, max: 360, default: 220, target: 'scene.bgColorHue', category: 'camera' });
    mappings.set(88, { name: 'Background Brightness', min: 0, max: 1, default: 0.1, target: 'scene.bgBrightness', category: 'camera' });
    mappings.set(89, { name: 'Fog Density', min: 0, max: 0.1, default: 0, target: 'scene.fogDensity', category: 'camera' });
    mappings.set(90, { name: 'Fog Color Hue', min: 0, max: 360, default: 200, target: 'scene.fogColorHue', category: 'camera' });

    // AUDIO REACTIVE MODULATION (CC 91-98)
    mappings.set(91, { name: 'Bass → Particle Size', min: 0, max: 2, default: 0, target: 'audioMod.bassToParticleSize', category: 'audio' });
    mappings.set(92, { name: 'Mid → Color Shift', min: 0, max: 2, default: 0, target: 'audioMod.midToColorShift', category: 'audio' });
    mappings.set(93, { name: 'Treble → Bloom', min: 0, max: 2, default: 0, target: 'audioMod.trebleToBloom', category: 'audio' });
    mappings.set(94, { name: 'Kick → Flash Intensity', min: 0, max: 2, default: 0, target: 'audioMod.kickToFlash', category: 'audio' });
    mappings.set(95, { name: 'Overall → Scale Pulse', min: 0, max: 2, default: 0, target: 'audioMod.overallToScale', category: 'audio' });
    mappings.set(96, { name: 'Audio Smoothing', min: 0, max: 0.99, default: 0.8, target: 'audioMod.smoothing', category: 'audio' });
    mappings.set(97, { name: 'Beat Detection Sensitivity', min: 0.1, max: 2, default: 1.0, target: 'audioMod.beatSensitivity', category: 'audio' });
    mappings.set(98, { name: 'Global Audio Intensity', min: 0, max: 3, default: 1.0, target: 'audioMod.globalIntensity', category: 'audio' });

    return mappings;
  }

  /**
   * Handle incoming MIDI CC message
   * @param {number} cc - CC number
   * @param {number} value - MIDI value (0-127)
   */
  handleCC(cc, value) {
    if (cc < this.ccRange.min || cc > this.ccRange.max) {
      return; // Ignore CCs outside our range
    }

    const mapping = this.mappings.get(cc);
    if (!mapping) return;

    // Normalize MIDI value (0-127) to parameter range
    const normalized = value / 127;
    const scaled = mapping.min + (normalized * (mapping.max - mapping.min));

    // Store value
    this.activeValues.set(cc, scaled);
    this.lastUpdateTime.set(cc, performance.now());

    // Notify callback
    if (this.onValueChangeCallback) {
      this.onValueChangeCallback({
        cc,
        value: scaled,
        midiValue: value,
        normalized,
        mapping
      });
    }
  }

  /**
   * Get current value for a CC
   * @param {number} cc
   * @returns {number|null}
   */
  getValue(cc) {
    return this.activeValues.get(cc) ?? null;
  }

  /**
   * Get all active values
   * @returns {Map}
   */
  getAllValues() {
    return new Map(this.activeValues);
  }

  /**
   * Get mapping info for a CC
   * @param {number} cc
   * @returns {object|null}
   */
  getMapping(cc) {
    return this.mappings.get(cc) ?? null;
  }

  /**
   * Get all mappings
   * @returns {array}
   */
  getAllMappings() {
    const result = [];
    for (const [cc, mapping] of this.mappings.entries()) {
      result.push({
        cc,
        ...mapping,
        currentValue: this.activeValues.get(cc) ?? mapping.default
      });
    }
    return result;
  }

  /**
   * Get mappings by category
   * @param {string} category
   * @returns {array}
   */
  getMappingsByCategory(category) {
    return this.getAllMappings().filter(m => m.category === category);
  }

  /**
   * Get all categories
   * @returns {array}
   */
  getCategories() {
    const categories = new Set();
    for (const mapping of this.mappings.values()) {
      categories.add(mapping.category);
    }
    return Array.from(categories);
  }

  /**
   * Reset all values to defaults
   */
  resetToDefaults() {
    this.activeValues.clear();
    this.lastUpdateTime.clear();

    // Set all values to defaults
    for (const [cc, mapping] of this.mappings.entries()) {
      this.activeValues.set(cc, mapping.default);
    }

    console.log('All MIDI values reset to defaults');
  }

  /**
   * Reset specific CC to default
   * @param {number} cc
   */
  resetCC(cc) {
    const mapping = this.mappings.get(cc);
    if (mapping) {
      this.activeValues.set(cc, mapping.default);
    }
  }

  /**
   * Register callback for value changes
   * @param {Function} callback
   */
  onValueChange(callback) {
    this.onValueChangeCallback = callback;
  }

  /**
   * Save mappings to localStorage
   */
  saveMappings() {
    try {
      const data = {};
      for (const [cc, value] of this.activeValues.entries()) {
        data[cc] = value;
      }

      localStorage.setItem('midi-mapper-values', JSON.stringify(data));
      console.log('MIDI mappings saved');
    } catch (error) {
      console.error('Failed to save MIDI mappings:', error);
    }
  }

  /**
   * Load mappings from localStorage
   */
  loadMappings() {
    try {
      const dataString = localStorage.getItem('midi-mapper-values');
      if (!dataString) return;

      const data = JSON.parse(dataString);

      for (const [cc, value] of Object.entries(data)) {
        this.activeValues.set(parseInt(cc), value);
      }

      console.log('MIDI mappings loaded');
    } catch (error) {
      console.error('Failed to load MIDI mappings:', error);
    }
  }

  /**
   * Export mappings as JSON
   * @returns {object}
   */
  exportMappings() {
    const data = {};
    for (const [cc, value] of this.activeValues.entries()) {
      const mapping = this.mappings.get(cc);
      data[cc] = {
        value,
        name: mapping.name,
        target: mapping.target
      };
    }
    return data;
  }

  /**
   * Import mappings from JSON
   * @param {object} data
   */
  importMappings(data) {
    try {
      for (const [cc, info] of Object.entries(data)) {
        const ccNum = parseInt(cc);
        if (ccNum >= this.ccRange.min && ccNum <= this.ccRange.max) {
          this.activeValues.set(ccNum, info.value);
        }
      }
      console.log('MIDI mappings imported');
    } catch (error) {
      console.error('Failed to import MIDI mappings:', error);
    }
  }
}
