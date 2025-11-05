# 🎹 MIDI CC Map Reference

Complete reference for all 64 MIDI CC mappings (CC 35-98).

## Overview

The Video Synth Sequencer uses MIDI Control Change (CC) messages in the range **35-98** (64 total CCs) for real-time parameter control.

- **Range**: CC 35-98 (inclusive)
- **Resolution**: 0-127 MIDI values (7-bit)
- **Mappings**: Fixed by default, customizable via MIDI Learn
- **Persistence**: Saved to localStorage

## 🎬 Video Effects (CC 35-45)

| CC | Parameter | Range | Default | Description |
|----|-----------|-------|---------|-------------|
| **35** | Video Playback Speed | 0.25x - 4.0x | 1.0x | Control video playback rate |
| **36** | Video Opacity | 0.0 - 1.0 | 1.0 | Video transparency (0=invisible, 1=opaque) |
| **37** | Video Saturation | -1.0 - 2.0 | 1.0 | Color saturation (-1=grayscale, 2=super saturated) |
| **38** | Video Hue Shift | 0 - 360° | 0° | Rotate colors through hue spectrum |
| **39** | Video Brightness | -1.0 - 1.0 | 0.0 | Brightness adjustment |
| **40** | Video Contrast | 0.0 - 2.0 | 1.0 | Contrast level (0=gray, 2=high contrast) |
| **41** | Video Blur | 0 - 20px | 0px | Gaussian blur amount |
| **42** | Chromatic Aberration | 0.0 - 0.05 | 0.0 | RGB color channel separation |
| **43** | Video Scale | 0.5 - 3.0 | 1.0 | Video size multiplier |
| **44** | Video Rotation Speed | -2.0 - 2.0 | 0.0 | Continuous rotation (rad/s) |
| **45** | Kaleidoscope Segments | 1 - 12 | 1 | Kaleidoscope mirror segments (1=off) |

### Usage Examples

- **CC 35**: Slow-motion (value 32) or fast-forward (value 100+)
- **CC 38**: Color cycling effects by slowly sweeping hue
- **CC 41**: Dream-like blur effects for transitions
- **CC 45**: Psychedelic kaleidoscope patterns

## ✨ Particle System (CC 46-57)

| CC | Parameter | Range | Default | Description |
|----|-----------|-------|---------|-------------|
| **46** | Particle Count | 0 - 5000 | 1000 | Number of active particles |
| **47** | Particle Size | 0.1 - 20.0 | 2.0 | Base particle size in pixels |
| **48** | Particle Speed | 0.0 - 10.0 | 1.0 | Movement speed multiplier |
| **49** | Particle Spread | 0 - 100 | 20 | Spatial distribution area |
| **50** | Particle Lifetime | 0.5 - 10.0s | 3.0s | How long particles live |
| **51** | Particle Gravity | -5.0 - 5.0 | 0.0 | Gravity force (negative=up) |
| **52** | Particle Turbulence | 0.0 - 5.0 | 0.0 | Random motion noise |
| **53** | Particle Trail Length | 0 - 50 | 0 | Motion blur trail |
| **54** | Audio Reactivity | 0.0 - 2.0 | 0.5 | How much audio affects particles |
| **55** | Particle Color Hue | 0 - 360° | 200° | Base color hue |
| **56** | Particle Opacity | 0.0 - 1.0 | 0.8 | Particle transparency |
| **57** | Emission Rate | 0 - 200/s | 50/s | New particles per second |

### Performance Notes

- High particle counts (CC 46 >3000) may impact FPS on non-Apple Silicon devices
- Combine with audio reactivity (CC 54) for dynamic particle behavior
- Use CC 51 (gravity) creatively for waterfall or floating effects

## 🔷 Geometry/Mesh Effects (CC 58-68)

