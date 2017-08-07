import { Event } from './../models/event';
import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
@Injectable()
export class EventsService {
  private db;
  private events;

  constructor() { }

  initDB() {
    PouchDB.plugin(cordovaSqlitePlugin);
    this.db = new PouchDB('events.db', {adapter: 'cordova-sqlite'});
    Object.defineProperty(window,'PouchDB', this.db)
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

  addAll (events) {
    return this.db.bulkDocs(events);
  }

  getAll() {
    if (!this.events) {
      return this.db.allDocs({ include_docs: true })
        .then(docs => {
          this.events = docs.rows.map(document => {
            return document.doc;
          })
          this.db.changes({
            live: true,
            since: 'now',
            include_docs: true
          }).on('change', this.onDatabaseChange)
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
