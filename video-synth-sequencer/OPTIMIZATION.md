# 🍎 Optimization Guide for Apple Silicon

Performance optimization strategies for M1, M2, and M3 Macs.

## Overview

The Video Synth Sequencer is specifically optimized for Apple Silicon's Metal-backed WebGL implementation. This guide covers performance tuning, benchmarking, and troubleshooting.

## 🎯 Performance Targets

### M1 (Base 8-core)
- **FPS**: 60 @ 1920x1080
- **Particles**: 3000 sustained
- **Audio Latency**: <10ms
- **Frame Time**: <16ms

### M1 Pro/Max (10-core+)
- **FPS**: 60 @ 2560x1440
- **Particles**: 5000 sustained
- **Audio Latency**: <8ms
- **Frame Time**: <14ms

### M2/M3
- **FPS**: 60 @ 2560x1440
- **Particles**: 5000 sustained
- **Audio Latency**: <8ms
- **Frame Time**: <12ms

## 🔧 WebGL/Metal Optimizations

### Automatic Optimizations

The application automatically detects Apple Silicon and enables:

1. **High-Performance Mode**
   ```javascript
   renderer.powerPreference = 'high-performance';
   ```

2. **Optimized Pixel Ratio**
   ```javascript
   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
   ```

3. **Metal-Optimized Extensions**
   - `EXT_color_buffer_half_float` - Reduced memory bandwidth
   - `WEBGL_draw_buffers` - Multiple render targets
   - `ANGLE_instanced_arrays` - Efficient particle rendering
   - `EXT_texture_filter_anisotropic` - Better texture quality

### Manual Tuning

#### 1. Reduce Pixel Ratio (Retina Displays)

```javascript
// In OptimizationUtils.js, modify:
renderer.setPixelRatio(1.5); // Instead of 2.0
```

**Impact**: 25% less pixels to render, ~40% FPS gain

#### 2. Adjust FFT Size

```javascript
// In main.js or console:
app.audioEngine.setFFTSize(1024); // Default: 2048
```

**Impact**: Faster audio analysis, slight quality reduction

#### 3. Limit Particle Count

Use MIDI CC 46 or:
```javascript
app.params.particleCount = 2000; // Default: 1000, Max: 5000
```

**Impact**: Linear performance scaling with particle count

## 📊 Performance Monitoring

### Built-in Stats

Press `G` to view real-time stats:
- **FPS**: Target 60, acceptable >55
- **Frame Time**: Target <16ms
- **Draw Calls**: Target <500
- **Memory**: Target <2GB

### Chrome DevTools

1. **Performance Panel** (⌘+Shift+E)
   - Record 5-10 seconds
   - Look for long frames (>16ms)
   - Check JavaScript execution time

2. **Memory Panel**
   - Take heap snapshots
   - Monitor for memory leaks
   - Check texture memory

3. **Rendering Panel**
   - Enable "FPS Meter"
   - Enable "Paint Flashing"
   - Check "Layer Borders"

### Console Commands

```javascript
// Performance report
app.performanceMonitor.logReport();

// Get optimization suggestions
const stats = app.performanceMonitor.getStats();
const suggestions = OptimizationUtils.analyzePerformance(stats);
console.log(suggestions);

// Check if Apple Silicon
console.log('Apple Silicon:', OptimizationUtils.isAppleSilicon());

// Audio latency info
console.log('Audio Latency:', app.audioEngine.getLatencyInfo());
```

## 🎬 Video Optimization

### Recommended Video Settings

**Resolution**: 1920x1080 (1080p)
- Higher resolutions work but may reduce FPS
- 4K only on M1 Pro/Max/M2/M3

**Codec**: H.264
- Best browser compatibility
- Hardware accelerated on Apple Silicon
- Use "High Profile" for quality

**Bitrate**: 5-15 Mbps
- Lower bitrate = faster loading
- Higher bitrate = better quality
- Test on your specific device

**Frame Rate**: 30 or 60 fps
- Match your target output frame rate
- Variable frame rate may cause stuttering

### Video Encoding (FFmpeg)

```bash
# Recommended encoding for best performance
ffmpeg -i input.mov -c:v libx264 -profile:v high \
  -preset slow -crf 20 -s 1920x1080 -r 30 \
  -c:a aac -b:a 128k output.mp4

# Smaller file size (faster loading)
ffmpeg -i input.mov -c:v libx264 -profile:v high \
  -preset medium -crf 23 -s 1920x1080 -r 30 \
  -c:a aac -b:a 96k output.mp4

# High quality (larger file)
ffmpeg -i input.mov -c:v libx264 -profile:v high \
  -preset slower -crf 18 -s 1920x1080 -r 60 \
  -c:a aac -b:a 192k output.mp4
```

