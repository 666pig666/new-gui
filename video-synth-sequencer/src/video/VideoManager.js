/**
 * VideoManager.js
 * Video loading, sequencing, and seamless playlist looping
 */

export class VideoManager {
  constructor() {
    this.videos = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.playbackRate = 1.0;

    // Callbacks
    this.onVideoChangeCallback = null;
    this.onVideoEndedCallback = null;
    this.onVideoLoadedCallback = null;
    this.onErrorCallback = null;

    // Supported formats
    this.supportedFormats = ['video/mp4', 'video/webm', 'video/quicktime'];
  }

  /**
   * Add video from file
   * @param {File} file
   * @returns {Promise<object>}
   */
  async addVideo(file) {
    try {
      // Check if format is supported
      if (!this.isSupportedFormat(file.type)) {
        throw new Error(`Unsupported video format: ${file.type}`);
      }

      // Create video element
      const video = document.createElement('video');
      video.preload = 'auto';
      video.playsinline = true;
      video.muted = false; // We want to hear if there's audio
      video.loop = false; // We handle looping manually
      video.crossOrigin = 'anonymous'; // For Three.js texture

      // Create object URL
      const url = URL.createObjectURL(file);
      video.src = url;

      // Wait for video to load metadata
      await new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', resolve);
        video.addEventListener('error', reject);
      });

      // Create video entry
      const videoEntry = {
        id: this.generateId(),
        name: file.name,
        element: video,
        url,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        file
      };

      // Add ended event listener
      video.addEventListener('ended', () => this.handleVideoEnded());

      // Add to list (maintaining upload order)
      this.videos.push(videoEntry);

      console.log(`Video added: ${file.name} (${video.videoWidth}x${video.videoHeight})`);

      // If this is the first video, start playing
      if (this.videos.length === 1) {
        await this.play();
      } else {
        // Preload if next in sequence
        const nextIndex = (this.currentIndex + 1) % this.videos.length;
        if (this.videos.indexOf(videoEntry) === nextIndex) {
          video.load();
        }
      }

      // Notify callback
      if (this.onVideoLoadedCallback) {
        this.onVideoLoadedCallback(videoEntry);
      }

