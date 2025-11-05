/**
 * OptimizationUtils.js
 * Apple Silicon detection and WebGL/Metal optimization utilities
 */

export class OptimizationUtils {
  /**
   * Detect if running on Apple Silicon
   * @returns {boolean}
   */
  static isAppleSilicon() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

      if (!gl) return false;

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer && renderer.includes('Apple')) return true;
      }

      // Fallback detection
      return navigator.userAgent.includes('Macintosh') &&
             navigator.hardwareConcurrency >= 8;
    } catch (error) {
      console.warn('Apple Silicon detection failed:', error);
      return false;
    }
  }

  /**
   * Configure Three.js renderer for optimal performance on Apple Silicon
   * @param {THREE.WebGLRenderer} renderer
   * @returns {THREE.WebGLRenderer}
   */
  static configureRenderer(renderer) {
    const isAppleSilicon = this.isAppleSilicon();

    if (isAppleSilicon) {
      // Apple Silicon specific optimizations
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
      renderer.powerPreference = 'high-performance';

      // Enable Metal-optimized extensions
      const gl = renderer.getContext();

      // Try to enable performance-enhancing extensions
      const extensions = [
        'EXT_color_buffer_half_float',
        'WEBGL_draw_buffers',
        'ANGLE_instanced_arrays',
        'OES_vertex_array_object',
        'WEBGL_compressed_texture_etc',
        'EXT_texture_filter_anisotropic'
      ];

      extensions.forEach(ext => {
        try {
          gl.getExtension(ext);
        } catch (e) {
          console.warn(`Extension ${ext} not available`);
        }
      });
    } else {
      // Standard optimizations for other platforms
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.powerPreference = 'high-performance';
    }

    return renderer;
  }

  /**
   * Get optimal particle count based on device capabilities
   * @returns {number}
   */
  static getOptimalParticleCount() {
    const isAppleSilicon = this.isAppleSilicon();
    const cores = navigator.hardwareConcurrency || 4;

    if (isAppleSilicon) {
      return cores >= 10 ? 5000 : 3000; // M1 Pro/Max vs base M1
    }

    return cores >= 8 ? 3000 : 2000;
  }

  /**
   * Get optimal video texture size
   * @returns {number}
   */
  static getOptimalVideoSize() {
    const isAppleSilicon = this.isAppleSilicon();
    return isAppleSilicon ? 1920 : 1280; // 1080p vs 720p
  }

  /**
   * Get optimal FFT size for audio analysis
   * @returns {number}
   */
  static getOptimalFFTSize() {
    const isAppleSilicon = this.isAppleSilicon();
    return isAppleSilicon ? 2048 : 1024;
  }

  /**
   * Monitor performance and suggest optimizations
   * @param {object} stats - Performance statistics
   * @returns {string[]} - Array of optimization suggestions
   */
  static analyzePer formance(stats) {
    const suggestions = [];

    if (stats.fps < 55) {
      suggestions.push('FPS below target: Consider reducing particle count or post-processing effects');
    }

    if (stats.drawCalls > 500) {
      suggestions.push('High draw call count: Enable more geometry batching');
    }

    if (stats.memory && stats.memory > 2000) {
      suggestions.push('High memory usage: Check for texture leaks or dispose unused resources');
    }

    if (stats.triangles > 1000000) {
      suggestions.push('High polygon count: Implement LOD or reduce geometry complexity');
    }

    return suggestions;
  }

  /**
   * Create optimized texture settings
   * @param {boolean} useHalfFloat
   * @returns {object}
   */
  static getTextureSettings(useHalfFloat = true) {
    const isAppleSilicon = this.isAppleSilicon();

    return {
      format: THREE.RGBAFormat,
      type: useHalfFloat && isAppleSilicon ? THREE.HalfFloatType : THREE.UnsignedByteType,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: true,
      anisotropy: isAppleSilicon ? 16 : 4
    };
  }

  /**
   * Batch dispose Three.js resources
   * @param {object[]} resources
   */
  static disposeResources(resources) {
    resources.forEach(resource => {
      if (resource && typeof resource.dispose === 'function') {
        resource.dispose();
      }
    });
  }

  /**
   * Create object pool for performance
   * @param {Function} factory - Function to create new objects
   * @param {number} initialSize
   * @returns {object} - Pool object with get/release methods
   */
  static createObjectPool(factory, initialSize = 100) {
    const pool = [];
    const active = new Set();

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      pool.push(factory());
    }

    return {
      get() {
        const obj = pool.length > 0 ? pool.pop() : factory();
        active.add(obj);
        return obj;
      },

      release(obj) {
        if (active.has(obj)) {
          active.delete(obj);
          pool.push(obj);
        }
      },

      clear() {
        pool.length = 0;
        active.clear();
      },

      get size() {
        return { available: pool.length, active: active.size };
      }
    };
  }
}
