import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as RecordRTC from 'recordrtc';
import {RecordAudioTestComponent} from '../record-audio-test/record-audio-test.component';
import {SettingsUrl} from '../SettingsUrl';

@Component({
  selector: 'app-record-rtc-test',
  templateUrl: './record-rtc-test.component.html',
  styleUrls: ['./record-rtc-test.component.scss']
})
export class RecordRtcTestComponent implements OnInit, OnDestroy, AfterViewInit {
  private defaultUserMediaConstraints: any = {
    video: false,
    audio: true,
  };

  private defaultRecordRtcOptions: any = {
    mimeType: 'audio/wav',
    numberOfAudioChannels: 2,
    bufferSize: 16384,
  };

  recordRtcOptionsText = '';

  @ViewChild('audioTestBase', {static: true}) audioTestBase: RecordAudioTestComponent;

  enableVisualization = false;
  @ViewChild('visualizer', {static: true}) canvasElementRef: ElementRef;

  autoRecorderChoice = false;

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
    const settingsUrl = new SettingsUrl();
    const testName = settingsUrl.getParam(['tn', 'testName']);
    if (testName) {
      this.audioTestBase.testName = testName;
    }

    const userMediaConstraints = settingsUrl.getJsonParam(['umc', 'userMediaConstraints']);
    if (userMediaConstraints) {
      this.audioTestBase.userMediaConstraints = userMediaConstraints;
    } else {
      this.audioTestBase.userMediaConstraints = this.defaultUserMediaConstraints;
    }

    const recordRtcOptions = settingsUrl.getJsonParam(['rro', 'recordRtcOptions']);
    if (recordRtcOptions) {
      this.recordRtcOptionsText = JSON.stringify(recordRtcOptions, null, '  ');
    } else {
      this.recordRtcOptionsText = JSON.stringify(this.defaultRecordRtcOptions, null, '  ');
    }

    this.enableVisualization = settingsUrl.getBooleanParam(['vis', 'visualization'], false);
    this.autoRecorderChoice = settingsUrl.getBooleanParam(['arc'], false);
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    this.canvasCtx = this.canvas.getContext('2d');
  }

  async ngOnDestroy(): Promise<void> {
    this.stopTracks();
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

  public async copyTestLink(): Promise<void> {
    await navigator.clipboard.writeText(this.createTestLink());
  }

  public showQrCode(): void {
    const qrCodeUrl = new URL('https://zxing.org/w/chart?cht=qr&chs=350x350&chld=L&choe=UTF-8&chl=');
    qrCodeUrl.searchParams.set('chl', this.createTestLink());
    this.audioTestBase.qrCodeUrl = qrCodeUrl.href;
  }

  private createTestLink(): string {
    const settingsUrl = new SettingsUrl(new URL('', window.location.protocol + '//' + window.location.host + window.location.pathname));
    settingsUrl.setParam('t', 'r');
    settingsUrl.setParam('tn', this.audioTestBase.testName);
    settingsUrl.setJsonParam('umc', this.audioTestBase.userMediaConstraints);
    settingsUrl.setJsonParam('rro', JSON.parse(this.recordRtcOptionsText));
    settingsUrl.setBooleanParam('vis', this.enableVisualization);
    settingsUrl.setBooleanParam('arc', this.autoRecorderChoice);
    return settingsUrl.getHref();
  }

  public async startRecording(): Promise<void> {
    try {
      this.audioTestBase.logText = '';
      const userMediaConstraints = this.audioTestBase.userMediaConstraints;
      const recordRtcOptions = JSON.parse(this.recordRtcOptionsText);
      this.audioTestBase.appendLogLine('Getting user media');
      this.stream = await navigator.mediaDevices.getUserMedia(userMediaConstraints);

      if (this.enableVisualization) {
        this.audioTestBase.appendLogLine('Prepare visualization');
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

      if (this.autoRecorderChoice) {
        this.recorder = RecordRTC(this.stream, recordRtcOptions);
      } else {
        this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, recordRtcOptions);
      }

      this.audioTestBase.appendLogLine('Start recording');

      if (this.autoRecorderChoice) {
        this.recorder.startRecording();
      } else {
        this.recorder.record();
      }
    } catch (e) {
      console.log('Failed to start with the recording!', e);
      this.audioTestBase.appendLogLine('Start of the recording failed!');
    }
  }

  public async stopRecording(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const callback = (blob) => {
          this.audioTestBase.audioUrl = URL.createObjectURL(blob);
          this.stopTracks();
          this.audioTestBase.appendLogLine('Recording stopped');
          resolve();
        };

        if (this.autoRecorderChoice) {
          this.recorder.stopRecording(() => callback(this.recorder.getBlob()));
        } else {
          this.recorder.stop(callback);
        }
      } catch (e) {
        console.log('Error while stopping recording', e);
        this.audioTestBase.appendLogLine('Error while stopping recording!');
        reject(e);
      }
    });
  }

  private stopTracks(): void {
    if (!this.stream) {
      return;
    }

    for (const track of this.stream.getAudioTracks()) {
      track.stop();
    }
    this.stream = null;
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
