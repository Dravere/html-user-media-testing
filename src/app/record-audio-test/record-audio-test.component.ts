import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-record-audio-test',
  templateUrl: './record-audio-test.component.html',
  styleUrls: ['./record-audio-test.component.scss']
})
export class RecordAudioTestComponent {
  testName = '';
  userMediaConstraintsText = '';

  @Input() get userMediaConstraints(): any {
    return JSON.parse(this.userMediaConstraintsText);
  }
  set userMediaConstraints(value: any) {
    this.userMediaConstraintsText = JSON.stringify(value, null, '  ');
  }

  @Input() logText = '';

  @Input() isRecordingRunning = false;
  @Input() audioUrl: string|null = null;

  @Input() qrCodeUrl: string|null = null;

  @Output() createQrCode = new EventEmitter();
  @Output() createTestLink = new EventEmitter();
  @Output() startRecording = new EventEmitter();
  @Output() stopRecording = new EventEmitter();

  public async toggleRecording(): Promise<void> {
    if (this.isRecordingRunning) {
      this.isRecordingRunning = false;
      this.stopRecording.emit();
    } else {
      this.isRecordingRunning = true;
      this.startRecording.emit();
    }
  }

  public async copyTestLink(): Promise<void> {
    this.createTestLink.emit();
  }

  public showQrCode(): void {
    this.createQrCode.emit();
  }

  public appendLogLine(line: string): void {
    if (this.logText.length === 0) {
      this.logText = line;
    } else {
      this.logText += '\n';
      this.logText += line;
    }
  }

  public getAudioName(): string {
    if(this.testName.trim() === '') {
      return new Date().toISOString() + '.wav';
    }

    return this.testName + '.wav';
  }
}
