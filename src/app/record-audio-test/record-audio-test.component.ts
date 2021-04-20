import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-record-audio-test',
  templateUrl: './record-audio-test.component.html',
  styleUrls: ['./record-audio-test.component.scss']
})
export class RecordAudioTestComponent {
  testName = '';
  userMediaConstraintsText = '';
  audioUrl: string|null = null;

  @Input() get userMediaConstraints(): any {
    return JSON.parse(this.userMediaConstraintsText);
  }
  set userMediaConstraints(value: any) {
    this.userMediaConstraintsText = JSON.stringify(value, null, '  ');
  }

  @Input() logText = '';

  @Input() isRecordingRunning = false;
  @Input() get audioBlob(): Blob|null {
    return this.myAudioBlob;
  }
  set audioBlob(value) {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    this.myAudioBlob = value;
    this.audioUrl = URL.createObjectURL(this.myAudioBlob);
  }

  @Input() qrCodeUrl: string|null = null;

  @Output() createQrCode = new EventEmitter();
  @Output() createTestLink = new EventEmitter();
  @Output() startRecording = new EventEmitter();
  @Output() stopRecording = new EventEmitter();

  private myAudioBlob: Blob|null = null;

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
    if (this.testName.trim() === '') {
      return new Date().toISOString() + this.getAudioFileExtension();
    }

    return this.testName + this.getAudioFileExtension();
  }

  private getAudioFileExtension(): string {
    if (this.myAudioBlob && this.myAudioBlob.type) {
      const slashIndex = this.myAudioBlob.type.indexOf('/');
      if (slashIndex > 0) {
        const fileExtension = this.myAudioBlob.type.substr(slashIndex + 1);
        if (fileExtension.length !== 0) {
          return '.' + fileExtension;
        }
      }
    }
    return '.wav';
  }
}
