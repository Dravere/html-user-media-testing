import {Component, OnDestroy, OnInit} from '@angular/core';
import * as RecordRTC from 'recordrtc';

@Component({
  selector: 'app-audio-test',
  templateUrl: './audio-test.component.html',
  styleUrls: ['./audio-test.component.scss']
})
export class AudioTestComponent implements OnInit, OnDestroy {
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

  private recorder: any;
  private stream: MediaStream;

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
  }

  async ngOnDestroy(): Promise<void> {
    if (this.isRecordingRunning) {
      await this.stopRecording();
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
    const url = new URL('', window.location.protocol + '//' + window.location.host + window.location.pathname);
    url.searchParams.set('testName', this.testName);
    url.searchParams.set('userMediaConstraints', JSON.stringify(JSON.parse(this.userMediaConstraintsText)));
    url.searchParams.set('recordRtcOptions', JSON.stringify(JSON.parse(this.recordRtcOptionsText)));
    await navigator.clipboard.writeText(url.href);
  }

  private async startRecording(): Promise<void> {
    this.isRecordingRunning = true;
    try {
      const userMediaConstraints = JSON.parse(this.userMediaConstraintsText);
      const recordRtcOptions = JSON.parse(this.recordRtcOptionsText);
      this.stream = await navigator.mediaDevices.getUserMedia(userMediaConstraints);
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
}
