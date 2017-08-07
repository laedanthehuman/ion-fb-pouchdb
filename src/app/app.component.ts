import { EventsService } from './../services/events.service';
import { NativeStorage } from '@ionic-native/native-storage';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'EventsPage';

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public fb: Facebook,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public nativeStorage: NativeStorage,
    public eventService: EventsService
  ) {
    this.initializeApp();

    this.pages = [
      { title: 'Eventos', component: 'EventsPage' }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.eventService.initDB();
      this.splashScreen.hide();
      this.nativeStorage.getItem('user')
        .then(data => {
          this.nav.push('EventsPage');
          this.splashScreen.hide();
        }).catch(() => {
          this.nav.push('LoginPage');
          this.splashScreen.hide();
        })
        this.statusBar.styleDefault();
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
}
