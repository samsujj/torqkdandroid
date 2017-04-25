import { Injectable, NgZone } from '@angular/core';
import { Geolocation, Geoposition, BackgroundGeolocation } from 'ionic-native';
import 'rxjs/add/operator/filter';

@Injectable()
export class LocationTracker {

  public watch: any;
  public lat: number = 0;
  public lng: number = 0;

  public lanlonga: any = [];

  constructor(public zone: NgZone) {

  }

  startTracking() {
// Background Tracking

    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: true,
      interval: 2000
    };

    BackgroundGeolocation.configure((location) => {

      console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;

        var timediff = 0;
        var curtime:number = new Date().getTime();
        if(this.lanlonga.length){

          var prevtime:number = this.lanlonga[this.lanlonga.length-1].timediff;

          timediff = curtime - prevtime;
        }

        this.lanlonga.push({lat:location.latitude,lng:location.longitude,timediff: timediff})

      });

    }, (err) => {

      console.log(err);

    }, config);

    // Turn ON the background-geolocation system.
    BackgroundGeolocation.start();


    // Foreground Tracking

    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };

    this.watch = Geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

      console.log(position);

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;

        var timediff = 0;
        var curtime:number = new Date().getTime();
        if(this.lanlonga.length){

          var prevtime:number = this.lanlonga[this.lanlonga.length-1].curtime;

          timediff = curtime - prevtime;
        }

        this.lanlonga.push({lat:position.coords.latitude,lng:position.coords.longitude,curtime:curtime,timediff: timediff})

      });

    });

  }

  stopTracking() {

    console.log('stopTracking');

    BackgroundGeolocation.finish();
    this.watch.unsubscribe();


  }

}