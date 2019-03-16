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

    text = this.replace(text, '<', '&lt;');
    text = this.replace(text, '>', '&gt;');

    offset = text.indexOf(ESC, 0, this._encoding);

    while (offset !== -1) {
      let end = text.indexOf('m', offset, this._encoding);

      if (end !== -1) {
        const code = text.slice(offset + 2, end).toString(this._encoding);
        const before = text.slice(0, offset);
        const after = text.slice(end + 1);

        if (code === RESET) {
          const tags = depth.map((tag) => `</${tag}>`).join('');

          depth = [];

          const tagBuffer = Buffer.alloc(tags.length, tags);

          text = Buffer.concat([before, tagBuffer, after], before.length + tagBuffer.length + after.length);
          end = before.length + tagBuffer.length;
        } else
        if (COLORS[code]) {
          const span = new Buffer(`<span class="${COLORS[code]}">`);

          depth.push('span');

          text = Buffer.concat([before, span, after], before.length + span.length + after.length);
          end = before.length + span.length;
        } else {
          console.log('Dropping unknown code', code, 'at offset', offset);
          text = Buffer.concat([before, after]);
        }
      } else {
        console.log('Dropping at', offset, text.slice(offset + 1).toString());
        text = Buffer.concat([text.slice(0, offset - 1), text.slice(offset + 1)]);
      }

      offset = text.indexOf(ESC, end, this._encoding);
    }

    let output = text.toString();

    return output;
  }

  replace(buffer, string, replace) {
    let offset = buffer.indexOf(string);
    const replacement = Buffer.alloc(replace.length, replace);

    while(offset !== -1) {
      buffer = Buffer.concat([buffer.slice(0, offset), replacement, buffer.slice(offset + string.length)]);

      offset = buffer.indexOf(string)
    }

    return buffer;
  }
}

export default new Parser();
