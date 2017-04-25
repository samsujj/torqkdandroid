import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LocationTracker } from '../../providers/location-tracker/location-tracker';
import * as $ from "jquery";

/*
  Generated class for the AddroutesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/addroutestest/addroutestest.html',
})
export class AddroutesTestPage {

  constructor(public navCtrl: NavController, public locationTracker: LocationTracker) {

  }

  start(){
    this.locationTracker.startTracking();

    alert(this.locationTracker.lat);
  }

  stop(){
    this.locationTracker.stopTracking();
  }

}
