import Telnet, {COMMANDS, OPTIONS} from "./telnet"
import {EventEmitter} from 'events';

class Mud extends EventEmitter {
  constructor(addr, port) {
    super();

    this._encoding = 'UTF-8';
    this._availableOptions = [];
    this._connected = false;
    this._addr = addr;
    this._port = port;

    this._commands = {};
    this._commands[COMMANDS.DO] = (cmd) => this._telnet.dont(cmd.option);
    // this._commands[COMMANDS.WONT] = (cmd) => this._telnet.dont(cmd.option);
    this._commands[COMMANDS.WILL] = (cmd) => this._telnet.wont(cmd.option);
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

  async write(data) {
    if (!this._telnet)
      return;

    this._telnet.write(data+"\n");
  }

  close() {
    if (!this._telnet)
      return;

    this._telnet.close();
    this._telnet = null;
  }

  onCommand(cmd) {
    if (cmd.command === COMMANDS.SB) {
      if (cmd.subcommand === OPTIONS.GMCP) {
        let data = cmd.data.toString();
        let offset = data.indexOf(' ');
        let key = data.substr(0, offset);
        let value = data.substr(offset + 1);

        try {
          value = JSON.parse(value);
        } catch (e) {
          console.log(cmd.data.toString().split(' ', 2), '|', key, value, e)
        }
        this.emit('gmcp', { key, value });
      }
    }

    if (cmd.command === COMMANDS.WONT && cmd.option === OPTIONS.ECHO) {
      this.emit('echo', {disabled: false});
      return this._telnet.will(cmd.option);
    }

    if (cmd.command === COMMANDS.DO) {
      this._availableOptions.push(cmd.option);

      // Support telnet suboptions
      switch (cmd.option) {
        case OPTIONS.GMCP:
              // return;
          return this._telnet.will(cmd.option);
      }
    }

    if (cmd.command === COMMANDS.WILL) {
      switch (cmd.option) {
        case OPTIONS.ECHO: // ECHO
            this.emit('echo', {disabled: true});
          return this._telnet.do(cmd.option);
        case OPTIONS.GMCP:
          return this._telnet.do(cmd.option);
      }
    }

    if (this._commands[cmd.command])
      this._commands[cmd.command](cmd);
  }

  onClose() {
    this._telnet = null;
    this.emit('close');
  }
}

export default Mud;
