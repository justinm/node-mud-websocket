import {Socket} from 'net';
import parser from "./parser"
import Mud from "./mud"

class Session {
  constructor(wss, addr, port) {
    this._wss = wss;
    this._mud = new Mud(addr, port);

    this._wss.on('close', this.onWssClose.bind(this));
    this._wss.on('message', (data) => this.onWssMessage(JSON.parse(data)));

    this._started = false;
    this._closeTimeout = null

    this._mud.on('data', (data) => {
      this.sendWss('text', {text: parser.parse(data)});
    });

    this._mud.on('close', () => {
      console.log('Mud closed connection');
      this.sendWss('connection', {status: 'closed'});
      this._started = false;
    });

    this._mud.on('gmcp', (evt) => {
      this.sendWss('gmcp', evt);
    });

    this._mud.on('echo', (evt) => {
      this.sendWss('echo', evt);
    });

  }

  start() {
    if (this._started)
      return;

    if (this._closeTimeout) {
      clearTimeout(this._closeTimeout);
      this._closeTimeout = null;
    }

    this._mud.connect()
        .then(() => this.sendWss('connection', {status: 'success'}));

    this._started = true;
  }

  sendWss(type, json) {
    try {
      this._wss.send(JSON.stringify({...json, type}))
    } catch (e) {
      console.log('Error sending data', e);
    }
  }

  onWssMessage(event) {
    switch(event.type) {
      case 'connect':
        console.log('connect event received');
        return this.start();
      case 'input':
        console.log('Received input', event.text)
        return this._mud.write(event.text);
      default:
        console.log('Received', event);
        break;
    }

  }

  onWssClose() {
    console.log('Client disconnected, will close mud shortly');
    this._closeTimeout = setTimeout(() => this._mud.close(), 5000);
  }

}

export default Session;
