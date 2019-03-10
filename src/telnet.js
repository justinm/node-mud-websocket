import {Socket} from 'net';
import {EventEmitter} from 'events';

const COMMANDS = {
  SE:   240, // end of subnegotiation parameters
  NOP:  241, // no operation
  DM:   242, // data mark
  BRK:  243, // break
  IP:   244, // suspend (a.k.a. "interrupt process")
  AO:   245, // abort output
  AYT:  246, // are you there?
  EC:   247, // erase character
  EL:   248, // erase line
  GA:   249, // go ahead
  SB:   250, // subnegotiation
  WILL: 251, // will
  WONT: 252, // wont
  DO:   253, // do
  DONT: 254, // dont
  IAC:  255  // interpret as command
};

const OPTIONS = {
  TRANSMIT_BINARY: 0,         // http://tools.ietf.org/html/rfc856
  ECHO: 1,                    // http://tools.ietf.org/html/rfc857
  RECONNECT: 2,               // http://tools.ietf.org/html/rfc671
  SUPPRESS_GO_AHEAD: 3,       // http://tools.ietf.org/html/rfc858
  AMSN: 4,                    // Approx Message Size Negotiation
                              // https://google.com/search?q=telnet+option+AMSN
  STATUS: 5,                  // http://tools.ietf.org/html/rfc859
  TIMING_MARK: 6,             // http://tools.ietf.org/html/rfc860
  RCTE: 7,                    // http://tools.ietf.org/html/rfc563
                              // http://tools.ietf.org/html/rfc726
  NAOL: 8,                    // (Negotiate) Output Line Width
                              // https://google.com/search?q=telnet+option+NAOL
                              // http://tools.ietf.org/html/rfc1073
  NAOP: 9,                    // (Negotiate) Output Page Size
                              // https://google.com/search?q=telnet+option+NAOP
                              // http://tools.ietf.org/html/rfc1073
  NAOCRD: 10,                 // http://tools.ietf.org/html/rfc652
  NAOHTS: 11,                 // http://tools.ietf.org/html/rfc653
  NAOHTD: 12,                 // http://tools.ietf.org/html/rfc654
  NAOFFD: 13,                 // http://tools.ietf.org/html/rfc655
  NAOVTS: 14,                 // http://tools.ietf.org/html/rfc656
  NAOVTD: 15,                 // http://tools.ietf.org/html/rfc657
  NAOLFD: 16,                 // http://tools.ietf.org/html/rfc658
  EXTEND_ASCII: 17,           // http://tools.ietf.org/html/rfc698
  LOGOUT: 18,                 // http://tools.ietf.org/html/rfc727
  BM: 19,                     // http://tools.ietf.org/html/rfc735
  DET: 20,                    // http://tools.ietf.org/html/rfc732
                              // http://tools.ietf.org/html/rfc1043
  SUPDUP: 21,                 // http://tools.ietf.org/html/rfc734
                              // http://tools.ietf.org/html/rfc736
  SUPDUP_OUTPUT: 22,          // http://tools.ietf.org/html/rfc749
  SEND_LOCATION: 23,          // http://tools.ietf.org/html/rfc779
  TERMINAL_TYPE: 24,          // http://tools.ietf.org/html/rfc1091
  END_OF_RECORD: 25,          // http://tools.ietf.org/html/rfc885
  TUID: 26,                   // http://tools.ietf.org/html/rfc927
  OUTMRK: 27,                 // http://tools.ietf.org/html/rfc933
  TTYLOC: 28,                 // http://tools.ietf.org/html/rfc946
  REGIME_3270: 29,            // http://tools.ietf.org/html/rfc1041
  X3_PAD: 30,                 // http://tools.ietf.org/html/rfc1053
  NAWS: 31,                   // http://tools.ietf.org/html/rfc1073
  TERMINAL_SPEED: 32,         // http://tools.ietf.org/html/rfc1079
  TOGGLE_FLOW_CONTROL: 33,    // http://tools.ietf.org/html/rfc1372
  LINEMODE: 34,               // http://tools.ietf.org/html/rfc1184
  X_DISPLAY_LOCATION: 35,     // http://tools.ietf.org/html/rfc1096
  ENVIRON: 36,                // http://tools.ietf.org/html/rfc1408
  AUTHENTICATION: 37,         // http://tools.ietf.org/html/rfc2941
                              // http://tools.ietf.org/html/rfc1416
                              // http://tools.ietf.org/html/rfc2942
                              // http://tools.ietf.org/html/rfc2943
                              // http://tools.ietf.org/html/rfc2951
  ENCRYPT: 38,                // http://tools.ietf.org/html/rfc2946
  NEW_ENVIRON: 39,            // http://tools.ietf.org/html/rfc1572
  TN3270E: 40,                // http://tools.ietf.org/html/rfc2355
  XAUTH: 41,                  // https://google.com/search?q=telnet+option+XAUTH
  CHARSET: 42,                // http://tools.ietf.org/html/rfc2066
  RSP: 43,                    // http://tools.ietf.org/html/draft-barnes-telnet-rsp-opt-01
  COM_PORT_OPTION: 44,        // http://tools.ietf.org/html/rfc2217
  SLE: 45,                    // http://tools.ietf.org/html/draft-rfced-exp-atmar-00
  START_TLS: 46,              // http://tools.ietf.org/html/draft-altman-telnet-starttls-02
  KERMIT: 47,                 // http://tools.ietf.org/html/rfc2840
  SEND_URL: 48,               // http://tools.ietf.org/html/draft-croft-telnet-url-trans-00
  FORWARD_X: 49,              // http://tools.ietf.org/html/draft-altman-telnet-fwdx-01
  PRAGMA_LOGON: 138,          // https://google.com/search?q=telnet+option+PRAGMA_LOGON
  SSPI_LOGON: 139,            // https://google.com/search?q=telnet+option+SSPI_LOGON
  PRAGMA_HEARTBEAT: 140,      // https://google.com/search?q=telnet+option+PRAMGA_HEARTBEAT
  EXOPL: 255                  // http://tools.ietf.org/html/rfc861
};

