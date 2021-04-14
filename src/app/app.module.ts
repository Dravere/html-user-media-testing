import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {FormsModule} from '@angular/forms';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { DevicesEnumerationComponent } from './devices-enumeration/devices-enumeration.component';
import { RecordRtcTestComponent } from './record-rtc-test/record-rtc-test.component';
import { BlobDownloadComponent } from './blob-download/blob-download.component';

@NgModule({
  declarations: [
    AppComponent,
    AudioPlayerComponent,
    DevicesEnumerationComponent,
    RecordRtcTestComponent,
    BlobDownloadComponent
  ],
    imports: [
        BrowserModule,
        FormsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