### Video Texture Optimization

The application implements:

1. **Preloading**: Next video loads during current playback
2. **Hardware Acceleration**: Uses video element's native decoder
3. **Texture Caching**: Reuses texture objects when possible
4. **Format Detection**: Automatically selects optimal texture format

### Troubleshooting Video Performance

**Issue**: Stuttering during video playback

**Solutions**:
1. Reduce video resolution to 720p
2. Re-encode with lower bitrate
3. Disable heavy post-processing effects (bloom, blur)
4. Reduce particle count

**Issue**: Slow video switching

**Solutions**:
1. Use smaller video files
2. Ensure videos are pre-loaded (check console)
3. Use SSD for video storage
4. Reduce video count in playlist

## 🎵 Audio Optimization

### Low Latency Configuration

The application uses:

```javascript
// Audio context with minimal latency
new AudioContext({
  latencyHint: 'interactive',
  sampleRate: 48000
});

// Microphone with zero latency setting
getUserMedia({
  audio: {
    latency: 0,
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false
  }
});
```

### FFT Size vs. Performance

| FFT Size | Latency | CPU Usage | Frequency Resolution |
|----------|---------|-----------|---------------------|
| 512      | ~10ms   | Low       | Low                 |
| 1024     | ~20ms   | Medium    | Medium              |
| **2048** | ~40ms   | **Medium**| **High** (default)  |
| 4096     | ~80ms   | High      | Very High           |

**Recommendation**: Use 2048 for best quality/performance balance on Apple Silicon

### Audio Processing Tips

1. **Close Other Audio Apps**: Reduce system audio processing load
2. **Use Quality Microphone**: Better signal = better detection
3. **Adjust Gain**: Set input level to 70-80% in system preferences
4. **Room Acoustics**: Reduce echo and background noise

## 🎨 Shader Optimization

### Current Implementation

Shaders are already optimized for Metal:

1. **Precision**: Uses `mediump` where possible
2. **Branching**: Minimal dynamic branching
3. **Uniforms**: Batched updates
4. **Texture Lookups**: Minimized and cached

### Custom Shader Tips

If adding custom shaders:

```glsl
// Good: Use mediump for color calculations
varying mediump vec3 vColor;

// Good: Avoid dynamic loops
for (int i = 0; i < 8; i++) { // Fixed count
  // ...
}

// Bad: Dynamic branching in fragment shader
if (someVaryingValue > 0.5) { // Avoid if possible
  // ...
}

// Good: Use step() instead
float factor = step(0.5, someVaryingValue);
```

## 💾 Memory Optimization

### Memory Targets

- **Idle**: <500 MB
- **With Videos**: <1.5 GB
- **Heavy Use**: <2 GB

### Memory Management

The application implements:

1. **Texture Disposal**: Properly disposes old video textures
2. **Object Pooling**: Reuses particle buffers
3. **Weak Caching**: Uses WeakMap for temporary caches
4. **Resource Cleanup**: Disposes Three.js objects on removal

### Checking Memory

```javascript
// Current memory usage (Chrome only)
if (performance.memory) {
  const mb = performance.memory.usedJSHeapSize / 1048576;
  console.log(`Memory: ${mb.toFixed(0)} MB`);
}

// Three.js renderer stats
console.log('Geometries:', app.renderer.info.memory.geometries);
console.log('Textures:', app.renderer.info.memory.textures);
```

### Reducing Memory Usage

1. **Limit Video Count**: Keep <10 videos in playlist
2. **Reduce Video Resolution**: Use 720p instead of 1080p
3. **Lower Particle Count**: Reduce below 2000
4. **Disable History**: Disable undo/redo if not needed

## 🔥 Thermal Management

### Monitoring Temperature

Apple Silicon Macs have excellent thermal management, but for long sessions:

1. **Use iStat Menus** or similar to monitor temps
2. **Target**: CPU <80°C, GPU <70°C
3. **Throttling** starts around 90-95°C

### Reducing Heat

1. **Lower Frame Rate Cap**:
   ```javascript
   // Add to animate() function
   if (deltaTime < 1/30) return; // 30 FPS cap
   ```

2. **Reduce Pixel Ratio**:
   ```javascript
   renderer.setPixelRatio(1.0); // Non-retina
   ```

3. **Power Mode**: Use "Better Battery Life" instead of "Better Performance"

4. **External Cooling**: Use laptop stand with airflow

## ⚡ Battery Life (MacBook)

### Expected Battery Life

- **M1 MacBook Air**: 2-3 hours
- **M1 MacBook Pro 13"**: 3-4 hours
- **M1 Pro/Max 14"/16"**: 2.5-3.5 hours
- **M2 MacBook Air**: 2.5-3.5 hours

