# 🎵 Video Synth Sequencer

Professional audio-reactive video sequencer optimized for Apple Silicon Macs.

A real-time visual synthesizer that combines video playback, audio analysis, MIDI control, and Three.js graphics into a powerful performance tool for VJs, musicians, and visual artists.

## ✨ Features

### 🎬 Video System
- Multi-video import via drag-drop and file picker
- Seamless looping through video playlist
- Maintains upload order for sequential playback
- Preloads next video for smooth transitions
- Supports MP4, MOV, and WEBM formats
- Real-time video effects and manipulation

### 🎵 Audio System
- Microphone input with real-time analysis
- 8-band frequency analysis (sub-bass, bass, low-mid, mid, high-mid, treble, presence, air)
- RMS and peak level tracking
- Transient/beat detection with adjustable sensitivity
- Low-latency audio processing (<10ms)
- Visual audio level meters in GUI

### 🎹 MIDI System
- MIDI input with Web MIDI API
- **64 MIDI CC mappings (CC 35-98)** for comprehensive control
- MIDI learn functionality for custom mappings
- Visual MIDI activity indicators
- Persistent MIDI mappings via localStorage
- Real-time parameter control

### 🎨 Visual Effects
- **Video Effects**: Playback speed, opacity, saturation, hue shift, brightness, contrast, blur, chromatic aberration, scale, rotation, kaleidoscope
- **Particle System**: Audio-reactive particle effects with customizable properties
- **Camera Control**: FOV, position, rotation, shake effects
- **Scene Effects**: Background color, fog, lighting

### 💾 State Management
- Save/load complete application state
- 9 quick preset slots (keys 1-9)
- Export/import presets as JSON files
- Undo/redo functionality
- LocalStorage persistence

## 🚀 Installation

### Prerequisites
- Modern web browser with Web MIDI API support (Chrome, Edge recommended)
- MIDI controller (optional, but recommended)
- Microphone (for audio reactivity)
- Video files (MP4, MOV, or WEBM)

### Setup

1. **Clone or download this repository**

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

5. **Preview production build**
```bash
npm run preview
```

## 🎮 Getting Started

### Initial Setup

1. **Enable Permissions**
   - Click "Enable MIDI" to connect your MIDI controller
   - Click "Enable Microphone" to activate audio analysis

2. **Load Videos**
   - Drag and drop video files onto the upload zone
   - Or click the upload zone to browse files
   - Supported formats: MP4, MOV, WEBM
   - Videos will play in the order they're uploaded

3. **Connect MIDI Controller**
   - Connect your MIDI controller before or after loading the page
   - The active device name will be displayed
   - MIDI CC 35-98 are mapped to various parameters

### Basic Usage

1. **Video Playback**
   - Videos play automatically when added
   - Use playback controls or keyboard shortcuts
   - Videos loop seamlessly through the playlist

2. **MIDI Control**
   - Move any controller mapped to CC 35-98
   - Watch parameters update in real-time
   - Open MIDI Map panel (press `M`) to see all mappings

