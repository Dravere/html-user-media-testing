import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-devices-enumeration',
  templateUrl: './devices-enumeration.component.html',
  styleUrls: ['./devices-enumeration.component.scss']
})
export class DevicesEnumerationComponent implements OnInit {
  devices: MediaDeviceInfo[] = [];

  async ngOnInit(): Promise<void> {
    this.devices = await navigator.mediaDevices.enumerateDevices();
  }
}
