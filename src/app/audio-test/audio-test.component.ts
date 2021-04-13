import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as RecordRTC from 'recordrtc';

@Component({
  selector: 'app-audio-test',
  templateUrl: './audio-test.component.html',
  styleUrls: ['./audio-test.component.scss']
})
export class AudioTestComponent implements OnInit, OnDestroy, AfterViewInit {
  private defaultUserMediaConstraints: any = {
    video: false,
    audio: true,
  };

  private defaultRecordRtcOptions: any = {
    mimeType: 'audio/wav',
    numberOfAudioChannels: 2,
    bufferSize: 16384,
  };

  testName = '';
  userMediaConstraintsText = '';
  recordRtcOptionsText = '';

  isRecordingRunning = false;
  audioUrl: string|null = null;

  displayQrCode = false;
  qrCodeUrl = '';

  enableVisualization = false;
  @ViewChild('visualizer', {static: false}) canvasElementRef: ElementRef;

  private recorder: any;
  private stream: MediaStream;

  private canvas: any;
  private canvasCtx: any;
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private gainNode: GainNode;
  private convolver: ConvolverNode;
  private source: MediaStreamAudioSourceNode;

  ngOnInit(): void {
    const url = new URL(window.location.href);
    const testName = url.searchParams.get('testName');
    if (testName) {
      this.testName = testName;
    }

    const userMediaConstraintsText = url.searchParams.get('userMediaConstraints');
    if (userMediaConstraintsText) {
      this.userMediaConstraintsText = JSON.stringify(JSON.parse(userMediaConstraintsText), null, '  ');
    } else {
      this.userMediaConstraintsText = JSON.stringify(this.defaultUserMediaConstraints, null, '  ');
    }

    const recordRtcOptionsText = url.searchParams.get('recordRtcOptions');
    if (recordRtcOptionsText) {
      this.recordRtcOptionsText = JSON.stringify(JSON.parse(recordRtcOptionsText), null, '  ');
    } else {
      this.recordRtcOptionsText = JSON.stringify(this.defaultRecordRtcOptions, null, '  ');
    }

    const visualizationText = url.searchParams.get('visualization');
    this.enableVisualization = (visualizationText === '1');
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    this.canvasCtx = this.canvas.getContext('2d');
  }

  async ngOnDestroy(): Promise<void> {
    if (this.isRecordingRunning) {
      await this.stopRecording();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    if (this.convolver) {
      this.convolver.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close().then(() => console.log('audio context closed'));
    }
  }

  public async toggleRecording(): Promise<void> {
    if (this.isRecordingRunning) {
      await this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  public async copyTestLink(): Promise<void> {
    await navigator.clipboard.writeText(this.createTestLink().href);
  }

  public showQrCode(): void {
    const qrCodeUrl = new URL('https://zxing.org/w/chart?cht=qr&chs=350x350&chld=L&choe=UTF-8&chl=');
    qrCodeUrl.searchParams.set('chl', this.createTestLink().href);
    this.qrCodeUrl = qrCodeUrl.href;
    this.displayQrCode = true;
  }

  private createTestLink(): URL {
    const url = new URL('', window.location.protocol + '//' + window.location.host + window.location.pathname);
    url.searchParams.set('testName', this.testName);
    url.searchParams.set('userMediaConstraints', JSON.stringify(JSON.parse(this.userMediaConstraintsText)));
    url.searchParams.set('recordRtcOptions', JSON.stringify(JSON.parse(this.recordRtcOptionsText)));
    url.searchParams.set('visualization', this.enableVisualization ? '1' : '0');
    return url;
  }

  private async startRecording(): Promise<void> {
    this.isRecordingRunning = true;
    try {
      const userMediaConstraints = JSON.parse(this.userMediaConstraintsText);
      const recordRtcOptions = JSON.parse(this.recordRtcOptionsText);
      this.stream = await navigator.mediaDevices.getUserMedia(userMediaConstraints);

      if (this.enableVisualization) {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        this.analyser.smoothingTimeConstant = 0.85;

        this.gainNode = this.audioContext.createGain();
        this.convolver = this.audioContext.createConvolver();

        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.source.connect(this.gainNode);
        this.convolver.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        this.visualize();
      }

      this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, recordRtcOptions);
      this.recorder.record();
    } catch (e) {
      console.log('Failed to start with the recording!', e);
      this.isRecordingRunning = false;
    }
  }

  private async stopRecording(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.recorder.stop((blob) => {
          this.isRecordingRunning = false;
          this.audioUrl = URL.createObjectURL(blob);
          for (const track of this.stream.getAudioTracks()) {
            track.stop();
          }
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private visualize(): void {
    const WIDTH = this.canvas.width;
    const HEIGHT = this.canvas.height;

    this.analyser.fftSize = 2048;
    const bufferLength = this.analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    this.draw(WIDTH, HEIGHT, dataArray, bufferLength);
  }

  private draw(WIDTH, HEIGHT, dataArray, bufferLength): void {
    this.analyser.getByteTimeDomainData(dataArray);
    this.canvasCtx.fillStyle = 'rgb(0,255,0)';
    this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    this.canvasCtx.beginPath();

    requestAnimationFrame(() => this.draw(WIDTH, HEIGHT, dataArray, bufferLength));

    const sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * HEIGHT / 2;
      if (i === 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.canvasCtx.stroke();
  }
}
