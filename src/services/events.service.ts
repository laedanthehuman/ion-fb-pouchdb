import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import PouchDbQS from 'pouchdb-quick-search';
import moment from 'moment';

@Injectable()
export class EventsService {
  private db;
  private events;
  private eventDays;

  constructor() { }

  initDB() {
    PouchDB.plugin(cordovaSqlitePlugin);
    PouchDB.plugin(PouchDbQS);
    this.db = new PouchDB('events.db', { adapter: 'cordova-sqlite' });
    Object.defineProperty(window, 'PouchDB', this.db)
    this.db.changes({
      live: true,
      since: 'now',
      include_docs: true
    }).on('change', this.onDatabaseChange)
  }

  add(event) {
    return this.db.post(event);
  }

  update(event) {
    return this.db.put(event);
  }

  delete(event) {
    return this.db.delete(event);
  }
  addAll(events) {
    return this.db.bulkDocs(events);
  }

  findByDay(day) {
    return this.db.search({
      query: day,
      fields: ['data_hora_inicio', 'data_hora_termino'],
      limit: 10,
      skip: 20,
      build: true
    })
  }

  getDays() {
    if (!this.eventDays) {
      return this.db.allDocs({ include_docs: true })
        .then(docs => {
          this.eventDays = docs.rows.map(row => {
            return { searchDate: row.doc.data_hora_inicio, showDate: moment(new Date(row.doc.data_hora_inicio)).format('D/MM') }
          })
          return this.eventDays;
        })
    } else {
      return Promise.resolve(this.eventDays);
    }
  }
  getAll() {
    if (!this.events) {
      return this.db.allDocs({ include_docs: true })
        .then(docs => {
          this.events = docs.rows.map(document => {
            return document.doc;
          })
          return this.events;
        })
    } else {
      return Promise.resolve(this.events);
    }

  }

  private onDatabaseChange(change) {
    const index = this.findIndex(this.events, change.id);
    const event = this.events[index]
    if (change.delete) {
      if (event) {
        this.events.splice(index, 1)
      }
    } else {
      if (event && event._id === change.id) {
        this.events[index] = change.doc //update
      } else {
        this.events.splice(index, 0, change.doc) // insert
      }
    }
  }

  private findIndex(array, id): number {
    let low = 0
    let high = array.length
    let mid
    while (low < high) {
      mid = (low + high) >>> 1;
      array[mid]._id < id ? low = mid + 1 : high = mid
    }
    return low;
  }

}