| CC | Parameter | Range | Default | Description |
|----|-----------|-------|---------|-------------|
| **58** | Mesh Displacement | 0.0 - 5.0 | 0.0 | Vertex displacement amount |
| **59** | Mesh Rotation X | -π - π | 0.0 | X-axis rotation |
| **60** | Mesh Rotation Y | -π - π | 0.0 | Y-axis rotation |
| **61** | Mesh Rotation Z | -π - π | 0.0 | Z-axis rotation |
| **62** | Mesh Scale | 0.1 - 5.0 | 1.0 | Mesh size multiplier |
| **63** | Wireframe Thickness | 0.0 - 5.0 | 0.0 | Wireframe line width (0=off) |
| **64** | Vertex Noise | 0.0 - 2.0 | 0.0 | Procedural vertex distortion |
| **65** | Mesh Opacity | 0.0 - 1.0 | 1.0 | Mesh transparency |
| **66** | Normal Map Strength | 0.0 - 2.0 | 1.0 | Surface detail intensity |
| **67** | Metalness | 0.0 - 1.0 | 0.5 | PBR metallic property |
| **68** | Roughness | 0.0 - 1.0 | 0.5 | PBR roughness property |

### Creative Tips

- Animate rotations (CC 59-61) for continuous spinning effects
- Combine displacement (CC 58) with audio for pulsing geometry
- Use wireframe mode (CC 63) for technical aesthetics

## 🌈 Post-Processing (CC 69-80)

| CC | Parameter | Range | Default | Description |
|----|-----------|-------|---------|-------------|
| **69** | Bloom Strength | 0.0 - 3.0 | 0.5 | Glow intensity |
| **70** | Bloom Threshold | 0.0 - 1.0 | 0.5 | Brightness threshold for bloom |
| **71** | Bloom Radius | 0.0 - 1.0 | 0.5 | Bloom spread distance |
| **72** | Glitch Intensity | 0.0 - 1.0 | 0.0 | Digital glitch effect |
| **73** | RGB Split | 0.0 - 0.1 | 0.0 | Color channel separation |
| **74** | Pixelation | 1 - 100 | 1 | Pixel grid size (1=off) |
| **75** | Vignette Strength | 0.0 - 1.0 | 0.0 | Edge darkening |
| **76** | Film Grain | 0.0 - 1.0 | 0.0 | Analog film noise |
| **77** | Color Temp | -1.0 - 1.0 | 0.0 | Warm/cool color balance |
| **78** | Color Tint | -1.0 - 1.0 | 0.0 | Magenta/green tint |
| **79** | Distortion | 0.0 - 1.0 | 0.0 | Lens distortion effect |
| **80** | Feedback | 0.0 - 0.95 | 0.0 | Recursive frame feedback |

### Effect Combinations

- **Cyberpunk Look**: Glitch (CC 72) + RGB Split (CC 73) + Bloom (CC 69)
- **Dreamy**: Bloom (CC 69) + Vignette (CC 75) + Warm temp (CC 77)
- **Retro**: Pixelation (CC 74) + Film grain (CC 76)
- **Psychedelic**: Feedback (CC 80) + Distortion (CC 79) + Hue shift (CC 38)

## 📷 Camera & Scene (CC 81-90)

| CC | Parameter | Range | Default | Description |
|----|-----------|-------|---------|-------------|
| **81** | Camera FOV | 20° - 120° | 75° | Field of view angle |
| **82** | Camera Position X | -50 - 50 | 0 | Left/right position |
| **83** | Camera Position Y | -50 - 50 | 0 | Up/down position |
| **84** | Camera Position Z | -50 - 50 | 30 | Forward/back position (distance) |
| **85** | Camera Rotation Speed | 0.0 - 2.0 | 0.0 | Auto-rotation speed |
| **86** | Camera Shake | 0.0 - 5.0 | 0.0 | Random shake intensity |
| **87** | Background Color Hue | 0 - 360° | 220° | Scene background hue |
| **88** | Background Brightness | 0.0 - 1.0 | 0.1 | Background luminosity |
| **89** | Fog Density | 0.0 - 0.1 | 0.0 | Atmospheric fog amount |
| **90** | Fog Color Hue | 0 - 360° | 200° | Fog color hue |

### Camera Movement Tips

- **Dolly Zoom**: Adjust FOV (CC 81) while changing position Z (CC 84)
- **Dynamic Shots**: Use rotation speed (CC 85) for orbiting camera
- **Impact**: Add shake (CC 86) during beat hits
- **Mood**: Match background color (CC 87) to content theme

## 🎵 Audio Reactive Modulation (CC 91-98)