const SUB = {
  IS: 0,
  SEND: 1,
  INFO: 2,
  VARIABLE: 0,
  VALUE: 1,
  ESC: 2, // unused, for env
  USER_VARIABLE: 3
};

const COMMAND_NAMES = Object.keys(COMMANDS).reduce(function(out, key) {
  const value = COMMANDS[key];
  out[value] = key;
  return out;
}, {});

const OPTION_NAMES = Object.keys(OPTIONS).reduce(function(out, key) {
  const value = OPTIONS[key];
  out[value] = key.toLowerCase();
  return out;
}, {});

class Telnet extends EventEmitter {
  constructor(addr, port) {
    super();
    this._encoding = 'UTF-8';
    this._addr = addr;
    this._port = port;
    this._socket = new Socket();
    this._commands = {};
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this._socket.connect(this._port, this._addr, (err) => {
        if (err)
          return reject(err);

        // this.negotiate();

        this._socket.on('data', this.onSocketData.bind(this));
        this._socket.on('close', this.onSocketClose.bind(this));

        resolve();
      });
    });
  }

  negotiate() {
    ['DO', 'DONT', 'WILL', 'WONT'].forEach((commandName) => {
      this._commands[commandName.toLowerCase()] = {};

      Object.keys(OPTIONS).forEach((optionName) => {
        const optionCode = OPTIONS[optionName];
        this._commands[commandName.toLowerCase()][optionName.toLowerCase()] = function() {
        }
      });
    });
  }

  onSocketClose() {
    this.debug('socket closed');
    this.emit('close');
  }

  onSocketData(data) {
    var bufs = []
        , i = 0
        , l = 0
        , needsPush = false
        , cdata
        , iacCode
        , iacName
        , commandCode
        , commandName
        , optionCode
        , optionName
        , cmd
        , len;

    if (this._last) {
      data = Buffer.concat([this._last.data, data]);
      i = this._last.i;
      l = this._last.l;
      delete this._last;
    }

    for (; i < data.length; i++) {
      if (data.length - 1 - i >= 2
          && data[i] === COMMANDS.IAC) {
        cdata = data.slice(i);

        iacCode = cdata.readUInt8(0);
        iacName = COMMAND_NAMES[iacCode];
        commandCode = cdata.readUInt8(1);
        commandName = COMMAND_NAMES[commandCode];
        optionCode = cdata.readUInt8(2);
        optionName = OPTION_NAMES[optionCode];

        cmd = {
          iacCode: iacCode,
          iacName: iacName,
          commandCode: commandCode,
          commandName: commandName,
          optionCode: optionCode,
          optionName: optionName,
          data: cdata
        };

        // compat
        if (cmd.option === 'new environ') {
          cmd.option = 'environment variables';
        } else if (cmd.option === 'naws') {
          cmd.option = 'window size';
        }

        if (this[cmd.optionName]) {
          try {
            len = this[cmd.optionName](cmd);
          } catch (e) {
            if (!(e instanceof RangeError)) {
              this.debug('error: %s', e.message);
              this.emit('error', e);
              return;
            }
            len = -1;
            this.debug('Not enough data to parse.');
          }
        } else {
          if (cmd.commandCode === COMMANDS.SB) {
            len = 0;
            while (cdata[len] && cdata[len] !== COMMANDS.SE) {
              len++;
            }
            if (!cdata[len]) {
              len = 3;
            } else {
              len++;
            }
          } else {
            len = 3;
          }
          cmd.data = cmd.data.slice(0, len);
          this.debug('Unknown option: %s', cmd.optionName, cmd);
        }

        if (len === -1) {
          this.debug('Waiting for more data.');
          this.debug(iacName, commandName, optionName, cmd.values || len);
          this._last = {
            data: data,
            i: i,
            l: l
          };
          return;
        }

        this.debug(iacName, commandName, optionName, cmd.values || len);

        this.emit('command', cmd);

        needsPush = true;
        l = i + len;
        i += len - 1;
      } else {
        if (data[i] === COMMANDS.IAC && data.length - 1 - i < 2) {
          this.debug('Waiting for more data.');
          this._last = {
            data: data.slice(i),
            i: 0,
            l: 0
          };
          if (i > l) {
            this.emit('data', data.slice(l, i));
          }
          return;
        }
        if (needsPush || i === data.length - 1) {
          bufs.push(data.slice(l, i + 1));
          needsPush = false;
        }
      }
    }

    if (bufs.length) {
      this.emit('data', Buffer.concat(bufs));
    }
  }

  async write(data) {
    return new Promise((resolve, reject) => {
      this._socket.write(data, this._encoding, (err) => {
        if (err)
          reject(err);
        resolve();
      });
    })
  }

  will(option) {
    return this.command('WILL', option);
  }

  wont(option) {
    return this.command('WONT', option);
  }

  command(command, option) {
    const buf = new Buffer(3);

    console.log('Send command', command, OPTION_NAMES[option] || option);

    if (typeof command === 'string')
      command = COMMANDS[command.toUpperCase()];

    if (typeof option === 'string')
      option = OPTIONS[option.toUpperCase()];

    buf[0] = COMMANDS.IAC;
    buf[1] = command;
    buf[2] = option;

    return this.write(buf);
  }

  close() {
    this._socket.destroy();
  }

  debug() {
    // console.log.apply(this, arguments);
  }

}

export default Telnet;
