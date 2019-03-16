import {Socket} from 'net';
import {EventEmitter} from 'events';

export const COMMANDS = {
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

export const OPTIONS = {
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
  GMCP: 201,
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
  out[value] = key.toUpperCase();
  return out;``
}, {});

const OPTION_NAMES = Object.keys(OPTIONS).reduce(function(out, key) {
  const value = OPTIONS[key];
  out[value] = key.toUpperCase();
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

        this._socket.on('data', this.onSocketData.bind(this));
        this._socket.on('close', this.onSocketClose.bind(this));

        resolve();
      });
    });
  }

  onSocketClose() {
    this.debug('socket closed');
    this.emit('close');
  }

  onSocketData(data) {
    let offset = -1;

    if (this._last) {
      data = Buffer.concat([this._last.data, data]);
      offset = this._last.offset;
      delete this._last;
    } else {
      offset = data.indexOf(COMMANDS.IAC);
    }

    while( offset !== -1 ) {
      // Check if we have at least 2 bytes of data, if not we need to wait for the next round of data
      if (data.length <  offset + 2) {
        this._last = { data, offset };
        this.debug('Not enough data yet for cmd ', data.readUInt8(offset), 'at offset', offset);
        return;
      }

      let end;
      const buf = data.slice(offset);
      const cmd = {
        iac: buf.readUInt8(0),
        command: buf.readUInt8(1),
      }

      if (cmd.command === COMMANDS.SB) {
        end = buf.indexOf(COMMANDS.SE);

        // We do not have enough data yet, try again next round
        if (end === -1) {
          this._last = { data, offset };
          this.debug('SB Not enough data');
          return;
        }

        cmd.subcommand = buf.readUInt8(2);
        cmd.data = buf.slice(3, end - 1)  ;
      } else {
        if (buf.length >= 3) {
          cmd.option = buf.readUInt8(2);
          end = 2;
        } else
          end = 1;
      }

      let before;

      if (!offset)
        before = Buffer.alloc(0);
      else
        before = data.slice(0, offset);

      const after = buf.slice(end + 1);

      this.debug('RECV', COMMAND_NAMES[cmd.command] || cmd.command, OPTION_NAMES[cmd.option] || cmd.option || cmd.subcommand);

      data = Buffer.concat([before, after]);

      offset = data.indexOf(COMMANDS.IAC, before.length);

      this.emit('command', cmd);
    }

    if (data.length)
      this.emit('data', data);
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
    return this.command(COMMANDS.WILL, option);
  }

  wont(option) {
    return this.command(COMMANDS.WONT, option);
  }

  do(option) {
    return this.command(COMMANDS.DO, option);
  }

  dont(option) {
    return this.command(COMMANDS.DONT, option);
  }

  command(command, option) {
    const buf = new Buffer(3);

    this.debug('SENT', COMMAND_NAMES[command] || command, OPTION_NAMES[option] || option);

    buf[0] = COMMANDS.IAC;
    buf[1] = command;
    buf[2] = option;

    return this.write(buf);
  }

  close() {
    this._socket.destroy();
    this._last = null;
  }

  debug() {
    // console.log.apply(this, arguments);
  }

}

export default Telnet;