### Maximizing Battery

1. **Reduce Brightness**: Lower display brightness
2. **Limit Particles**: <2000 particles
3. **Simple Effects**: Disable heavy post-processing
4. **Close Other Apps**: Reduce system load
5. **Lower Resolution**: Use 1280x720 rendering

## 🎚️ Recommended Settings by Device

### M1 MacBook Air (8-core, 8GB)

```javascript
// Optimal settings
app.params.particleCount = 2000;
app.audioEngine.setFFTSize(1024);
renderer.setPixelRatio(1.5);

// MIDI CC recommendations
CC 46: 2000      // Particle count
CC 69: 0.3       // Bloom (reduced)
```

**Expected**: 60 FPS @ 1080p with light effects

### M1 MacBook Pro (8-core, 16GB)

```javascript
// Optimal settings
app.params.particleCount = 3000;
app.audioEngine.setFFTSize(2048);
renderer.setPixelRatio(2.0);

// MIDI CC recommendations
CC 46: 3000      // Particle count
CC 69: 0.5       // Bloom (standard)
```

**Expected**: 60 FPS @ 1080p with moderate effects

### M1 Pro/Max (10-core, 16GB+)

```javascript
// Maximum settings
app.params.particleCount = 5000;
app.audioEngine.setFFTSize(2048);
renderer.setPixelRatio(2.0);

// MIDI CC recommendations
CC 46: 5000      // Particle count (max)
CC 69: 1.0       // Bloom (full)
```

**Expected**: 60 FPS @ 1440p with all effects

### M2/M3

Same as M1 Pro/Max, with additional headroom for:
- Higher resolution (1440p+)
- More complex shaders
- Additional post-processing

## 🐛 Troubleshooting Performance Issues

### FPS Below 55

1. **Check Particle Count**: Reduce via CC 46
2. **Disable Bloom**: Set CC 69 to 0
3. **Lower Pixel Ratio**: Edit OptimizationUtils.js
4. **Check Other Apps**: Close Chrome tabs, apps
5. **Monitor CPU**: Use Activity Monitor

### High Frame Time (>20ms)

1. **Check Draw Calls**: Should be <500
   ```javascript
   console.log('Draw Calls:', app.renderer.info.render.calls);
   ```

2. **Reduce Geometry Complexity**
3. **Simplify Shaders**
4. **Disable Effects One by One** to identify culprit

### Audio Latency

1. **Check Latency**:
   ```javascript
   app.audioEngine.getLatencyInfo();
   ```

2. **Close Audio Apps**: Quit other apps using microphone
3. **Reduce FFT Size**: Lower to 1024
4. **Check System Preferences**: Ensure correct input device

### Memory Leaks

1. **Take Heap Snapshots** in Chrome DevTools
2. **Check for Growing Arrays**
3. **Verify Texture Disposal**:
   ```javascript
   // Should not grow continuously
   console.log('Textures:', app.renderer.info.memory.textures);
   ```

4. **Reset Application**: Press `R` to clear state

## 📈 Benchmarking

### Running Benchmarks

1. **Load Test Videos**: Add 5 different videos
2. **Enable All Effects**: Set all MIDI CCs to mid-range
3. **Run for 5 Minutes**: Monitor FPS
4. **Record Stats**:
   ```javascript
   app.performanceMonitor.logReport();
   ```

### Performance Checklist

- [ ] Stable 60 FPS in idle state
- [ ] Stable 55+ FPS with all effects
- [ ] <100ms video switching time
- [ ] <20ms average frame time
- [ ] <2GB memory usage
- [ ] <10ms audio latency
- [ ] No memory leaks after 30 min

## 🎓 Advanced Optimization

### Worker Thread for Audio

Future optimization (not yet implemented):

```javascript
// Offload FFT to worker thread
const audioWorker = new Worker('audio-processor.js');
audioWorker.postMessage(audioData);
```

### Shader Compilation

Pre-compile shaders on load:

```javascript
// Already implemented in OptimizationUtils
renderer.compile(scene, camera);
```

### Level of Detail (LOD)

Implement LOD for particles based on distance:

```javascript
// Reduce particle size when far from camera
const distance = camera.position.z;
const lodFactor = Math.max(0.5, Math.min(1.0, 50 / distance));
particleSize *= lodFactor;
```

## 📚 Resources

- [WebGL Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [Three.js Performance Tips](https://threejs.org/docs/#manual/en/introduction/Performance-tips)
- [Apple Metal Best Practices](https://developer.apple.com/metal/Metal-Best-Practices-Guide.pdf)
- [Web Audio API Performance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

---

**Optimized for peak performance on Apple Silicon!** 🍎⚡
