```bash
claude-code "Build a professional audio-reactive video sequencer optimized for Apple Silicon Macs.

PROJECT NAME: video-synth-sequencer

═══════════════════════════════════════════════════════
CORE REQUIREMENTS
═══════════════════════════════════════════════════════

VIDEO SYSTEM:
- Multi-video import via drag-drop and file picker
- Maintain upload order for sequential playback
- Seamless looping through video playlist
- Video texture mapping in Three.js
- Preload next video for smooth transitions
- Support formats: MP4, MOV, WEBM
- Display current video index and filename in GUI

AUDIO SYSTEM:
- Microphone input with permission toggle
- 8-band frequency analysis (sub-bass, bass, low-mid, mid, high-mid, treble, presence, air)
- RMS and peak level tracking
- Transient/beat detection with adjustable sensitivity
- Low-latency audio processing (<10ms)
- Audio level meters in GUI

MIDI SYSTEM:
- MIDI input with permission toggle
- STRICT CC RANGE: 35-98 inclusive (64 total CCs)
- MIDI learn functionality
- Visual MIDI activity indicators
- Persist MIDI mappings to localStorage
- Display active MIDI device name

THREE.JS VISUAL SYSTEM (Apple Silicon Optimized):
- Use WebGL 2.0 with Metal backend hints
- Instanced rendering for particle systems
- Geometry batching for performance
- Half-float textures where possible
- Efficient shader compilation
- Post-processing with selective effects

═══════════════════════════════════════════════════════
MIDI CC MAPPING (35-98) - VISUAL EFFECTS
═══════════════════════════════════════════════════════

VIDEO EFFECTS (CC 35-45):
CC 35: Video Playback Speed (0.25x - 4.0x)
CC 36: Video Opacity (0.0 - 1.0)
CC 37: Video Saturation (-1.0 to 2.0)
CC 38: Video Hue Shift (0 - 360 degrees)
CC 39: Video Brightness (-1.0 to 1.0)
CC 40: Video Contrast (0.0 - 2.0)
CC 41: Video Blur Amount (0 - 20px)
CC 42: Chromatic Aberration (0 - 0.05)
CC 43: Video Scale (0.5 - 3.0)
CC 44: Video Rotation Speed (-2 - 2)
CC 45: Kaleidoscope Segments (1 - 12)

PARTICLE SYSTEM (CC 46-57):
CC 46: Particle Count (0 - 5000)
CC 47: Particle Size (0.1 - 20.0)
CC 48: Particle Speed (0 - 10)
CC 49: Particle Spread (0 - 100)
CC 50: Particle Lifetime (0.5 - 10 sec)
CC 51: Particle Gravity (-5 - 5)
CC 52: Particle Turbulence (0 - 5)
CC 53: Particle Trail Length (0 - 50)
CC 54: Audio Reactivity Amount (0 - 2)
CC 55: Particle Color Hue (0 - 360)
CC 56: Particle Opacity (0 - 1)
CC 57: Emission Rate (0 - 200/sec)

GEOMETRY/MESH EFFECTS (CC 58-68):
CC 58: Mesh Displacement Amount (0 - 5)
CC 59: Mesh Rotation X (-3.14 - 3.14)
CC 60: Mesh Rotation Y (-3.14 - 3.14)
CC 61: Mesh Rotation Z (-3.14 - 3.14)
CC 62: Mesh Scale (0.1 - 5.0)
CC 63: Wireframe Thickness (0 - 5)
CC 64: Vertex Noise Amount (0 - 2)
CC 65: Mesh Opacity (0 - 1)
CC 66: Normal Map Strength (0 - 2)
CC 67: Metalness (0 - 1)
CC 68: Roughness (0 - 1)

POST-PROCESSING (CC 69-80):
CC 69: Bloom Strength (0 - 3)
CC 70: Bloom Threshold (0 - 1)
CC 71: Bloom Radius (0 - 1)
CC 72: Glitch Intensity (0 - 1)
CC 73: RGB Split Amount (0 - 0.1)
CC 74: Pixelation Amount (1 - 100)
CC 75: Vignette Strength (0 - 1)
CC 76: Film Grain Amount (0 - 1)
CC 77: Color Grading Temp (-1 - 1)
CC 78: Color Grading Tint (-1 - 1)
CC 79: Distortion Amount (0 - 1)
CC 80: Feedback Amount (0 - 0.95)

CAMERA & SCENE (CC 81-90):
CC 81: Camera FOV (20 - 120)
CC 82: Camera Position X (-50 - 50)
CC 83: Camera Position Y (-50 - 50)
CC 84: Camera Position Z (-50 - 50)
CC 85: Camera Rotation Speed (0 - 2)
CC 86: Camera Shake Amount (0 - 5)
CC 87: Background Color Hue (0 - 360)
CC 88: Background Brightness (0 - 1)
CC 89: Fog Density (0 - 0.1)
CC 90: Fog Color Hue (0 - 360)

AUDIO REACTIVE MODULATION (CC 91-98):
CC 91: Bass → Particle Size (0 - 2)
CC 92: Mid → Color Shift (0 - 2)
CC 93: Treble → Bloom (0 - 2)
CC 94: Kick → Flash Intensity (0 - 2)
CC 95: Overall → Scale Pulse (0 - 2)
CC 96: Audio Smoothing (0 - 0.99)
CC 97: Beat Detection Sensitivity (0.1 - 2.0)
CC 98: Global Audio Intensity (0 - 3)

═══════════════════════════════════════════════════════
GUI SYSTEM
═══════════════════════════════════════════════════════

MAIN CONTROL PANEL (Toggleable with 'G' key):
- MIDI Permission Button (shows connection status)
- Microphone Permission Button (shows connection status)
- Video Upload Area (drag-drop + file picker)
- Video Playlist (reorderable list with delete buttons)
- Current Video Display
- Audio Level Meters (8 frequency bands)
- FPS Counter
- Performance Stats (draw calls, triangles)

MIDI MAP PANEL (Toggleable with 'M' key):
- Scrollable list of all 64 CC mappings (35-98)
- Visual indicator when CC value changes
- Current value display for each CC
- MIDI Learn buttons for custom mapping
- Color-coded by category (Video/Particles/Geometry/Post/Camera/Audio)
- Search/filter functionality
- Reset to defaults button
- Export/Import mapping presets

KEYBOARD SHORTCUTS:
G: Toggle main GUI
M: Toggle MIDI map panel
H: Toggle both panels (hide all)
SPACE: Play/Pause videos
N: Next video
P: Previous video
R: Reset all effects to defaults
F: Toggle fullscreen
S: Save current state
L: Load saved state
1-9: Quick preset slots

═══════════════════════════════════════════════════════
APPLE SILICON OPTIMIZATION STRATEGIES
═══════════════════════════════════════════════════════

WEBGL/METAL OPTIMIZATION:
1. Enable WEBGL_draw_buffers extension
2. Use ANGLE_instanced_arrays for particles
3. Prefer HALF_FLOAT over FLOAT for textures
4. Use EXT_color_buffer_half_float for render targets
5. Implement frustum culling
6. Use LOD (Level of Detail) for distant objects
7. Batch draw calls aggressively
8. Use SharedArrayBuffer for worker threads (if available)

VIDEO OPTIMIZATION:
1. Use HTMLVideoElement with 'playsinline' attribute
2. Preload videos with 'preload=auto'
3. Use VideoTexture with efficient updates
4. Limit video resolution detection (prefer 1080p max)
5. Use requestVideoFrameCallback for sync
6. Implement video texture caching
7. Compress videos client-side if >50MB

SHADER OPTIMIZATION:
1. Minimize uniform updates
2. Use texture atlases where possible
3. Avoid dynamic branching in fragment shaders
4. Use mediump precision where acceptable
5. Precompile shaders during initialization
6. Use uniform buffers for grouped updates
7. Implement shader warmup on load

PARTICLE SYSTEM OPTIMIZATION:
1. Use BufferGeometry with instanced rendering
2. Implement object pooling
3. Update only visible particles
4. Use compute shaders (via WebGL2 transform feedback)
5. Batch particle updates in chunks
6. Use spatial hashing for collision detection
7. Limit max particles: 5000 (adjustable)

MEMORY MANAGEMENT:
1. Dispose Three.js objects properly
2. Use WeakMap for caching
3. Implement texture compression (basis/ktx2)
3. Monitor memory with performance.memory
4. Clear unused video textures
5. Limit undo/history stack
6. Use OffscreenCanvas for background processing

AUDIO OPTIMIZATION:
1. Use AudioWorklet instead of ScriptProcessor
2. Implement ring buffers for audio data
3. Downsample analysis FFT for performance
4. Cache frequency band calculations
5. Use Float32Array for audio processing
6. Limit AnalyzerNode fftSize based on performance

═══════════════════════════════════════════════════════
PROJECT STRUCTURE
═══════════════════════════════════════════════════════

video-synth-sequencer/
├── index.html
├── src/
│   ├── main.js                    # App initialization
│   ├── video/
│   │   ├── VideoManager.js        # Video loading, sequencing
│   │   ├── VideoTexture.js        # Three.js video texture wrapper
│   │   └── VideoEffects.js        # Video effect shaders
│   ├── audio/
│   │   ├── AudioEngine.js         # Microphone, analysis
│   │   ├── FrequencyAnalyzer.js   # 8-band frequency analysis
│   │   └── BeatDetector.js        # Transient detection
│   ├── midi/
│   │   ├── MIDIController.js      # MIDI Web API wrapper
│   │   ├── MIDIMapper.js          # CC 35-98 mapping system
│   │   └── MIDILearn.js           # MIDI learn functionality
│   ├── visual/
│   │   ├── Scene.js               # Three.js scene setup
│   │   ├── ParticleSystem.js      # Instanced particle renderer
│   │   ├── Geometry.js            # Reactive mesh systems
│   │   ├── PostProcessing.js      # Effect composer
│   │   └── Camera.js              # Camera controller
│   ├── shaders/
│   │   ├── particles/
│   │   │   ├── particle.vert
│   │   │   └── particle.frag
│   │   ├── video/
│   │   │   ├── videoEffect.frag
│   │   │   └── kaleidoscope.frag
│   │   ├── post/
│   │   │   ├── bloom.frag
│   │   │   ├── glitch.frag
│   │   │   ├── rgbSplit.frag
│   │   │   └── feedback.frag
│   │   └── geometry/
│   │       ├── displacement.vert
│   │       └── reactive.frag
│   ├── gui/
│   │   ├── GUIManager.js          # Main GUI controller
│   │   ├── ControlPanel.js        # Main control panel
│   │   ├── MIDIMapPanel.js        # MIDI CC map display
│   │   └── KeyboardHandler.js     # Keyboard shortcuts
│   └── utils/
│       ├── PerformanceMonitor.js  # FPS, memory tracking
│       ├── StateManager.js        # Save/load state
│       └── OptimizationUtils.js   # Apple Silicon helpers
├── styles/
│   ├── main.css
│   ├── controls.css
│   └── midi-map.css
├── README.md
├── OPTIMIZATION.md                 # Apple Silicon specific notes
└── MIDI_MAP.md                     # Complete CC reference

═══════════════════════════════════════════════════════
TECHNICAL IMPLEMENTATION DETAILS
═══════════════════════════════════════════════════════

VIDEO SEQUENCER LOGIC:
```javascript
class VideoManager {
  constructor() {
    this.videos = [];
    this.currentIndex = 0;
    this.videoElements = [];
    this.textures = [];
  }
  
