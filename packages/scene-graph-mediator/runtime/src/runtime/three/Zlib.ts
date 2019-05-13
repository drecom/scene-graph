const USE_TYPEDARRAY = true;
const ZLIB_RAW_INFLATE_BUFFER_SIZE = 0x8000; // [ 0x8000 >= ZLIB_BUFFER_BLOCK_SIZE ]

const CompressionMethod = {
  STORE: 0,
  DEFLATE: 8
};

function stringToByteArray(str: any) {
  var tmp = str.split('');
  var i;
  var il;

  for (i = 0, il = tmp.length; i < il; i++) {
    tmp[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
  }

  return tmp;
};

const Adler32: any = (array: any) => {
  if (typeof(array) === 'string') {
    array = stringToByteArray(array);
  }
  return Adler32.update(1, array);
};

Adler32.OptimizationParameter = 1024;

Adler32.update = (adler: any, array: any) => {
  var s1 = adler & 0xffff;
  var s2 = (adler >>> 16) & 0xffff;
  var len = array.length;
  var tlen;
  var i = 0;

  while (len > 0) {
    tlen = len > Adler32.OptimizationParameter ?
      Adler32.OptimizationParameter : len;
    len -= tlen;
    do {
      s1 += array[i++];
      s2 += s1;
    } while (--tlen);

    s1 %= 65521;
    s2 %= 65521;
  }

  return ((s2 << 16) | s1) >>> 0;
};


function buildHuffmanTable(lengths: any) {
  var listSize = lengths.length;
  var maxCodeLength = 0;
  var minCodeLength = Number.POSITIVE_INFINITY;
  var size;
  var table;
  var bitLength;
  var code;
  var skip;
  var reversed;
  var rtemp;
  var i;
  var il;
  var j;
  var value;

  // Math.max は遅いので最長の値は for-loop で取得する
  for (i = 0, il = listSize; i < il; ++i) {
    if (lengths[i] > maxCodeLength) {
      maxCodeLength = lengths[i];
    }
    if (lengths[i] < minCodeLength) {
      minCodeLength = lengths[i];
    }
  }

  size = 1 << maxCodeLength;
  table = (USE_TYPEDARRAY ? new Uint32Array(size) : new Array(size));

  // ビット長の短い順からハフマン符号を割り当てる
  for (bitLength = 1, code = 0, skip = 2; bitLength <= maxCodeLength;) {
    for (i = 0; i < listSize; ++i) {
      if (lengths[i] === bitLength) {
        // ビットオーダーが逆になるためビット長分並びを反転する
        for (reversed = 0, rtemp = code, j = 0; j < bitLength; ++j) {
          reversed = (reversed << 1) | (rtemp & 1);
          rtemp >>= 1;
        }

        // 最大ビット長をもとにテーブルを作るため、
        // 最大ビット長以外では 0 / 1 どちらでも良い箇所ができる
        // そのどちらでも良い場所は同じ値で埋めることで
        // 本来のビット長以上のビット数取得しても問題が起こらないようにする
        value = (bitLength << 16) | i;
        for (j = reversed; j < size; j += skip) {
          table[j] = value;
        }

        ++code;
      }
    }

    // 次のビット長へ
    ++bitLength;
    code <<= 1;
    skip <<= 1;
  }

  return [table, maxCodeLength, minCodeLength];
};

class RawInflate {
  public static readonly BufferType = {
    BLOCK: 0,
    ADAPTIVE: 1
  };

  public static readonly MaxBackwardLength = 32768;
  public static readonly MaxCopyLength = 258;

  public static readonly Order = (function(table: any) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table;
  })([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  public static readonly LengthCodeTable = (function(table: any) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table;
  })([
    0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b,
    0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b,
    0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3,
    0x00e3, 0x0102, 0x0102, 0x0102
  ]);
  public static readonly LengthExtraTable = (function(table: any) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table;
  })([
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5,
    5, 5, 0, 0, 0
  ]);
  public static readonly DistCodeTable = (function(table: any) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table;
  })([
    0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011,
    0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181,
    0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001,
    0x3001, 0x4001, 0x6001
  ]);
  public static readonly DistExtraTable = (function(table: any) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table;
  })([
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11,
    11, 12, 12, 13, 13
  ]);
  public static readonly FixedLiteralLengthTable = (function(table: any) {
    return table;
  })((function() {
    var lengths = (USE_TYPEDARRAY ? new Uint8Array(288) : new Array(288));
    var i, il;

    for (i = 0, il = lengths.length; i < il; ++i) {
      lengths[i] =
        (i <= 143) ? 8 :
        (i <= 255) ? 9 :
        (i <= 279) ? 7 :
        8;
    }

    return buildHuffmanTable(lengths);
  })());
  public static readonly FixedDistanceTable = (function(table: any) {
    return table;
  })((function() {
    var lengths = (USE_TYPEDARRAY ? new Uint8Array(30) : new Array(30));
    var i, il;

    for (i = 0, il = lengths.length; i < il; ++i) {
      lengths[i] = 5;
    }

    return buildHuffmanTable(lengths);
  })());

  public buffer: any;
  public blocks: any = [];
  public bufferSize: any = ZLIB_RAW_INFLATE_BUFFER_SIZE;
  public totalpos: any = 0;
  public ip: any = 0;
  public bitsbuf: any = 0;
  public bitsbuflen: any = 0;
  public input!: any;
  public output: any;
  public op: any;
  public bfinal: any = false;
  public bufferType: any = RawInflate.BufferType.ADAPTIVE;
  public resize: any = false;

  public currentLitlenTable: any;

  constructor(input: any, opt_params: any) {
    this.input = USE_TYPEDARRAY ? new Uint8Array(input) : input;

    // option parameters
    if (opt_params || !(opt_params = {})) {
      if (opt_params['index']) {
        this.ip = opt_params['index'];
      }
      if (opt_params['bufferSize']) {
        this.bufferSize = opt_params['bufferSize'];
      }
      if (opt_params['bufferType']) {
        this.bufferType = opt_params['bufferType'];
      }
      if (opt_params['resize']) {
        this.resize = opt_params['resize'];
      }
    }

    // initialize
    switch (this.bufferType) {
      case RawInflate.BufferType.BLOCK:
        this.op = RawInflate.MaxBackwardLength;
        const size = RawInflate.MaxBackwardLength +
          this.bufferSize +
          RawInflate.MaxCopyLength
        this.output =
          (USE_TYPEDARRAY ? new Uint8Array(size) : new Array(size));
        break;
      case RawInflate.BufferType.ADAPTIVE:
        this.op = 0;
        this.output = (USE_TYPEDARRAY ? new Uint8Array(this.bufferSize) : new Array(this.bufferSize));
        break;
      default:
        throw new Error('invalid inflate mode');
    }
  }


  decompress() {
    while (!this.bfinal) {
      this.parseBlock();
    }

    switch (this.bufferType) {
      case RawInflate.BufferType.BLOCK:
        return this.concatBufferBlock();
      case RawInflate.BufferType.ADAPTIVE:
        return this.concatBufferDynamic();
      default:
        throw new Error('invalid inflate mode');
    }
  }

  parseBlock() {
    var hdr = this.readBits(3);

    // BFINAL
    if (hdr & 0x1) {
      this.bfinal = true;
    }

    // BTYPE
    hdr >>>= 1;
    switch (hdr) {
      // uncompressed
      case 0:
        this.parseUncompressedBlock();
        break;
      // fixed huffman
      case 1:
        this.parseFixedHuffmanBlock();
        break;
      // dynamic huffman
      case 2:
        this.parseDynamicHuffmanBlock();
        break;
      // reserved or other
      default:
        throw new Error('unknown BTYPE: ' + hdr);
    }
  }

  readBits(length: number) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;

    var inputLength = input.length;
    var octet;

    // input byte
    if (ip + ((length - bitsbuflen + 7) >> 3) >= inputLength) {
      throw new Error('input buffer is broken');
    }

    // not enough buffer
    while (bitsbuflen < length) {
      bitsbuf |= input[ip++] << bitsbuflen;
      bitsbuflen += 8;
    }

    // output byte
    octet = bitsbuf & /* MASK */ ((1 << length) - 1);
    bitsbuf >>>= length;
    bitsbuflen -= length;

    this.bitsbuf = bitsbuf;
    this.bitsbuflen = bitsbuflen;
    this.ip = ip;

    return octet;
  }

  readCodeByTable(table: any) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;

    var inputLength = input.length;
    var codeTable = table[0];
    var maxCodeLength = table[1];
    var codeWithLength;
    var codeLength;

    // not enough buffer
    while (bitsbuflen < maxCodeLength) {
      if (ip >= inputLength) {
        break;
      }
      bitsbuf |= input[ip++] << bitsbuflen;
      bitsbuflen += 8;
    }

    // read max length
    codeWithLength = codeTable[bitsbuf & ((1 << maxCodeLength) - 1)];
    codeLength = codeWithLength >>> 16;

    if (codeLength > bitsbuflen) {
      throw new Error('invalid code length: ' + codeLength);
    }

    this.bitsbuf = bitsbuf >> codeLength;
    this.bitsbuflen = bitsbuflen - codeLength;
    this.ip = ip;

    return codeWithLength & 0xffff;
  }

  parseUncompressedBlock() {
    var input = this.input;
    var ip = this.ip;
    var output = this.output;
    var op = this.op;

    var inputLength = input.length;
    var len;
    var nlen;
    var olength = output.length;
    var preCopy;

    // skip buffered header bits
    this.bitsbuf = 0;
    this.bitsbuflen = 0;

    // len
    if (ip + 1 >= inputLength) {
      throw new Error('invalid uncompressed block header: LEN');
    }
    len = input[ip++] | (input[ip++] << 8);

    // nlen
    if (ip + 1 >= inputLength) {
      throw new Error('invalid uncompressed block header: NLEN');
    }
    nlen = input[ip++] | (input[ip++] << 8);

    // check len & nlen
    if (len === ~nlen) {
      throw new Error('invalid uncompressed block header: length verify');
    }

    // check size
    if (ip + len > input.length) { throw new Error('input buffer is broken'); }

    // expand buffer
    switch (this.bufferType) {
      case RawInflate.BufferType.BLOCK:
        // pre copy
        while (op + len > output.length) {
          preCopy = olength - op;
          len -= preCopy;
          if (USE_TYPEDARRAY) {
            output.set(input.subarray(ip, ip + preCopy), op);
            op += preCopy;
            ip += preCopy;
          } else {
            while (preCopy--) {
              output[op++] = input[ip++];
            }
          }
          this.op = op;
          output = this.expandBufferBlock();
          op = this.op;
        }
        break;
      case RawInflate.BufferType.ADAPTIVE:
        while (op + len > output.length) {
          output = this.expandBufferAdaptive({fixRatio: 2});
        }
        break;
      default:
        throw new Error('invalid inflate mode');
    }

    // copy
    if (USE_TYPEDARRAY) {
      output.set(input.subarray(ip, ip + len), op);
      op += len;
      ip += len;
    } else {
      while (len--) {
        output[op++] = input[ip++];
      }
    }

    this.ip = ip;
    this.op = op;
    this.output = output;
  }

  parseFixedHuffmanBlock() {
    switch (this.bufferType) {
      case RawInflate.BufferType.ADAPTIVE:
        this.decodeHuffmanAdaptive(
          RawInflate.FixedLiteralLengthTable,
          RawInflate.FixedDistanceTable
        );
        break;
      case RawInflate.BufferType.BLOCK:
        this.decodeHuffmanBlock(
          RawInflate.FixedLiteralLengthTable,
          RawInflate.FixedDistanceTable
        );
        break;
      default:
        throw new Error('invalid inflate mode');
    }
  }

  parseDynamicHuffmanBlock() {
    var hlit = this.readBits(5) + 257;
    var hdist = this.readBits(5) + 1;
    var hclen = this.readBits(4) + 4;
    var codeLengths =
      (USE_TYPEDARRAY ? new Uint8Array(RawInflate.Order.length) : new Array(RawInflate.Order.length));
    var codeLengthsTable;
    var litlenTable;
    var distTable;
    var lengthTable: any;
    var code;
    var prev;
    var repeat;
    var i;
    var il;

    // decode code lengths
    for (i = 0; i < hclen; ++i) {
      codeLengths[RawInflate.Order[i]] = this.readBits(3);
    }
    if (!USE_TYPEDARRAY) {
      for (i = hclen, hclen = codeLengths.length; i < hclen; ++i) {
        codeLengths[RawInflate.Order[i]] = 0;
      }
    }

    // decode length table
    codeLengthsTable = buildHuffmanTable(codeLengths);
    lengthTable = (USE_TYPEDARRAY ? new Uint8Array(hlit + hdist) : new Array(hlit + hdist));
    for (i = 0, il = hlit + hdist; i < il;) {
      code = this.readCodeByTable(codeLengthsTable);
      switch (code) {
        case 16:
          repeat = 3 + this.readBits(2);
          while (repeat--) { lengthTable[i++] = prev; }
          break;
        case 17:
          repeat = 3 + this.readBits(3);
          while (repeat--) { lengthTable[i++] = 0; }
          prev = 0;
          break;
        case 18:
          repeat = 11 + this.readBits(7);
          while (repeat--) { lengthTable[i++] = 0; }
          prev = 0;
          break;
        default:
          lengthTable[i++] = code;
          prev = code;
          break;
      }
    }

    litlenTable = USE_TYPEDARRAY
      ? buildHuffmanTable(lengthTable.subarray(0, hlit))
      : buildHuffmanTable(lengthTable.slice(0, hlit));
    distTable = USE_TYPEDARRAY
      ? buildHuffmanTable(lengthTable.subarray(hlit))
      : buildHuffmanTable(lengthTable.slice(hlit));

    switch (this.bufferType) {
      case RawInflate.BufferType.ADAPTIVE:
        this.decodeHuffmanAdaptive(litlenTable, distTable);
        break;
      case RawInflate.BufferType.BLOCK:
        this.decodeHuffmanBlock(litlenTable, distTable);
        break;
      default:
        throw new Error('invalid inflate mode');
    }
  }

  decodeHuffmanBlock(litlen: any, dist: any) {
    var output = this.output;
    var op = this.op;

    this.currentLitlenTable = litlen;

    var olength = output.length - RawInflate.MaxCopyLength;
    var code;
    var ti;
    var codeDist;
    var codeLength;

    var lengthCodeTable = RawInflate.LengthCodeTable;
    var lengthExtraTable = RawInflate.LengthExtraTable;
    var distCodeTable = RawInflate.DistCodeTable;
    var distExtraTable = RawInflate.DistExtraTable;

    while ((code = this.readCodeByTable(litlen)) !== 256) {
      // literal
      if (code < 256) {
        if (op >= olength) {
          this.op = op;
          output = this.expandBufferBlock();
          op = this.op;
        }
        output[op++] = code;

        continue;
      }

      // length code
      ti = code - 257;
      codeLength = lengthCodeTable[ti];
      if (lengthExtraTable[ti] > 0) {
        codeLength += this.readBits(lengthExtraTable[ti]);
      }

      // dist code
      code = this.readCodeByTable(dist);
      codeDist = distCodeTable[code];
      if (distExtraTable[code] > 0) {
        codeDist += this.readBits(distExtraTable[code]);
      }

      // lz77 decode
      if (op >= olength) {
        this.op = op;
        output = this.expandBufferBlock();
        op = this.op;
      }
      while (codeLength--) {
        output[op] = output[(op++) - codeDist];
      }
    }

    while (this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--;
    }
    this.op = op;
  }

  decodeHuffmanAdaptive(litlen: any, dist: any) {
    var output = this.output;
    var op = this.op;

    this.currentLitlenTable = litlen;

    var olength = output.length;
    var code;
    var ti;
    var codeDist;
    var codeLength;

    var lengthCodeTable = RawInflate.LengthCodeTable;
    var lengthExtraTable = RawInflate.LengthExtraTable;
    var distCodeTable = RawInflate.DistCodeTable;
    var distExtraTable = RawInflate.DistExtraTable;

    while ((code = this.readCodeByTable(litlen)) !== 256) {
      // literal
      if (code < 256) {
        if (op >= olength) {
          output = this.expandBufferAdaptive();
          olength = output.length;
        }
        output[op++] = code;

        continue;
      }

      // length code
      ti = code - 257;
      codeLength = lengthCodeTable[ti];
      if (lengthExtraTable[ti] > 0) {
        codeLength += this.readBits(lengthExtraTable[ti]);
      }

      // dist code
      code = this.readCodeByTable(dist);
      codeDist = distCodeTable[code];
      if (distExtraTable[code] > 0) {
        codeDist += this.readBits(distExtraTable[code]);
      }

      // lz77 decode
      if (op + codeLength > olength) {
        output = this.expandBufferAdaptive();
        olength = output.length;
      }
      while (codeLength--) {
        output[op] = output[(op++) - codeDist];
      }
    }

    while (this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--;
    }
    this.op = op;
  }

  expandBufferBlock(_opt_param?: any) {
    const size = this.op - RawInflate.MaxBackwardLength;
    var buffer: any =
      (USE_TYPEDARRAY ? new Uint8Array(size) : new Array(size));
    var backward = this.op - RawInflate.MaxBackwardLength;
    var i;
    var il;

    var output = this.output;

    // copy to output buffer
    if (USE_TYPEDARRAY) {
      buffer.set(output.subarray(RawInflate.MaxBackwardLength, buffer.length));
    } else {
      for (i = 0, il = buffer.length; i < il; ++i) {
        buffer[i] = output[i + RawInflate.MaxBackwardLength];
      }
    }

    this.blocks.push(buffer);
    this.totalpos += buffer.length;

    // copy to backward buffer
    if (USE_TYPEDARRAY) {
      output.set(
        output.subarray(backward, backward + RawInflate.MaxBackwardLength)
      );
    } else {
      for (i = 0; i < RawInflate.MaxBackwardLength; ++i) {
        output[i] = output[backward + i];
      }
    }

    this.op = RawInflate.MaxBackwardLength;

    return output;
  }

  expandBufferAdaptive(opt_param?: any) {
    var buffer;
    var ratio = (this.input.length / this.ip + 1) | 0;
    var maxHuffCode;
    var newSize;
    var maxInflateSize;

    var input = this.input;
    var output = this.output;

    if (opt_param) {
      if (typeof opt_param.fixRatio === 'number') {
        ratio = opt_param.fixRatio;
      }
      if (typeof opt_param.addRatio === 'number') {
        ratio += opt_param.addRatio;
      }
    }

    // calculate new buffer size
    if (ratio < 2) {
      maxHuffCode =
        (input.length - this.ip) / this.currentLitlenTable[2];
      maxInflateSize = (maxHuffCode / 2 * 258) | 0;
      newSize = maxInflateSize < output.length ?
        output.length + maxInflateSize :
        output.length << 1;
    } else {
      newSize = output.length * ratio;
    }

    // buffer expantion
    if (USE_TYPEDARRAY) {
      buffer = new Uint8Array(newSize);
      buffer.set(output);
    } else {
      buffer = output;
    }

    this.output = buffer;

    return this.output;
  }

  concatBufferBlock() {
    var pos = 0;
    var limit = this.totalpos + (this.op - RawInflate.MaxBackwardLength);
    var output = this.output;
    var blocks = this.blocks;
    var block;
    var buffer = (USE_TYPEDARRAY ? new Uint8Array(limit) : new Array(limit));
    var i;
    var il;
    var j;
    var jl;

    // single buffer
    if (blocks.length === 0) {
      return USE_TYPEDARRAY ?
        this.output.subarray(RawInflate.MaxBackwardLength, this.op) :
        this.output.slice(RawInflate.MaxBackwardLength, this.op);
    }

    // copy to buffer
    for (i = 0, il = blocks.length; i < il; ++i) {
      block = blocks[i];
      for (j = 0, jl = block.length; j < jl; ++j) {
        buffer[pos++] = block[j];
      }
    }

    // current buffer
    for (i = RawInflate.MaxBackwardLength, il = this.op; i < il; ++i) {
      buffer[pos++] = output[i];
    }

    this.blocks = [];
    this.buffer = buffer;

    return this.buffer;
  }

  concatBufferDynamic() {
    var buffer;
    var op = this.op;

    if (USE_TYPEDARRAY) {
      if (this.resize) {
        buffer = new Uint8Array(op);
        buffer.set(this.output.subarray(0, op));
      } else {
        buffer = this.output.subarray(0, op);
      }
    } else {
      if (this.output.length > op) {
        this.output.length = op;
      }
      buffer = this.output;
    }

    this.buffer = buffer;

    return this.buffer;
  }
}


