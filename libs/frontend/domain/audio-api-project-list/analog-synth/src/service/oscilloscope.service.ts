import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OscilloscopeService {
  public draw(analyser: AnalyserNode, oscilloscope: HTMLCanvasElement): void {
    // Use requestAnimationFrame to continuously update the drawing
    requestAnimationFrame(() => this.draw(analyser, oscilloscope));

    if (
      oscilloscope.width !== oscilloscope.clientWidth ||
      oscilloscope.height !== oscilloscope.clientHeight
    ) {
      oscilloscope.width = oscilloscope.clientWidth;
      oscilloscope.height = oscilloscope.clientHeight;
    }

    // Get the number of frequency bins
    const bufferLength = analyser.frequencyBinCount;
    // Create a new Uint8Array to store the time-domain data
    const dataArray = new Uint8Array(bufferLength);
    // Get time-domain data from the analyser node
    analyser.getByteTimeDomainData(dataArray);

    // Get the canvas context for drawing
    const canvas = oscilloscope;
    const canvasCtx = canvas.getContext('2d');

    if (!canvasCtx) {
      console.error('Unable to get 2D context for canvas');
      return;
    }

    // Find the rising edge zero-crossing point to stabilize the waveform
    let triggerPoint = 0;
    for (let i = 0; i < bufferLength; i++) {
      // Look for the point where the wave crosses the center (128) going up
      if (dataArray[i] < 128 && dataArray[i + 1] >= 128) {
        triggerPoint = i;
        break;
      }
    }

    // Clear the canvas with a trail effect
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Update dynamic color
    const dynamicColor = '#ff3333';

    // Set stroke style and neon glow
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = dynamicColor;
    canvasCtx.shadowBlur = 4;
    canvasCtx.shadowColor = dynamicColor;

    // Begin the drawing path
    canvasCtx.beginPath();

    // Calculate the width of each segment
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    // Loop through each value in the dataArray and draw the waveform
    for (let i = 0; i < bufferLength; i++) {
      // Offset the data index by the trigger point to lock the phase
      const index = i + triggerPoint;

      // Handle buffer overflow if trigger offset goes out of bounds
      // Default to silence (128) if no data available
      const rawValue = index < bufferLength ? dataArray[index] : 128;

      // Apply amplitude scaling (3.0x) for better visibility
      const amplitudeScale = 4.0;
      const v = ((rawValue - 128) / 128.0) * amplitudeScale;
      const y = canvas.height / 2 + v * (canvas.height / 2);

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    // Finish the drawing path
    canvasCtx.stroke();

    // Reset shadow to avoid performance issues on fillRect
    canvasCtx.shadowBlur = 0;
  }
}
