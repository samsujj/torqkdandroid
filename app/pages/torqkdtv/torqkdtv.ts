import { Component } from '@angular/core';
import {Storage, LocalStorage, NavController, Nav, Content, ModalController, Platform} from "ionic-angular";
import {Http, Headers} from "@angular/http";
import {DomSanitizationService} from "@angular/platform-browser";
import {VideodetPage} from "../videodet/videodet";
import * as $ from "jquery";
import {CommonPopupPage} from "../commonpopup/commonpopup";
import {HomePage} from '../home/home';
import {UpdateprofilePage} from '../updateprofile/updateprofile';
import {Network, SQLite} from "ionic-native";

/*
  Generated class for the TorqkdtvPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/torqkdtv/torqkdtv.html',
})
export class TorqkdtvPage {
  public homepage = HomePage;
  public updateprofilepage = UpdateprofilePage;
  private loggedinuser;
  private local:LocalStorage;
  private videolist;
  private isInternet;
  public isOfflineData;

  constructor(private navCtrl: NavController,private _http: Http, private sanitizer:DomSanitizationService,public modalCtrl: ModalController, public platform: Platform) {

    this.isOfflineData = 0;

    this.local = new Storage(LocalStorage);

    this.local.get('userinfo').then((value) => {
      this.loggedinuser=JSON.parse(value).id;
      console.log(JSON.parse(value).id);
      if(value!=null) {
        this.getAllImages(this.loggedinuser);
      }
      else{
        $('ion-content').removeClass('hide');
        this.getAllImages(0);
      }
    });
    /************************Check Internet [start]*****************************/
    this.platform.ready().then(() => {

      if(Network.connection === 'none'){
        this.isInternet = 0;
      }else{
        this.isInternet = 1;
      }

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
  openmenu(){
    $('.navmenul').click();
  }
  getAllImages(loggedinuser){
    var link = 'http://torqkd.com/user/ajs2/getAllVideo';
    var data = {sess_id : loggedinuser};



    this._http.post(link, data)
        .subscribe(res => {
          this.videolist = res.json();
        }, error => {
          console.log("Oooops!");
        });

  }

  getsanitizerstyle(imgsrc){
    return this.sanitizer.bypassSecurityTrustStyle('url(' + imgsrc + ')');
  }

  showPhotoDetails(item){
    let modal = this.modalCtrl.create(VideodetPage, {
      "item": item,
    });

    modal.present();

  }
  showtermsploicy(type){
    let modal = this.modalCtrl.create(CommonPopupPage, {
      "type": type
    });

    modal.present();
  }

  checkInternetclass(){
    if(this.isInternet == 0){
      return 'no-connectionheader';
    }

    return '';
  }



  /*********************************************************/
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

  /*********************************************************/


}
