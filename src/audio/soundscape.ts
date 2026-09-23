/**
 * Spatial Generative Soundscape (Web Audio API)
 * Sacred 432 Hz fundamental drone with harmonic overtones and procedural page rustle.
 * Conforms to French Light Luxury aesthetic with smooth exponential ramps.
 */

const STORAGE_KEY = 'alina_soundscape_enabled'

class SoundscapeController {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private isPlaying = false
  private isEnabled = false

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        this.isEnabled = stored === 'true'
      } catch {
        this.isEnabled = false
      }
    }
  }

  private initAudio() {
    if (this.ctx) return
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    this.ctx = new AudioContextClass()

    // Master Gain for drone
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime)
    this.masterGain.connect(this.ctx.destination)

    // Dedicated SFX Gain for tactile sounds (page rustle)
    this.sfxGain = this.ctx.createGain()
    this.sfxGain.gain.setValueAtTime(0.3, this.ctx.currentTime)
    this.sfxGain.connect(this.ctx.destination)

    // Gentle low-pass filter
    this.filterNode = this.ctx.createBiquadFilter()
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.setValueAtTime(750, this.ctx.currentTime)
    this.filterNode.Q.setValueAtTime(1.2, this.ctx.currentTime)
    this.filterNode.connect(this.masterGain)

    // 432 Hz Fundamental Meditative Drone
    const oscFund = this.ctx.createOscillator()
    oscFund.type = 'sine'
    oscFund.frequency.setValueAtTime(432, this.ctx.currentTime)

    const oscFundGain = this.ctx.createGain()
    oscFundGain.gain.setValueAtTime(0.12, this.ctx.currentTime)
    oscFund.connect(oscFundGain)
    oscFundGain.connect(this.filterNode)
    oscFund.start()

    // 864 Hz Octave Harmonic
    const oscOctave = this.ctx.createOscillator()
    oscOctave.type = 'sine'
    oscOctave.frequency.setValueAtTime(864, this.ctx.currentTime)

    const oscOctaveGain = this.ctx.createGain()
    oscOctaveGain.gain.setValueAtTime(0.045, this.ctx.currentTime)
    oscOctave.connect(oscOctaveGain)
    oscOctaveGain.connect(this.filterNode)
    oscOctave.start()

    // Sub-harmonic warm resonance (216 Hz)
    const oscSub = this.ctx.createOscillator()
    oscSub.type = 'sine'
    oscSub.frequency.setValueAtTime(216, this.ctx.currentTime)

    const oscSubGain = this.ctx.createGain()
    oscSubGain.gain.setValueAtTime(0.06, this.ctx.currentTime)
    oscSub.connect(oscSubGain)
    oscSubGain.connect(this.filterNode)
    oscSub.start()

    this.isPlaying = true
  }

  public getIsEnabled(): boolean {
    return this.isEnabled
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled
    try {
      localStorage.setItem(STORAGE_KEY, String(this.isEnabled))
    } catch {
      // ignore
    }

    if (this.isEnabled) {
      this.start()
    } else {
      this.mute()
    }

    return this.isEnabled
  }

  public start() {
    this.initAudio()
    if (!this.ctx || !this.masterGain) return

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }

    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now)
    this.masterGain.gain.exponentialRampToValueAtTime(0.25, now + 1.2)
    this.isPlaying = true
  }

  public mute() {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now)
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)
    this.isPlaying = false
  }

  /**
   * Modulates the filter cutoff frequency based on scroll progress or velocity
   */
  public updateScrollCutoff(velocity: number) {
    if (!this.ctx || !this.filterNode || !this.isPlaying) return
    const targetFreq = Math.min(2200, 650 + Math.abs(velocity) * 450)
    const now = this.ctx.currentTime
    this.filterNode.frequency.setTargetAtTime(targetFreq, now, 0.15)
  }

  /**
   * Procedural synthesis of page turn / parchment rustle
   */
  public playPageTurn() {
    if (!this.isEnabled) return
    this.initAudio()
    if (!this.ctx || !this.sfxGain) return

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }

    if (!this.isPlaying) {
      this.start()
    }

    const now = this.ctx.currentTime
    const bufferSize = this.ctx.sampleRate * 0.18 // 180ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Pink-filtered noise for tactile paper sound
    let b0 = 0, b1 = 0, b2 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1400, now)
    filter.Q.setValueAtTime(0.8, now)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.35, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGain)

    noise.start(now)
  }
}

export const soundscape = new SoundscapeController()
