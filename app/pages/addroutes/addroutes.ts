import { Component } from '@angular/core';
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, Validators,FormControl} from "@angular/forms";
import {Http, Headers} from "@angular/http";
import {Storage, LocalStorage, NavController, Nav, Content, ModalController, Platform,NavParams,ActionSheetController,ToastController} from "ionic-angular";
import * as $ from "jquery";
import {DomSanitizationService} from "@angular/platform-browser";
import {CommonPopupPage} from "../commonpopup/commonpopup";
import {HomePage} from '../home/home';
import {UpdateprofilePage} from '../updateprofile/updateprofile';
import {Addroutes2Page} from '../addroutes2/addroutes2';
import {Network, SQLite} from "ionic-native";
import { BackgroundMode } from 'ionic-native';
import { BackgroundGeolocation } from 'ionic-native';

/*
  Generated class for the AddroutesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/addroutes/addroutes.html',
})
export class AddroutesPage {
  public homepage = HomePage;
  public updateprofilepage = UpdateprofilePage;

  public issportshow = false;
  public islocationshow = false;
  public sportsId;
  public sportsName;
  public locationName;

  private local:LocalStorage;
  private loggedinuser;

  private splist;
  private isInternet;
  public isOfflineData;


  constructor(private navCtrl: NavController,public modalCtrl: ModalController,private _http: Http,public actionSheetCtrl: ActionSheetController,public sanitizer:DomSanitizationService,public platform: Platform,private toastCtrl: ToastController) {

      this.sportsId = 0;
      this.locationName = '';
    this.isOfflineData = 0;

    this.local = new Storage(LocalStorage);

    this.local.get('userinfo').then((value) => {
      if(value!=null) {
        this.loggedinuser=JSON.parse(value).id;
      }
      else{
        this.loggedinuser = 0;
      }
    }).catch((err)=>{
      this.loggedinuser = 0;
    });



    /************************Check Internet [start]*****************************/

    this.platform.ready().then(() => {

      if(Network.connection === 'none'){
        this.isInternet = 0;
      }else{
        this.isInternet = 1;
      }
      this.getSportList();

      this.checkOfflineData();

      let disconnectSubscription = Network.onDisconnect().subscribe(() => {
        this.isInternet = 0;
      });

      let connectSubscription = Network.onConnect().subscribe(() => {
        this.isInternet = 1;
      });

    });
    /************************Check Internet [end]*******************************/




  }


  getSportList(){

    this.getFromdb('addroutsSpLIst');

    if(this.isInternet == 1){
      /****************Sport List********************/
      var link3 = 'http://torqkd.com/user/ajs2/allsports';
      var data3 = {};



      this._http.post(link3, data3)
          .subscribe(res3 => {
            this.splist = res3.json();
            this.opendatase('addroutsSpLIst');
          }, error => {
            console.log("Oooops!");
          });
      /****************Sport List********************/
    }

  }

  openmenu(){
    $('.navmenul').click();
  }

  showtermsploicy(type){
    let modal = this.modalCtrl.create(CommonPopupPage, {
      "type": type
    });

    modal.present();
  }

  addhideclass(hparam){
    if(typeof (hparam) == 'undefined'){
      return 'hide';
    }else{
      if(!hparam){
        return 'hide';
      }
    }

    return '';
  }

  getsanitcontent(content){
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  selsports(item){
    this.sportsId = item.id;
    this.sportsName = item.name;

    this.issportshow = !this.issportshow;
    this.islocationshow = !this.islocationshow

  }

    changelocname(keyval){
        this.locationName = keyval;
    }

  gotostep2(){
    if(this.sportsId == 0){
      let toast = this.toastCtrl.create({
        message: 'Please select sport.',
        duration: 2000,
        position: 'middle',
        cssClass: 'addRoutesToast'
      });
      toast.present();
      return false;
    }
    if(this.locationName == ''){
      let toast = this.toastCtrl.create({
        message: 'Please enter location name.',
        duration: 2000,
        position: 'middle',
        cssClass: 'addRoutesToast'
      });
      toast.present();
      return false;
    }

    BackgroundMode.enable();
    this.platform.ready().then(() => {

      let config = {
        desiredAccuracy: 0,
        stationaryRadius: 1,
        distanceFilter: 0,
        debug: false, //  enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: true, //
        interval: 400,
        //distanceFilter:0,// enable this to clear background location settings when the app terminates
      };

      BackgroundGeolocation.configure((data) => {
        console.log('[js] BackgroundGeolocation callback:  ' + data.latitude + ',' + data.longitude);
        BackgroundGeolocation.finish();
      }, (error) => {
        console.log('BackgroundGeolocation error');
      }, config);

      // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
      BackgroundGeolocation.start();


      });

    // this.navCtrl.push(Addroutes2Page, {sportsId: this.sportsId ,locationName : this.locationName });
    this.navCtrl.setRoot(Addroutes2Page, {sportsId: this.sportsId ,locationName : this.locationName });

  }

  checkInternetclass(){
    if(this.isInternet == 0){
      return 'no-connectionheader';
    }

    return '';
  }

  /*****************************For SQL Data[start]*******************************************/


  opendatase(tbl){
    let db = new SQLite();
    db.openDatabase({
      name: 'data.db',
      location: 'default' // the location field is required
    }).then(() => {
      db.executeSql('CREATE TABLE IF NOT EXISTS '+tbl+'(datacolum VARCHAR(32))', {}).then(() => {

        this.checkTable(tbl);

      }, (err) => {
        console.log(JSON.stringify(err));
      });
    }, (err) => {
      console.log(JSON.stringify(err));
    });
  }

  checkTable(tbl){
    let db = new SQLite();
    db.openDatabase({
      name: 'data.db',
      location: 'default' // the location field is required
    }).then(() => {
      db.executeSql("SELECT * FROM "+tbl, {}).then((data) => {

        if(data.rows.length == 0){
          this.tableinsert(tbl);
        }else {
          this.tableDelete(tbl);
        }

      }, (err) => {
        console.log( JSON.stringify(err));
      });
    }, (err) => {
      console.log( JSON.stringify(err));
    });
  }

  tableDelete(tbl){

    let db = new SQLite();
    db.openDatabase({
      name: 'data.db',
      location: 'default' // the location field is required
    }).then(() => {
      db.executeSql("DELETE FROM "+tbl, {}).then(() => {

        this.tableinsert(tbl);

      }, (err) => {
        console.log( JSON.stringify(err));
      });
    }, (err) => {
      console.log( JSON.stringify(err));
    });
  }

  tableinsert(tbl){

    let data;


    data = JSON.stringify(this.splist);

    let db = new SQLite();
    db.openDatabase({
      name: 'data.db',
      location: 'default' // the location field is required
    }).then(() => {
      db.executeSql("INSERT INTO "+tbl+" (datacolum) VALUES ($1)", [data]).then(() => {
        console.log('insert table successfully');
      }, (err) => {
        console.log( JSON.stringify(err));
      });
    }, (err) => {
      console.log( JSON.stringify(err));
    });
  }

  getFromdb(tbl){
    let db = new SQLite();
    db.openDatabase({
      name: 'data.db',
      location: 'default' // the location field is required
    }).then(() => {
      db.executeSql("SELECT * FROM "+tbl, {}).then((data) => {

        if(data.rows.length){
          let redata = data.rows.item(0).datacolum;

          this.splist = JSON.parse(redata);
        }


      }, (err) => {
        console.log( JSON.stringify(err));
      });
    }, (err) => {
      console.log( JSON.stringify(err));
    });
  }


  checkOfflineData(){
    let db = new SQLite();
    db.openDatabase({
      name: 'data.db',
      location: 'default' // the location field is required
    }).then(() => {
      db.executeSql("SELECT * FROM addroutesdata", {}).then((data) => {

        if(data.rows.length == 0){
          this.isOfflineData = 0;
        }else {
          this.isOfflineData = 1;
        }

        this.checkOfflineData();

      }, (err) => {
        console.log(err);
      });
    }, (err) => {
      console.log(err);
    });
  }

  tableDelete2(tbl){

    let db = new SQLite();
    db.openDatabase({
      name: 'data.db',
      location: 'default' // the location field is required
    }).then(() => {
      db.executeSql("DELETE FROM "+tbl, {}).then(() => {
        console.log(1);
      }, (err) => {
        console.log( JSON.stringify(err));
      });
    }, (err) => {
      console.log( JSON.stringify(err));
    });
  }


  /*****************************For SQL Data[end]*******************************************/


}
