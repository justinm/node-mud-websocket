import Telnet from "./telnet"
import {EventEmitter} from 'events';

class Mud extends EventEmitter {
  constructor(addr, port) {
    super();

    this._availableOptions = [];
    this._connected = false;
    this._addr = addr;
    this._port = port;
  }

  async connect() {
    if (this._telnet)
      return;

    this._telnet = new Telnet(this._addr, this._port);
    this._telnet.on('command', this.onCommand.bind(this));
    this._telnet.on('close', this.onClose.bind(this));
    this._telnet.on('data', (data) => this.emit('data', data));

    return this._telnet.connect().then(() => this._connected = true);
  }

  write(data) {
    if (!this._telnet)
      throw new Error('not connected');

    this._telnet.write(data+"\n").then(() => {console.log('Data flushed')});
  }

  close() {
    if (!this._telnet)
      return;

    console.log('Close called');
    this._telnet.close();
    this._telnet = null;
  }

  onCommand(cmd) {
    if (cmd.commandName === 'DO') {
      this._availableOptions.push(cmd.optionName || cmd.optionCode);

      // Support telnet suboptions
      switch (cmd.optionCode) {
        case 1: // ECHO
          return this._telnet.command('do', cmd.optionCode);
        case 201: // GMCP
          console.log('Sending WILL', cmd.option);
          return this._telnet.command('will', cmd.optionCode);
        default:
          return this._telnet.command('wont', cmd.optionCode);
      }
    }



    if (cmd.commandName === 'WILL') {
      switch (cmd.optionCode) {
        case 1: // ECHO
          return this._telnet.command('do', cmd.optionCode);
        default:
          return this._telnet.command('dont', cmd.optionCode);
      }
    }
  }

  onClose() {
    console.log('MUD closed')
    this._telnet = null;
    this.emit('close');
  }
}

export default Mud;