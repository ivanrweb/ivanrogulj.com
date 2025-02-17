import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OscilloscopeService {

  public draw(analyser: AnalyserNode, oscilloscope: HTMLCanvasElement): void {
    // Use requestAnimationFrame to continuously update the drawing
    requestAnimationFrame(() => this.draw(analyser, oscilloscope));

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

    // Clear the canvas before drawing the next frame
    canvasCtx.fillStyle = '#F5F5F5';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Set stroke style for the waveform
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    // Begin the drawing path
    canvasCtx.beginPath();

    // Calculate the width of each segment
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    // Loop through each value in the dataArray and draw the waveform
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    // Finish the drawing path
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
}
