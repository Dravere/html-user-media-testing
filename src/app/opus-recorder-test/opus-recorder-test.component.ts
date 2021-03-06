import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {RecordAudioTestComponent} from '../record-audio-test/record-audio-test.component';
import Recorder from 'opus-recorder';
import waveWorker from 'opus-recorder/dist/waveWorker.min.js';
import opusWorker from 'opus-recorder/dist/encoderWorker.min.js';
import {SettingsUrl} from '../SettingsUrl';

@Component({
  selector: 'app-opus-recorder-test',
  templateUrl: './opus-recorder-test.component.html',
  styleUrls: ['./opus-recorder-test.component.scss']
})
export class OpusRecorderTestComponent implements OnInit, OnDestroy {
  public recorderConfigText = '{}';

  private recorder;
  @ViewChild('audioTestBase', {static: true}) audioTestBase: RecordAudioTestComponent;

  private stream;
  private audioContext;

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
      this.audioTestBase.userMediaConstraints = {
        video: false,
        audio: true
      };
    }

    this.recorderConfigText = settingsUrl.getParam(['rc'], '{}');
  }

  ngOnDestroy(): void {
    if (this.recorder) {
      this.recorder.stop();
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
    settingsUrl.setParam('t', 'o');
    settingsUrl.setParam('tn', this.audioTestBase.testName);
    settingsUrl.setJsonParam('umc', this.audioTestBase.userMediaConstraints);
    settingsUrl.setParam('rc', this.recorderConfigText);
    return settingsUrl.getHref();
  }

  public async startRecording(): Promise<void> {
    this.audioTestBase.logText = '';
    const recorderConfig = Object.assign({
      mediaTrackConstraints: this.audioTestBase.userMediaConstraints.audio
    }, JSON.parse(this.recorderConfigText));

    const mimeType = recorderConfig.opus ? 'audio/ogg' : 'audio/wav';
    recorderConfig.encoderPath = recorderConfig.opus ? opusWorker : waveWorker;
    recorderConfig.opus = undefined;

    if (recorderConfig.sampleRate === 'auto') {
      this.stream = await navigator.mediaDevices.getUserMedia({video: false, audio: recorderConfig.mediaTrackConstraints});
      this.audioContext = new AudioContext();
      recorderConfig.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
      const trackSettings = this.stream.getAudioTracks()[0].getSettings();

      if (trackSettings.sampleRate) {
        recorderConfig.originalSampleRateOverride = trackSettings.sampleRate;
      }

      recorderConfig.sampleRate = undefined;
    }

    this.recorder = new Recorder(recorderConfig);
    this.recorder.ondataavailable = (typedArray) => {
      this.audioTestBase.appendLogLine('Audio data prepared');
      this.audioTestBase.audioBlob = new Blob([typedArray], {type: mimeType});
    };

    this.audioTestBase.appendLogLine('Start recording');
    await this.recorder.start();
  }

  public stopRecording(): void {
    this.audioTestBase.appendLogLine('Stop recording');
    this.recorder.stop();
    this.recorder = null;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getAudioTracks().forEach(track => track.close());
      this.stream = null;
    }
  }
}
