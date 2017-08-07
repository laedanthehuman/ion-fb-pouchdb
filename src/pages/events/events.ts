import { NativeStorage } from '@ionic-native/native-storage';
import { Facebook } from '@ionic-native/facebook';
import { EventsService } from './../../services/events.service';
import { Component, SimpleChanges, OnChanges } from '@angular/core';
import { Http, Response } from '@angular/http';
import { IonicPage, ModalController, LoadingController, AlertController, NavController } from 'ionic-angular';
import { isEmpty } from 'lodash';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {

  url: string = 'http://newcbc2017.app.itarget.com.br/web-service/list-atividades'
  events;
  showingEvents;
  indexInfiniteScroll: number = 20
  user: any;
  userReady: boolean = false;
  days: Set<string>;
  daySet: string = '';
  daysInformation;
  pets: string = 'puppies';

  constructor(private modalCtrl: ModalController, private loadingCtrl: LoadingController, private alertCtrl: AlertController, private http: Http, private eventService: EventsService, public fb: Facebook,
    public nativeStorage: NativeStorage,
    public navCtrl: NavController,
  ) {
    this.events = [];
    this.showingEvents = [];
    this.days = new Set();
  }

  ionViewDidEnter() {
    const loading = this.loadingCtrl.create({
      content: 'Carregando Eventos...'
    })
    loading.present()
    this.getEvents().subscribe((response: Response) => {
      if (this.events.length === 0 || response.json().length > this.events.length) {
        this.events = response.json();
        this.eventService.addAll(this.events)
      }
      this.eventService.getAll()
      .then(events => {
        this.events = events
        events.map(event => this.days.add(moment(event.data_hora_inicio).format('D/MM')))
        loading.dismiss()
      })
    }, () => {
      this.getEventsLocal().then(days => {
        loading.dismiss()
        days.map(day => this.days.add(day.showDate))
      })
    })
  }

  dayChange(day) {
    this.daySet = day;
    this.showingEvents = this.events.filter(event => isEmpty(event.title)).filter(event => {
          return moment(event.data_hora_inicio).format('D/MM') === day
        })
  }

  ionViewCanEnter() {
    let env = this;
    this.nativeStorage.getItem('user')
      .then(function (data) {
        env.user = {
          name: data.name,
          gender: data.gender,
          picture: data.picture
        };
        env.userReady = true;
      }, function (error) {
        console.log(error);
      });
  }


  getEventsLocal() {
    return this.eventService.getDays()
  }

  doFbLogout() {
    var nav = this.navCtrl;
    let env = this;
    this.fb.logout()
      .then(function (response) {
        env.nativeStorage.remove('user');
        nav.push('LoginPage');
      }, function (error) {
        console.log(error);
      });
  }

  doInfinite(infiniteScroll) {
    const lastIndexEvent = this.showingEvents.length
    const nextInfiniteScroll = this.indexInfiniteScroll + 10;
    setTimeout(() => {
      this.showingEvents = this.showingEvents.concat(this.events.filter((event, i) => i > this.indexInfiniteScroll && i < nextInfiniteScroll).map(event => {
        event.data_hora_inicio = moment(event.data_hora_inicio).format('H:MM')
        event.data_hora_termino = moment(event.data_hora_termino).format('H:MM')
        return event;
      }))
      this.indexInfiniteScroll = lastIndexEvent
      infiniteScroll.complete();
    }, 1000);
  }
  getEvents() {
    return this.http.get(this.url)
  }
}