| CC | Parameter | Range | Default | Description |
|----|-----------|-------|---------|-------------|
| **91** | Bass → Particle Size | 0.0 - 2.0 | 0.0 | Bass modulates particle size |
| **92** | Mid → Color Shift | 0.0 - 2.0 | 0.0 | Mids modulate hue rotation |
| **93** | Treble → Bloom | 0.0 - 2.0 | 0.0 | Treble modulates bloom glow |
| **94** | Kick → Flash | 0.0 - 2.0 | 0.0 | Kick drum triggers flash |
| **95** | Overall → Scale Pulse | 0.0 - 2.0 | 0.0 | Overall audio scales scene |
| **96** | Audio Smoothing | 0.0 - 0.99 | 0.8 | Analysis smoothing factor |
| **97** | Beat Sensitivity | 0.1 - 2.0 | 1.0 | Beat detection threshold |
| **98** | Global Audio Intensity | 0.0 - 3.0 | 1.0 | Master audio reactivity |

### Audio Reactivity Setup

1. **Set Sensitivity** (CC 97): Start at 1.0, adjust based on audio source
2. **Enable Modulations** (CC 91-95): Set to 0.5-1.0 for moderate effect
3. **Adjust Smoothing** (CC 96): Higher = smoother, lower = more responsive
4. **Scale Intensity** (CC 98): Master control for all audio effects

### Recommended Settings by Genre

**Electronic/EDM**
- CC 91 (Bass → Size): 1.0-1.5
- CC 94 (Kick → Flash): 1.0-2.0
- CC 97 (Sensitivity): 1.2-1.5

**Ambient/Downtempo**
- CC 96 (Smoothing): 0.9
- CC 92 (Mid → Color): 0.5-1.0
- CC 97 (Sensitivity): 0.5-0.8

**Live Instruments**
- CC 96 (Smoothing): 0.7-0.8
- CC 95 (Overall → Scale): 0.5-1.0
- CC 97 (Sensitivity): 0.8-1.2

## 🎛️ MIDI Learn

### How to Use MIDI Learn

1. Open MIDI Map panel (press `M`)
2. Find parameter you want to remap
3. Click "Learn" button next to parameter
4. Move the MIDI controller you want to assign
5. Mapping saved automatically

### Custom Mapping Tips

- **Group Controls**: Map related parameters to neighboring faders/knobs
- **Accessibility**: Put frequently-used controls in easy-to-reach positions
- **Performance**: Dedicate one knob to "global intensity" (CC 98)
- **Backup**: Export your mappings before creating new ones

### Exporting Mappings

```javascript
// Save mappings to file
app.midiMapper.saveMappings();

// Export as JSON
const mappings = app.midiMapper.exportMappings();
console.log(JSON.stringify(mappings, null, 2));
```

## 🎯 Quick Reference by Use Case

### VJ Performance
**Essential Controls**: CC 35, 38, 46, 69, 81, 97
- Video speed, hue, particles, bloom, camera FOV, beat sensitivity

### Music Visualization
**Essential Controls**: CC 91, 93, 94, 95, 97, 98
- All audio reactive modulation CCs

### Abstract Visuals
**Essential Controls**: CC 45, 52, 64, 72, 79, 80
- Kaleidoscope, turbulence, noise, glitch, distortion, feedback

### Cinematic
**Essential Controls**: CC 39, 40, 75, 77, 81, 85
- Brightness, contrast, vignette, color temp, FOV, camera rotation

## 📊 Value Scaling

MIDI CC values (0-127) are automatically scaled to parameter ranges:

```
Scaled Value = Min + (MIDI_Value / 127) × (Max - Min)
```

**Example**: CC 35 (Video Speed, range 0.25-4.0)
- MIDI value 0 → 0.25x speed
- MIDI value 64 → 2.1x speed
- MIDI value 127 → 4.0x speed

## 🔄 Reset to Defaults

- **Keyboard**: Press `R`
- **UI**: Click "Reset All Effects" button
- **Code**: `app.resetAllEffects()`

All parameters return to their default values.

## 💾 Saving States

Your MIDI mappings and parameter values are automatically saved to localStorage. To manually save:

- **Current State**: Press `S`
- **Quick Preset**: Press `Shift + 1-9`
- **Load Preset**: Press `1-9`

---

**Master your MIDI controller to create stunning real-time visuals!** 🎹✨
