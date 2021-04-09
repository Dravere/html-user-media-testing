import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent {

  isPlaying = false;

  @Input()
  get audioUrl(): string|null {
    return this.audioUrlValue;
  }

  set audioUrl(value) {
    this.audioUrlValue = value;
    setTimeout(() => this.audioElementRef.nativeElement.load(), 0);
  }

  @Input()
  audioName = '';

  @ViewChild('audioElement', {static: true}) audioElementRef: ElementRef;

  private audioUrlValue: string|null = null;

  constructor(private domSanitizer: DomSanitizer) {
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.audioElementRef.nativeElement.pause();
      this.isPlaying = false;
    } else {
      this.audioElementRef.nativeElement.play();
      this.isPlaying = true;
    }
  }

  public downloadAudio(): void {
    let audioName = this.audioName;
    if (!audioName) {
      audioName = new Date().toISOString() + '.wav';
    }

    saveAs(this.audioUrl, audioName);
  }

  public onLoadedData(): void {
    console.log('Data finished loading');
  }

  public onPlaybackEnded(): void {
    this.isPlaying = false;
  }

  public getAudioUrl(): SafeUrl {
    return this.domSanitizer.bypassSecurityTrustUrl(this.audioUrl);
  }
}
