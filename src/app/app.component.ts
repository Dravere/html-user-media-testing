import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'HtmlUserMediaTesting';
  tabSelection: string;

  constructor() {
    switch (new URL(window.location.href).searchParams.get('t')) {
      default:
      case 'r':
        this.tabSelection = 'RecordRtcTest';
        break;
      case 'o':
        this.tabSelection = 'OpusRecorderTest';
        break;
      case 'e':
        this.tabSelection = 'DevicesEnumeration';
        break;
    }
  }
}
