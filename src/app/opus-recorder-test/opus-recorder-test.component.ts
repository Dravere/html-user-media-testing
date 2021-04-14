import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {RecordAudioTestComponent} from '../record-audio-test/record-audio-test.component';
import Recorder from 'opus-recorder';
import encoderPath from 'opus-recorder/dist/waveWorker.min.js';

@Component({
  selector: 'app-opus-recorder-test',
  templateUrl: './opus-recorder-test.component.html',
  styleUrls: ['./opus-recorder-test.component.scss']
})
export class OpusRecorderTestComponent implements OnDestroy {
  private recorder;
  @ViewChild('audioTestBase', {static: true}) audioTestBase: RecordAudioTestComponent;

  ngOnDestroy(): void {
    if (this.recorder) {
      this.recorder.stop();
    }
  }

  public copyTestLink(): void {
  }

  public showQrCode(): void {
  }

  public async startRecording(): Promise<void> {
    this.audioTestBase.logText = '';
    this.recorder = new Recorder({encoderPath});
    this.recorder.ondataavailable = (typedArray) => {
      this.audioTestBase.appendLogLine('Audio data prepared');
      this.audioTestBase.audioUrl = URL.createObjectURL(new Blob([typedArray], {type: 'audio/wav'}));
    };

    this.audioTestBase.appendLogLine('Start recording');
    await this.recorder.start();
  }

  public stopRecording(): void {
    this.audioTestBase.appendLogLine('Stop recording');
    this.recorder.stop();
    this.recorder = null;
  }
}