class Inflate {
  public static readonly BufferType = RawInflate.BufferType;

  public input!: any;
  public ip = 0;
  public rawinflate: any;
  public verify: any;

  public method: any;

  constructor(input: any, opt_params?: any) {
    var cmf;
    var flg;

    this.input = input;

    // option parameters
    if (opt_params || !(opt_params = {})) {
      if (opt_params['index']) {
        this.ip = opt_params['index'];
      }
      if (opt_params['verify']) {
        this.verify = opt_params['verify'];
      }
    }

    // Compression Method and Flags
    cmf = input[this.ip++];
    flg = input[this.ip++];

    // compression method
    switch (cmf & 0x0f) {
      case CompressionMethod.DEFLATE:
        this.method = CompressionMethod.DEFLATE;
        break;
      default:
        throw new Error('unsupported compression method');
    }

    // fcheck
    if (((cmf << 8) + flg) % 31 !== 0) {
      throw new Error('invalid fcheck flag:' + ((cmf << 8) + flg) % 31);
    }

    // fdict (not supported)
    if (flg & 0x20) {
      throw new Error('fdict flag is not supported');
    }

    // RawInflate
    this.rawinflate = new RawInflate(input, {
      'index': this.ip,
      'bufferSize': opt_params['bufferSize'],
      'bufferType': opt_params['bufferType'],
      'resize': opt_params['resize']
    });
  }

  decompress() {
    var input = this.input;
    var buffer;
    var adler32;

    buffer = this.rawinflate.decompress();
    this.ip = this.rawinflate.ip;

    // verify adler-32
    if (this.verify) {
      adler32 = (
        input[this.ip++] << 24 | input[this.ip++] << 16 |
        input[this.ip++] << 8 | input[this.ip++]
      ) >>> 0;

      if (adler32 !== Adler32(buffer)) {
        throw new Error('invalid adler-32 checksum');
      }
    }

    return buffer;
  }
}

const Zip = {
  CompressionMethod: CompressionMethod
};
const Huffman = {
  buildHuffmanTable: buildHuffmanTable
};

export {
  Zip,
  Huffman,
  RawInflate,
  Inflate
};
