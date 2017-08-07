import { NativeStorage } from '@ionic-native/native-storage';
import { Component } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  FB_APP_ID: number = 1959435894292937;

  constructor(public navCtrl: NavController,
    public fb: Facebook,
    public nativeStorage: NativeStorage
  ) {
    this.fb.browserInit(this.FB_APP_ID, "v2.8");

  }
  doFbLogin() {
    let permissions = new Array<string>();
    let nav = this.navCtrl;
    let env = this;
    //the permissions your facebook app needs from the user
    permissions = ["public_profile"];


    this.fb.login(permissions)
      .then(function (response) {
        let userId = response.authResponse.userID;
        let params = new Array<string>();

        //Getting name and gender properties
        env.fb.api("/me?fields=name,gender", params)
          .then(function (user) {
            user.picture = "https://graph.facebook.com/" + userId + "/picture?type=large";
            //now we have the users info, let's save it in the NativeStorage
            env.nativeStorage.setItem('user',
              {
                name: user.name,
                gender: user.gender,
                picture: user.picture
              })
              .then(function () {
                nav.push('EventsPage');
              }, function (error) {
                console.log(error);
              })
          })
      }, function (error) {
        console.log(error);
      });
  }

}