      return videoEntry;
    } catch (error) {
      console.error('Failed to add video:', error);

      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }

      throw error;
    }
  }

  /**
   * Remove video by ID
   * @param {string} id
   * @returns {boolean}
   */
  removeVideo(id) {
    const index = this.videos.findIndex(v => v.id === id);

    if (index === -1) {
      return false;
    }

    const video = this.videos[index];

    // Clean up
    video.element.pause();
    video.element.src = '';
    URL.revokeObjectURL(video.url);

    // Remove from array
    this.videos.splice(index, 1);

    // Adjust current index if needed
    if (index < this.currentIndex) {
      this.currentIndex--;
    } else if (index === this.currentIndex && this.videos.length > 0) {
      this.currentIndex = Math.min(this.currentIndex, this.videos.length - 1);
      this.play();
    }

    console.log(`Video removed: ${video.name}`);

    return true;
  }

  /**
   * Reorder videos
   * @param {string} id
   * @param {number} newIndex
   */
  reorderVideo(id, newIndex) {
    const oldIndex = this.videos.findIndex(v => v.id === id);

    if (oldIndex === -1 || newIndex < 0 || newIndex >= this.videos.length) {
      return false;
    }

    // Move video
    const [video] = this.videos.splice(oldIndex, 1);
    this.videos.splice(newIndex, 0, video);

    // Update current index if needed
    if (oldIndex === this.currentIndex) {
      this.currentIndex = newIndex;
    } else if (oldIndex < this.currentIndex && newIndex >= this.currentIndex) {
      this.currentIndex--;
    } else if (oldIndex > this.currentIndex && newIndex <= this.currentIndex) {
      this.currentIndex++;
    }

    return true;
  }

  /**
   * Play current video
   */
  async play() {
    if (this.videos.length === 0) {
      return;
    }

    const current = this.getCurrentVideo();

    if (current) {
      try {
        current.element.playbackRate = this.playbackRate;
        await current.element.play();
        this.isPlaying = true;

        // Preload next video
        this.preloadNext();

        // Notify callback
        if (this.onVideoChangeCallback) {
          this.onVideoChangeCallback(current);
        }
      } catch (error) {
        console.error('Failed to play video:', error);

        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      }
    }
  }

  /**
   * Pause current video
   */
  pause() {
    const current = this.getCurrentVideo();

    if (current) {
      current.element.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Go to next video
   */
  nextVideo() {
    if (this.videos.length === 0) return;

    // Pause current
    this.pause();

    // Move to next (with looping)
    this.currentIndex = (this.currentIndex + 1) % this.videos.length;

    // Play new video
    this.play();
  }

  /**
   * Go to previous video
   */
  previousVideo() {
    if (this.videos.length === 0) return;

    // Pause current
    this.pause();

    // Move to previous (with looping)
    this.currentIndex = (this.currentIndex - 1 + this.videos.length) % this.videos.length;

    // Play new video
    this.play();
  }

  /**
   * Jump to specific video by index
   * @param {number} index
   */
  jumpToVideo(index) {
    if (index < 0 || index >= this.videos.length) return;

    this.pause();
    this.currentIndex = index;
    this.play();
  }

  /**
   * Handle video ended event
   */
  handleVideoEnded() {
    console.log('Video ended, moving to next');

    if (this.onVideoEndedCallback) {
      this.onVideoEndedCallback(this.getCurrentVideo());
    }

    // Automatically play next video (seamless loop)
    this.nextVideo();
  }

  /**
   * Preload next video in sequence
   */
  preloadNext() {
    if (this.videos.length <= 1) return;

    const nextIndex = (this.currentIndex + 1) % this.videos.length;
    const nextVideo = this.videos[nextIndex];

    if (nextVideo) {
      nextVideo.element.load();
    }
  }

  /**
   * Set playback speed
   * @param {number} rate - 0.25 to 4.0
   */
  setPlaybackRate(rate) {
    this.playbackRate = Math.max(0.25, Math.min(4.0, rate));

    const current = this.getCurrentVideo();
    if (current) {
      current.element.playbackRate = this.playbackRate;
    }
  }

  /**
   * Get current video
   * @returns {object|null}
   */
  getCurrentVideo() {
    return this.videos[this.currentIndex] || null;
  }

  /**
   * Get current video element
   * @returns {HTMLVideoElement|null}
   */
  getCurrentVideoElement() {
    const current = this.getCurrentVideo();
    return current ? current.element : null;
  }

  /**
   * Get all videos
   * @returns {array}
   */
  getAllVideos() {
    return this.videos.map((v, index) => ({
      id: v.id,
      name: v.name,
      duration: v.duration,
      width: v.width,
      height: v.height,
      isCurrent: index === this.currentIndex
    }));
  }

  /**
   * Check if format is supported
   * @param {string} mimeType
   * @returns {boolean}
   */
  isSupportedFormat(mimeType) {
    return this.supportedFormats.some(format => mimeType.includes(format));
  }

  /**
   * Generate unique ID
   * @returns {string}
   */
  generateId() {
    return `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register callbacks
   */
  onVideoChange(callback) {
    this.onVideoChangeCallback = callback;
  }

  onVideoEnded(callback) {
    this.onVideoEndedCallback = callback;
  }

  onVideoLoaded(callback) {
    this.onVideoLoadedCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * Clear all videos and cleanup
   */
  dispose() {
    // Stop and cleanup all videos
    this.videos.forEach(video => {
      video.element.pause();
      video.element.src = '';
      URL.revokeObjectURL(video.url);
    });

    this.videos = [];
    this.currentIndex = 0;
    this.isPlaying = false;

    console.log('VideoManager disposed');
  }

  /**
   * Get current state
   * @returns {object}
   */
  getState() {
    return {
      videoCount: this.videos.length,
      currentIndex: this.currentIndex,
      isPlaying: this.isPlaying,
      playbackRate: this.playbackRate,
      currentVideo: this.getCurrentVideo() ? {
        name: this.getCurrentVideo().name,
        duration: this.getCurrentVideo().duration,
        currentTime: this.getCurrentVideo().element.currentTime
      } : null
    };
  }
}