  addVideo(file) {
    // Maintain upload order
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.preload = 'auto';
    video.playsinline = true;
    video.loop = false; // We handle looping
    
    video.addEventListener('ended', () => this.nextVideo());
    
    this.videos.push({
      name: file.name,
      element: video,
      texture: new THREE.VideoTexture(video)
    });
    
    if (this.videos.length === 1) this.play();
  }
  
  nextVideo() {
    this.currentIndex = (this.currentIndex + 1) % this.videos.length;
    this.play();
  }
  
  play() {
    this.videos[this.currentIndex].element.play();
    // Preload next video
    const nextIndex = (this.currentIndex + 1) % this.videos.length;
    this.videos[nextIndex].element.load();
  }
}
```

MIDI CC MAPPING SYSTEM:
```javascript
class MIDIMapper {
  constructor() {
    this.ccRange = { min: 35, max: 98 };
    this.mappings = this.initializeDefaultMappings();
    this.activeValues = new Map();
  }
  
  initializeDefaultMappings() {
    const mappings = new Map();
    
    // Video Effects (35-45)
    mappings.set(35, { name: 'Video Speed', min: 0.25, max: 4.0, target: 'video.playbackRate' });
    mappings.set(36, { name: 'Video Opacity', min: 0, max: 1, target: 'video.opacity' });
    // ... (all 64 mappings)
    
    return mappings;
  }
  
