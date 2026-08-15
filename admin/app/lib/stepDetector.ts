/**
 * High-Reliability Adaptive Pedometer & Step Detector
 * Robust against variable mobile sensor rates (10Hz - 100Hz)
 * Uses dynamic 3-axis gravity separation, low-pass smoothing, and debounced peak detection.
 */

export interface StepDetectorConfig {
  minStepIntervalMs: number;  // Minimum time between steps (debounce: default 240ms ~ 4.1 steps/sec)
  stepThreshold: number;      // Acceleration magnitude threshold (m/s²)
  gravityAlpha: number;       // Low-pass coefficient for gravity extraction
  smoothingAlpha: number;     // Low-pass coefficient for noise removal
}

export const defaultStepDetectorConfig: StepDetectorConfig = {
  minStepIntervalMs: 240,     // 240ms debounce
  stepThreshold: 1.15,        // 1.15 m/s² peak threshold for real walking
  gravityAlpha: 0.85,
  smoothingAlpha: 0.25,
};

export class StepDetector {
  private config: StepDetectorConfig;
  private gravityX = 0;
  private gravityY = 0;
  private gravityZ = 9.81;
  private isInitialized = false;

  private smoothMag = 0;
  private prevMag = 0;
  private lastStepTimeMs = 0;
  private stepCount = 0;
  private state: 'below' | 'above' = 'below';

  constructor(config: Partial<StepDetectorConfig> = {}) {
    this.config = { ...defaultStepDetectorConfig, ...config };
  }

  public getStepCount(): number {
    return this.stepCount;
  }

  public getCurrentThreshold(): number {
    return this.config.stepThreshold;
  }

  public reset(): void {
    this.gravityX = 0;
    this.gravityY = 0;
    this.gravityZ = 9.81;
    this.isInitialized = false;
    this.smoothMag = 0;
    this.prevMag = 0;
    this.lastStepTimeMs = 0;
    this.stepCount = 0;
    this.state = 'below';
  }

  /**
   * Process 3-axis raw accelerometer sample (m/s²)
   * @param ax X acceleration
   * @param ay Y acceleration
   * @param az Z acceleration
   * @param timestampMs Timestamp in milliseconds
   * @returns boolean true if a verified step was detected
   */
  public addSample(ax: number, ay: number, az: number, timestampMs: number = Date.now()): boolean {
    // 1. Initialize baseline on first sample
    if (!this.isInitialized) {
      this.gravityX = ax;
      this.gravityY = ay;
      this.gravityZ = az;
      this.isInitialized = true;
      return false;
    }

    // 2. Separate Gravity component using low-pass IIR filter
    const gAlpha = this.config.gravityAlpha;
    this.gravityX = gAlpha * this.gravityX + (1 - gAlpha) * ax;
    this.gravityY = gAlpha * this.gravityY + (1 - gAlpha) * ay;
    this.gravityZ = gAlpha * this.gravityZ + (1 - gAlpha) * az;

    // 3. Compute Linear Acceleration (motion with gravity removed)
    const linearX = ax - this.gravityX;
    const linearY = ay - this.gravityY;
    const linearZ = az - this.gravityZ;

    // 4. Calculate Vector Magnitude
    const rawMag = Math.sqrt(linearX * linearX + linearY * linearY + linearZ * linearZ);

    // 5. Smooth the magnitude signal to eliminate high-frequency hand tremors
    const sAlpha = this.config.smoothingAlpha;
    this.smoothMag = (1 - sAlpha) * this.smoothMag + sAlpha * rawMag;

    const currentMag = this.smoothMag;
    let isStepDetected = false;

    // 6. State Machine: Peak detection with hysteresis & cadence debounce
    const threshold = this.config.stepThreshold;
    const timeSinceLastStep = timestampMs - this.lastStepTimeMs;

    if (this.state === 'below') {
      // Crossing upward past the step threshold
      if (currentMag >= threshold && this.prevMag < threshold) {
        if (timeSinceLastStep >= this.config.minStepIntervalMs) {
          this.state = 'above';
          this.lastStepTimeMs = timestampMs;
          this.stepCount += 1;
          isStepDetected = true;
        }
      }
    } else {
      // Crossing downward past release threshold (0.6 * threshold)
      if (currentMag < threshold * 0.6) {
        this.state = 'below';
      }
    }

    this.prevMag = currentMag;
    return isStepDetected;
  }
}
