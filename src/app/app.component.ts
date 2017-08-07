import { EventsService } from './../services/events.service';
import { Component, ViewChild } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { Platform, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = 'LoginPage';
  @ViewChild('nav') nav: NavController;


  constructor(platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              nativeStorage: NativeStorage,
              eventService: EventsService) {
    platform.ready().then(() => {
      eventService.initDB();
      splashScreen.hide();
      nativeStorage.getItem('user')
        .then(data => {
          this.nav.push('EventsPage');
          splashScreen.hide();
        }).catch(() => {
          this.nav.push('LoginPage');
          splashScreen.hide();
        })
        statusBar.styleDefault();
    });
  }
}

