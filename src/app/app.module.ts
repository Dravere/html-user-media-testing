import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {FormsModule} from '@angular/forms';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { DevicesEnumerationComponent } from './devices-enumeration/devices-enumeration.component';
import { AudioTestComponent } from './audio-test/audio-test.component';
import { BlobDownloadComponent } from './blob-download/blob-download.component';

@NgModule({
  declarations: [
    AppComponent,
    AudioPlayerComponent,
    DevicesEnumerationComponent,
    AudioTestComponent,
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
