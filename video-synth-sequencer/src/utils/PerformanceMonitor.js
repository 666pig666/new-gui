/**
 * PerformanceMonitor.js
 * FPS, memory, and performance tracking
 */

export class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsUpdateInterval = 1000; // Update FPS every second
    this.frameTimings = [];
    this.maxFrameTimings = 60;

    this.stats = {
      fps: 0,
      frameTime: 0,
      memory: 0,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0
    };

    this.callbacks = new Set();
    this.isRunning = false;
  }

  /**
   * Start monitoring
   */
  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Update performance stats (call every frame)
   * @param {THREE.WebGLRenderer} renderer - Three.js renderer for stats
   */
  update(renderer = null) {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    this.frameCount++;
    this.frameTimings.push(deltaTime);

    if (this.frameTimings.length > this.maxFrameTimings) {
      this.frameTimings.shift();
    }

    // Update FPS every second
    if (deltaTime >= this.fpsUpdateInterval) {
      this.stats.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.stats.frameTime = this.getAverageFrameTime();

      this.frameCount = 0;
      this.lastTime = currentTime;

      // Update memory stats if available
      if (performance.memory) {
        this.stats.memory = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
      }

      // Update Three.js renderer stats
      if (renderer && renderer.info) {
        this.stats.drawCalls = renderer.info.render.calls;
        this.stats.triangles = renderer.info.render.triangles;
        this.stats.geometries = renderer.info.memory.geometries;
        this.stats.textures = renderer.info.memory.textures;
      }

      // Notify callbacks
      this.notifyCallbacks();
    }
  }

  /**
   * Get average frame time
   * @returns {number}
   */
  getAverageFrameTime() {
    if (this.frameTimings.length === 0) return 0;
    const sum = this.frameTimings.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.frameTimings.length * 10) / 10;
  }

  /**
   * Get current stats
   * @returns {object}
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Register callback for stats updates
   * @param {Function} callback
   */
  onChange(callback) {
    this.callbacks.add(callback);
  }

  /**
   * Unregister callback
   * @param {Function} callback
   */
  offChange(callback) {
    this.callbacks.delete(callback);
  }

  /**
   * Notify all registered callbacks
   */
  notifyCallbacks() {
    this.callbacks.forEach(callback => {
      try {
        callback(this.stats);
      } catch (error) {
        console.error('Performance monitor callback error:', error);
      }
    });
  }

  /**
   * Get performance grade
   * @returns {string}
   */
  getPerformanceGrade() {
    if (this.stats.fps >= 60) return 'Excellent';
    if (this.stats.fps >= 55) return 'Good';
    if (this.stats.fps >= 45) return 'Fair';
    if (this.stats.fps >= 30) return 'Poor';
    return 'Critical';
  }

  /**
   * Check if performance is acceptable
   * @returns {boolean}
   */
  isPerformanceAcceptable() {
    return this.stats.fps >= 55 && this.stats.frameTime < 20;
  }

  /**
   * Get formatted stats string
   * @returns {string}
   */
  getFormattedStats() {
    return `FPS: ${this.stats.fps} | Frame: ${this.stats.frameTime}ms | ` +
           `Draw Calls: ${this.stats.drawCalls} | Triangles: ${this.stats.triangles.toLocaleString()} | ` +
           `Memory: ${this.stats.memory}MB`;
  }

  /**
   * Log performance report
   */
  logReport() {
    console.log('=== Performance Report ===');
    console.log(`FPS: ${this.stats.fps}`);
    console.log(`Frame Time: ${this.stats.frameTime}ms`);
    console.log(`Memory: ${this.stats.memory}MB`);
    console.log(`Draw Calls: ${this.stats.drawCalls}`);
    console.log(`Triangles: ${this.stats.triangles.toLocaleString()}`);
    console.log(`Geometries: ${this.stats.geometries}`);
    console.log(`Textures: ${this.stats.textures}`);
    console.log(`Grade: ${this.getPerformanceGrade()}`);
    console.log('========================');
  }

  /**
   * Reset all stats
   */
  reset() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTimings = [];
    this.stats = {
      fps: 0,
      frameTime: 0,
      memory: 0,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0
    };
  }
}