  handleCC(cc, value) {
    if (cc < this.ccRange.min || cc > this.ccRange.max) return;
    
    const mapping = this.mappings.get(cc);
    if (!mapping) return;
    
    // Normalize MIDI value (0-127) to parameter range
    const normalized = value / 127;
    const scaled = mapping.min + (normalized * (mapping.max - mapping.min));
    
    this.activeValues.set(cc, scaled);
    this.applyToTarget(mapping.target, scaled);
  }
}
```

APPLE SILICON DETECTION & OPTIMIZATION:
```javascript
class OptimizationUtils {
  static isAppleSilicon() {
    const gl = document.createElement('canvas').getContext('webgl2');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    return renderer.includes('Apple') || 
           navigator.userAgent.includes('Macintosh') && 
           navigator.hardwareConcurrency >= 8;
  }
  
  static configureRenderer(renderer) {
    if (this.isAppleSilicon()) {
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.powerPreference = 'high-performance';
      renderer.antialias = true; // Apple Silicon handles this well
      renderer.precision = 'highp';
      
      // Enable Metal-optimized extensions
      const gl = renderer.getContext();
      gl.getExtension('EXT_color_buffer_half_float');
      gl.getExtension('WEBGL_draw_buffers');
    }
    
    return renderer;
  }
}
```

AUDIO REACTIVE MODULATION:
```javascript
class AudioReactiveController {
  update(audioLevels, midiValues) {
    const bass = audioLevels.bass;
    const mid = audioLevels.mid;
    const treble = audioLevels.treble;
    const kick = audioLevels.kickDetected;
    
    // CC 91: Bass → Particle Size
    if (midiValues.has(91)) {
      const modAmount = midiValues.get(91);
      particles.size *= (1 + bass * modAmount);
    }
    
    // CC 92: Mid → Color Shift
    if (midiValues.has(92)) {
      const modAmount = midiValues.get(92);
      scene.colorShift += mid * modAmount * 0.1;
    }
    
    // CC 93: Treble → Bloom
    if (midiValues.has(93)) {
      const modAmount = midiValues.get(93);
      postProcessing.bloomStrength = treble * modAmount;
    }
    
    // CC 94: Kick → Flash
    if (kick && midiValues.has(94)) {
      const modAmount = midiValues.get(94);
      scene.flash(modAmount);
    }
  }
}
```

═══════════════════════════════════════════════════════
PERFORMANCE TARGETS (Apple Silicon)
═══════════════════════════════════════════════════════

M1/M2/M3 Mac Targets:
- 60 FPS at 1920x1080 (retina)
- 5000 particles sustained
- <100ms video switching time
- <10ms audio latency
- <16ms frame time (consistent)
- <500 draw calls per frame
- <2GB RAM usage
- Smooth MIDI response (<5ms)

Optimization Monitoring:
- Log performance.now() deltas
- Track Three.js renderer.info stats
- Monitor memory with performance.memory
- Use Chrome DevTools Performance profiler
- Test on M1 (8-core) as baseline

═══════════════════════════════════════════════════════
DELIVERABLES
═══════════════════════════════════════════════════════

1. Complete working application
2. All 64 MIDI CC mappings implemented and tested
3. Video sequencer with smooth transitions
4. Optimized Three.js scene with effects
5. Toggleable GUI with keyboard shortcuts
6. Comprehensive MIDI_MAP.md reference
7. OPTIMIZATION.md with Apple Silicon notes
8. README.md with:
   - Installation instructions
   - Keyboard shortcuts reference
   - MIDI setup guide
   - Video format recommendations
   - Performance tuning guide
   - Troubleshooting section

9. Example presets (JSON files):
   - ambient.json
   - aggressive.json
   - experimental.json
   - minimal.json

10. Professional CSS styling:
    - Dark theme optimized for performance
    - Glassmorphic UI elements
    - Smooth animations
    - Responsive layout
    - Accessibility features

═══════════════════════════════════════════════════════
TESTING REQUIREMENTS
═══════════════════════════════════════════════════════

Verify:
- All 64 MIDI CCs (35-98) respond correctly
- Video playback loops seamlessly
- GUI toggles work (G, M, H keys)
- Microphone permission flow
- MIDI permission flow
- State save/load functionality
- All post-processing effects
- Particle system performance
- Memory doesn't leak during long sessions
- Video upload and reordering
- Multiple video formats work
- FPS stays above 55 on M1 Mac

═══════════════════════════════════════════════════════
GIT WORKFLOW
═══════════════════════════════════════════════════════

Make commits for:
- Initial project structure
- Video manager implementation
- Audio engine implementation
- MIDI system implementation
- Each major visual system (particles, geometry, post)
- GUI implementation
- Optimization passes
- Documentation
- Final testing and polish

Use conventional commits:
- feat: Add particle system with instanced rendering
- perf: Optimize video texture updates for Apple Silicon
- docs: Add complete MIDI CC reference
- fix: Resolve memory leak in video disposal

═══════════════════════════════════════════════════════
FINAL OUTPUT
═══════════════════════════════════════════════════════

Provide:
1. Confirmation of all features implemented
2. Performance benchmarks on test system
3. List of all MIDI CCs and their functions
4. Keyboard shortcuts reference
5. Known limitations or future improvements
6. Setup instructions for first-time use
7. Recommended MIDI controllers
8. Video format best practices

The application should be production-ready, visually stunning, performant on Apple Silicon, and fully documented."
```

This generates a complete, production-ready audio-reactive video sequencer optimized specifically for Apple Silicon Macs with all 64 MIDI CCs mapped, complex Three.js visuals, and a professional GUI system.