3. **Audio Reactivity**
   - Speak, sing, or play music near your microphone
   - Watch visuals react to audio levels
   - Adjust sensitivity and reactivity via MIDI CC 91-98

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G` | Toggle main GUI panel |
| `M` | Toggle MIDI map panel |
| `H` | Hide all UI panels |
| `SPACE` | Play/Pause video |
| `N` | Next video |
| `P` | Previous video |
| `R` | Reset all effects to defaults |
| `F` | Toggle fullscreen |
| `S` | Save current state |
| `L` | Load saved state |
| `1-9` | Load quick preset slots |

## 🎛️ MIDI CC Mappings

The sequencer uses MIDI CC 35-98 (64 total CCs) for parameter control. See [MIDI_MAP.md](./MIDI_MAP.md) for complete reference.

### Categories

- **CC 35-45**: Video Effects (playback speed, color, blur, effects)
- **CC 46-57**: Particle System (count, size, motion, appearance)
- **CC 58-68**: Geometry/Mesh Effects (displacement, rotation, materials)
- **CC 69-80**: Post-Processing (bloom, glitch, color grading, distortion)
- **CC 81-90**: Camera & Scene (position, FOV, background, fog)
- **CC 91-98**: Audio Reactive Modulation (sensitivity, mappings, intensity)

### Quick Examples

- **CC 35**: Control video playback speed (0.25x - 4.0x)
- **CC 38**: Shift video hue (0-360 degrees)
- **CC 46**: Adjust particle count (0-5000)
- **CC 69**: Control bloom strength (0-3)
- **CC 97**: Adjust beat detection sensitivity (0.1-2.0)

## 🎨 Creating Visual Performances

### Basic Performance Workflow

1. **Prepare Videos**
   - Load multiple videos with varying content
   - Mix abstract, concrete, and textured visuals
   - Consider video length and pacing

2. **Setup Audio**
   - Test microphone levels
   - Adjust audio reactivity parameters
   - Set beat detection sensitivity

3. **Map MIDI Controller**
   - Assign frequently-used parameters to easy-to-reach controls
   - Use MIDI learn for custom mappings
   - Save your mappings as presets

4. **Perform**
   - Manipulate video effects in real-time
   - Trigger scene changes with video transitions
   - React to audio input with parameter adjustments

### Tips

- **Layer Effects**: Combine multiple effects for complex visuals
- **Audio Reactivity**: Use CC 91-98 to modulate effects with audio
- **Presets**: Save interesting combinations for quick recall
- **Performance**: Monitor FPS and reduce particle count if needed

## 🍎 Apple Silicon Optimization

This application is optimized specifically for Apple Silicon Macs (M1, M2, M3):

- WebGL 2.0 with Metal backend hints
- Instanced rendering for particles
- Half-float textures for reduced memory
- Optimized video texture updates
- Efficient shader compilation
- High-performance rendering mode

See [OPTIMIZATION.md](./OPTIMIZATION.md) for detailed performance tuning.

### Performance Targets (M1/M2/M3)

- **60 FPS** at 1920x1080 (retina)
- **5000 particles** sustained
- **<100ms** video switching time
- **<10ms** audio latency
- **<16ms** frame time (consistent)

## 📁 Project Structure

```
video-synth-sequencer/
├── index.html              # Main HTML file
├── package.json            # Dependencies
├── src/
│   ├── main.js            # Application entry point
│   ├── audio/             # Audio analysis system
│   ├── midi/              # MIDI control system
│   ├── video/             # Video management
│   ├── shaders/           # GLSL shaders
│   ├── gui/               # UI components (future)
│   └── utils/             # Utilities
├── presets/               # Example presets (future)
├── README.md              # This file
├── MIDI_MAP.md           # Complete MIDI reference
└── OPTIMIZATION.md        # Performance guide
```

## 🔧 Troubleshooting

### MIDI Not Working

- **Browser Support**: Use Chrome or Edge (best Web MIDI support)
- **Permissions**: Ensure site has MIDI access permission
- **Device Connection**: Connect MIDI device before loading page or refresh after connecting
- **CC Range**: Only CC 35-98 are recognized

### Audio Not Working

- **Microphone Permission**: Grant microphone access when prompted
- **Input Selection**: Check system audio settings for correct input device
- **Latency**: Close other audio applications for best performance
- **Browser**: Some browsers require HTTPS for microphone access

### Video Not Playing

- **Format**: Ensure video is MP4, MOV, or WEBM
- **Codec**: H.264 video codec recommended for best compatibility
- **Size**: Large files may take time to load; check console for errors
- **Autoplay**: Some browsers block autoplay; click play manually

### Performance Issues

- **Reduce Particles**: Lower particle count (CC 46)
- **Simplify Effects**: Disable heavy post-processing effects
- **Video Resolution**: Use 1080p or lower resolution videos
- **Close Apps**: Close other applications for more resources
- **Check Stats**: Press `G` to view FPS and performance stats

## 🎓 Advanced Usage

### Custom MIDI Mappings

1. Open MIDI Map panel (`M` key)
2. Click "MIDI Learn" button next to parameter
3. Move desired MIDI controller
4. Mapping is saved automatically

### Exporting Presets

```javascript
// In browser console
app.stateManager.exportState(app.params, 'my-preset.json');
```

### Importing Presets

1. Use file picker in control panel
2. Select previously exported JSON file
3. State loads automatically

## 🛠️ Development

### Technology Stack

- **Three.js**: 3D graphics and rendering
- **Web MIDI API**: MIDI device communication
- **Web Audio API**: Audio analysis and processing
- **Vite**: Build tool and dev server
- **Vanilla JavaScript**: No framework dependencies

### Building from Source

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📝 License

MIT License - feel free to use for any purpose

## 🙏 Credits

Created with love for the VJ and audiovisual performance community.

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Enjoy creating stunning audiovisual experiences!** 🎨🎵✨
