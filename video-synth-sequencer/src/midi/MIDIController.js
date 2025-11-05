/**
 * MIDIController.js
 * MIDI Web API wrapper for CC 35-98
 */

export class MIDIController {
  constructor() {
    this.midiAccess = null;
    this.inputs = new Map();
    this.activeDevice = null;
    this.isEnabled = false;

    // STRICT CC RANGE: 35-98 inclusive (64 total CCs)
    this.ccRange = { min: 35, max: 98 };

    // Callbacks
    this.onCCCallback = null;
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * Request MIDI access and initialize
   * @returns {Promise<boolean>}
   */
  async initialize() {
    try {
      if (!navigator.requestMIDIAccess) {
        throw new Error('Web MIDI API not supported in this browser');
      }

      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.isEnabled = true;

      console.log('MIDI Access granted');

      // Set up state change listener
      this.midiAccess.onstatechange = this.handleStateChange.bind(this);

      // Enumerate existing inputs
      this.enumerateInputs();

      if (this.onConnectCallback) {
        this.onConnectCallback({ status: 'connected', deviceCount: this.inputs.size });
      }

      return true;
    } catch (error) {
      console.error('MIDI initialization failed:', error);
      this.isEnabled = false;

      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }

      return false;
    }
  }

  /**
   * Enumerate MIDI input devices
   */
  enumerateInputs() {
    if (!this.midiAccess) return;

    this.inputs.clear();

    for (const input of this.midiAccess.inputs.values()) {
      this.inputs.set(input.id, input);
      input.onmidimessage = this.handleMIDIMessage.bind(this);

      console.log(`MIDI Input: ${input.name} (${input.manufacturer})`);

      // Set first device as active if none selected
      if (!this.activeDevice) {
        this.activeDevice = input;
      }
    }
  }

  /**
   * Handle MIDI state changes (device connect/disconnect)
   * @param {MIDIConnectionEvent} event
   */
  handleStateChange(event) {
    const port = event.port;

    console.log(`MIDI ${port.state}: ${port.name}`);

    if (port.type === 'input') {
      if (port.state === 'connected') {
        this.inputs.set(port.id, port);
        port.onmidimessage = this.handleMIDIMessage.bind(this);

        if (!this.activeDevice) {
          this.activeDevice = port;
        }

        if (this.onConnectCallback) {
          this.onConnectCallback({
            status: 'device-connected',
            device: { id: port.id, name: port.name }
          });
        }
      } else if (port.state === 'disconnected') {
        this.inputs.delete(port.id);

        if (this.activeDevice && this.activeDevice.id === port.id) {
          this.activeDevice = this.inputs.values().next().value || null;
        }

        if (this.onDisconnectCallback) {
          this.onDisconnectCallback({
            status: 'device-disconnected',
            device: { id: port.id, name: port.name }
          });
        }
      }
    }
  }

  /**
   * Handle incoming MIDI messages
   * @param {MIDIMessageEvent} event
   */
  handleMIDIMessage(event) {
    const [status, data1, data2] = event.data;

    // Check if it's a Control Change message (0xB0-0xBF)
    const messageType = status & 0xF0;
    const channel = status & 0x0F;

    if (messageType === 0xB0) { // Control Change
      const cc = data1;
      const value = data2;

      // Only process CCs in range 35-98
      if (cc >= this.ccRange.min && cc <= this.ccRange.max) {
        if (this.onCCCallback) {
          this.onCCCallback({
            cc,
            value,
            channel,
            normalized: value / 127,
            timestamp: event.timeStamp
          });
        }
      }
    }
  }

  /**
   * Register callback for CC messages
   * @param {Function} callback
   */
  onCC(callback) {
    this.onCCCallback = callback;
  }

  /**
   * Register callback for connection events
   * @param {Function} callback
   */
  onConnect(callback) {
    this.onConnectCallback = callback;
  }

  /**
   * Register callback for disconnection events
   * @param {Function} callback
   */
  onDisconnect(callback) {
    this.onDisconnectCallback = callback;
  }

  /**
   * Register callback for errors
   * @param {Function} callback
   */
  onError(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * Get active device name
   * @returns {string}
   */
  getActiveDeviceName() {
    return this.activeDevice ? this.activeDevice.name : 'No MIDI device';
  }

  /**
   * Get list of all connected devices
   * @returns {array}
   */
  getDeviceList() {
    return Array.from(this.inputs.values()).map(input => ({
      id: input.id,
      name: input.name,
      manufacturer: input.manufacturer,
      state: input.state,
      isActive: this.activeDevice && this.activeDevice.id === input.id
    }));
  }

  /**
   * Set active device by ID
   * @param {string} deviceId
   * @returns {boolean}
   */
  setActiveDevice(deviceId) {
    const device = this.inputs.get(deviceId);

    if (device) {
      this.activeDevice = device;
      console.log(`Active MIDI device set to: ${device.name}`);
      return true;
    }

    console.warn(`Device with ID ${deviceId} not found`);
    return false;
  }

  /**
   * Get CC range info
   * @returns {object}
   */
  getCCRange() {
    return {
      min: this.ccRange.min,
      max: this.ccRange.max,
      count: this.ccRange.max - this.ccRange.min + 1
    };
  }

  /**
   * Check if controller is enabled
   * @returns {boolean}
   */
  isReady() {
    return this.isEnabled && this.midiAccess !== null;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    if (this.midiAccess) {
      for (const input of this.inputs.values()) {
        input.onmidimessage = null;
      }

      this.inputs.clear();
      this.activeDevice = null;
      this.midiAccess = null;
      this.isEnabled = false;

      console.log('MIDI disconnected');
    }
  }
}
