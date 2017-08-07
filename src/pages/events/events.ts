import { NativeStorage } from '@ionic-native/native-storage';
import { Facebook } from '@ionic-native/facebook';
import { EventsService } from './../../services/events.service';
import { Event } from './../../models/event';
import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import { IonicPage, ModalController, LoadingController, AlertController, NavController } from 'ionic-angular';
import { isEmpty } from 'lodash';

@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {
  url: string = 'http://newcbc2017.app.itarget.com.br/web-service/list-atividades'
  events: Event[] = [];
  showingEvents: Event[];
  indexInfiniteScroll: number = 20
  user: any;
  userReady: boolean = false;

  constructor(private modalCtrl: ModalController, private loadingCtrl: LoadingController, private alertCtrl: AlertController, private http: Http, private eventService: EventsService, public fb: Facebook,
    public nativeStorage: NativeStorage,
    public navCtrl: NavController,
  ) {
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
  ionViewDidLoad() {
    const loading = this.loadingCtrl.create({
      content: 'Carregando Eventos...'
    })
    const alertEmpty = this.alertCtrl.create({
      title: 'Alerta',
      subTitle: 'Buscando Eventos offline',
      buttons: ['ok']
    })
    const alertNoEvents = this.alertCtrl.create({
      title: 'Alerta',
      subTitle: 'Você não tem eventos offline e ocorreram problemas ao buscar online',
      buttons: ['ok']
    })
    loading.present()

    this.getEvents().subscribe((response: Response) => {
      if (this.events.length === 0 || response.json().length > this.events.length) {
        this.events = this.loadEvents(response.json())
        this.eventService.addAll(this.events)
        loading.dismiss();
        this.showingEvents = this.events.filter(event => event.title).filter((event, i) => i < 20)
      } else {
        this.getEventsLocal().then(events => {
          loading.dismiss()
          if (isEmpty(events)) {
            alertEmpty.present()
          } else {
            this.events = events
            this.showingEvents = this.events.filter(event => event.title).filter((event, i) => i < 20)
          }
        })
      }
    }, () => {
      this.getEventsLocal().then(events => {
        loading.dismiss()
        alertEmpty.present()
        if (isEmpty(events)) {
          alertNoEvents.present()
        } else {
          this.events = events
          this.showingEvents = this.events.filter(event => event.title).filter((event, i) => i < 20)
        }
      })
    })
  }

  getEventsLocal() {
    return this.eventService.getAll()
  }

   doFbLogout(){
    var nav = this.navCtrl;
    let env = this;
    this.fb.logout()
    .then(function(response) {
      //user logged out so we will remove him from the NativeStorage
      env.nativeStorage.remove('user');
      nav.push('LoginPage');
    }, function(error){
      console.log(error);
    });
  }

  doInfinite(infiniteScroll) {
    const lastIndexEvent = this.showingEvents.length
    const nextInfiniteScroll = this.indexInfiniteScroll + 10;
    setTimeout(() => {
      this.showingEvents = this.showingEvents.concat(this.events.filter((event, i) => i > this.indexInfiniteScroll && i < nextInfiniteScroll))
      this.indexInfiniteScroll = lastIndexEvent
      infiniteScroll.complete();
    }, 1000);
  }
  getEvents() {
    return this.http.get(this.url)
  }

  loadEvents(events): Event[] {
    return <Event[]>events.map(event => {
      return {
        eventId: event.evento_id,
        ambientId: event.ambiente_id,
        segmentId: event.segmento_id,
        ativityId: event.aividade_id,
        title: event.titulo || '',
        beginDateTime: new Date(event.data_hora_inicio).toISOString(),
        endDateTime: new Date(event.data_hora_termino).toISOString(),
        activityTypeId: event.tipo_atividade_id,
        status: event.status,
        createdAt: event.criacao || '',
        modifiedAt: event.modifcacao || '',
        titleEn: event.titulo_en || '',
        titleES: event.titulo_es || '',
        area: event.area || '',
        areaEn: event.area_en || '',
        areaEs: event.area_es || '',
        local: event.local || '',
        activityType: event.tipo_atividade || '',
      }
    })
  }

}
