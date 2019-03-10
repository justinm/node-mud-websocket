export const COLORS = {
  1:  'bold', // bold
  5:  'flash', // flash
  30: 'black', // black
  31: 'red', // red
  32: 'green', // green
  33: 'orange', // orange
  34: 'blue', // blue
  36: 'cyan', // cyan
  35: 'magenta', // magenta
  37: 'white', // white
  41: 'bold red',// bold red
  42: 'bold green', // bold green
  43: 'bold orange', // bold orange
  44: 'bold blue', // bold blue
  46: 'bold cyan', // bold cyan
  40: 'bold black', // bold black
  47: 'bold white', // bold white
  45: 'bold magenta', // bold magenta
};

const RESET   = '0;37;40';
const ESC     = String.fromCharCode(27);

class Parser {
  constructor(encoding = 'UTF-8') {
    this._encoding = encoding;
  }

  parse(text) {
    let offset = 0;
    let depth = [];

    offset = text.indexOf(ESC, offset, this._encoding);

    if (offset === -1)
      return text.toString();

    do {
      let end = text.indexOf('m', offset + 1, this._encoding);

      if (end !== -1) {
        const code = text.slice(offset + 2, end).toString(this._encoding);
        const before = text.slice(0, offset);
        const after = text.slice(end + 1);

        if (code === RESET) {
          const tags = depth.map((tag) => `</${tag}>`).join('');

          depth = [];

          const data = Buffer.alloc(tags.length, tags);

          text = Buffer.concat([before, data, after], before.length + data.length + after.length);
          end = before.length + data.length;
        } else
        if (COLORS[code]) {
          const span = new Buffer(`<span class="${COLORS[code]}">`);

          depth.push('span');

          text = Buffer.concat([before, span, after], before.length + span.length + after.length);
          end = before.length + span.length;
        } else {
          console.log('Unhandled escape code', code)
          // We need to remove the escape
          text = Buffer.concat([before, after]);
        }
      }

      offset = text.indexOf(ESC, end, this._encoding);
    } while(offset !== -1);

    let output = text.toString();

    // output = output.replace("\n", "<br/>");

    return output;
  }
}

export default new Parser();
