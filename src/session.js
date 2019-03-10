import {Socket} from 'net';
import parser from "./parser"
import Mud from "./mud"

class Session {
  constructor(wss, addr, port) {
    this._wss = wss;
    this._mud = new Mud(addr, port);

    this._wss.on('close', this.onWssClose.bind(this));
    this._wss.on('message', (data) => this.onWssMessage(JSON.parse(data)));
  }

  start() {
    this._mud.on('data', (data) => {
      console.log('Received mud data:', data.toString());
      this.sendWss({event: 'data', data: parser.parse(data)});
    })
    this._mud.connect()
        .then(() => this.sendWss({event: 'connection', status: 'success'}));
  }

  sendWss(json) {
    try {
      this._wss.send(JSON.stringify(json))
    } catch (e) {
      console.log('Error sending data', e);
    }
  }

  onWssMessage(data) {
    switch(data.event) {
      case 'input':
        console.log('Received input', data.data)
        return this._mud.write(data.data);
      default:
        console.log('Received', data);
        break;
    }

  }

  onWssClose() {
    this._mud.close();
  }

}

export default Session;
