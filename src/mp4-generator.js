(function(window, videojs, undefined) {
'use strict';

var box, dinf, ftyp, minf, moov, mvex, mvhd, trak, tkhd, mdia, mdhd, hdlr, stbl,
    stsd, types, MAJOR_BRAND, MINOR_VERSION, VIDEO_HDLR, DREF, TREX, Uint8Array, DataView;

Uint8Array = window.Uint8Array;
DataView = window.DataView;

// pre-calculate constants
(function() {
  var i;
  types = {
    avc1: [], // codingname
    dinf: [],
    dref: [],
    ftyp: [],
    hdlr: [],
    mdhd: [],
    mdia: [],
    minf: [],
    moov: [],
    mvex: [],
    mvhd: [],
    stbl: [],
    stco: [],
    stsc: [],
    stsd: [],
    stts: [],
    trak: [],
    trex: [],
    tkhd: []
  };

  for (i in types) {
    if (types.hasOwnProperty(i)) {
      types[i] = [
        i.charCodeAt(0),
        i.charCodeAt(1),
        i.charCodeAt(2),
        i.charCodeAt(3)
      ];
    }
  }

  MAJOR_BRAND = new Uint8Array([
    'i'.charCodeAt(0),
    's'.charCodeAt(0),
    'o'.charCodeAt(0),
    'm'.charCodeAt(0)
  ]);
  MINOR_VERSION = new Uint8Array([0, 0, 0, 1]);
  VIDEO_HDLR = new Uint8Array([
    0x00, // version 0
    0x00, 0x00, 0x00, // flags
    0x00, 0x00, 0x00, 0x00, // pre_defined
    0x76, 0x69, 0x64, 0x65, // handler_type: 'vide'
    0x00, 0x00, 0x00, 0x00, // reserved
    0x00, 0x00, 0x00, 0x00, // reserved
    0x00, 0x00, 0x00, 0x00, // reserved
    0x56, 0x69, 0x64, 0x65,
    0x6f, 0x48, 0x61, 0x6e,
    0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'VideoHandler'
  ]);
  DREF = new Uint8Array([
    0x00, // version 0
    0x00, 0x00, 0x00, // flags
    0x00, 0x00, 0x00, 0x00 // entry_count
  ]);
  TREX = new Uint8Array([
    0x00, // version 0
    0x00, 0x00, 0x00, // flags
    0x00, 0x00, 0x00, 0x01, // track_ID
    0x00, 0x00, 0x00, 0x01, // default_sample_description_index
    0x00, 0x00, 0x00, 0x00, // default_sample_duration
    0x00, 0x00, 0x00, 0x00, // default_sample_size
    0x00, 0x01, 0x00, 0x01 // default_sample_flags
  ]);
})();

box = function(type) {
  var
    payload = Array.prototype.slice.call(arguments, 1),
    size = 0,
    i = payload.length,
    result,
    view;

  // calculate the total size we need to allocate
  while (i--) {
    size += payload[i].byteLength;
  }
  result = new Uint8Array(size + 8);
  view = new DataView(result.buffer, result.byteOffset, result.byteLength);
  view.setUint32(0, result.byteLength);
  result.set(type, 4);

  // copy the payload into the result
  for (i = 0, size = 8; i < payload.length; i++) {
    result.set(payload[i], size);
    size += payload[i].byteLength;
  }
  return result;
};

dinf = function() {
  return box(types.dinf, box(types.dref, DREF));
};

ftyp = function() {
  return box(types.ftyp, MAJOR_BRAND, MINOR_VERSION, MAJOR_BRAND);
};

hdlr = function() {
  return box(types.hdlr, VIDEO_HDLR);
};
mdhd = function(duration) {
  return box(types.mdhd, new Uint8Array([
    0x00, // version 0
    0x00, 0x00, 0x00, // flags
    0x00, 0x00, 0x00, 0x02, // creation_time
    0x00, 0x00, 0x00, 0x03, // modification_time
    0x00, 0x00, 0x00, 0x3c, // timescale
    (duration & 0xFF000000) >> 24,
    (duration & 0xFF0000) >> 16,
    (duration & 0xFF00) >> 8,
    duration & 0xFF, // duration
    0x55, 0xc4, // 'und' language (undetermined)
    0x00, 0x00
  ]));
};
mdia = function(duration, width, height) {
  return box(types.mdia, mdhd(duration), hdlr(), minf(width, height));
};
minf = function(width, height) {
  return box(types.minf, dinf(), stbl(width, height));
};
moov = function(duration, width, height) {
  return box(types.moov, mvhd(duration), trak(duration, width, height), mvex());
};
mvex = function() {
  return box(types.mvex, box(types.trex, TREX));
};
mvhd = function(duration) {
  var
    bytes = new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x01, // creation_time
      0x00, 0x00, 0x00, 0x02, // modification_time
      0x00, 0x00, 0x00, 0x01, // timescale, 1 "tick" per second
      (duration & 0xFF000000) >> 24,
      (duration & 0xFF0000) >> 16,
      (duration & 0xFF00) >> 8,
      duration & 0xFF, // duration
      0x00, 0x01, 0x00, 0x00, // 1.0 rate
      0x01, 0x00, // 1.0 volume
      0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x40, 0x00, 0x00, 0x00, // transformation: unity matrix
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, // pre_defined
      0x00, 0x00, 0x00, 0x01 // next_track_ID
    ]);
  return box(types.mvhd, bytes);
};

stbl = function(width, height) {
  return box(types.stbl,
             stsd(width, height),
             box(types.stts),
             box(types.stsc),
             box(types.stco));
};

stsd = function(width, height) {
  return box(types.stsd, new Uint8Array([
    0x00, // version 0
    0x00, 0x00, 0x00, // flags
    0x00, 0x00, 0x00, 0x01]),
    box(types.avc1, new Uint8Array([
      0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, // reserved
      0x00, 0x01, // data_reference_index
      0x00, 0x00, // pre_defined
      0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, // pre_defined
      (width & 0xff00) >> 8,
      width & 0xff, // width
      (height & 0xff00) >> 8,
      height & 0xff, // height
      0x00, 0x48, 0x00, 0x00, // horizresolution
      0x00, 0x48, 0x00, 0x00, // vertresolution
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x01, // frame_count
      0x13,
      0x76, 0x69, 0x64, 0x65,
      0x6f, 0x6a, 0x73, 0x2d,
      0x63, 0x6f, 0x6e, 0x74,
      0x72, 0x69, 0x62, 0x2d,
      0x68, 0x6c, 0x73, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, // compressorname
      0x00, 0x18, // depth = 24
      0x11, 0x11]))); // pre_defined = -1
};

tkhd = function(duration, width, height) {
  return box(types.tkhd, new Uint8Array([
    0x00, // version 0
    0x00, 0x00, 0x00, // flags
    0x00, 0x00, 0x00, 0x00, // creation_time
    0x00, 0x00, 0x00, 0x00, // modification_time
    0x00, 0x00, 0x00, 0x01, // track_ID
    0x00, 0x00, 0x00, 0x00, // reserved
    (duration & 0xFF000000) >> 24,
    (duration & 0xFF0000) >> 16,
    (duration & 0xFF00) >> 8,
    duration & 0xFF, // duration
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, // reserved
    0x00, 0x00, // layer
    0x00, 0x00, // alternate_group
    0x00, 0x00, // non-audio track volume
    0x00, 0x00, // reserved
    0x00, 0x01, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x40, 0x00, 0x00, 0x00, // transformation: unity matrix
    (width & 0xFF000000) >> 24,
    (width & 0xFF0000) >> 16,
    (width & 0xFF00) >> 8,
    width & 0xFF, // width
    (height & 0xFF000000) >> 24,
    (height & 0xFF0000) >> 16,
    (height & 0xFF00) >> 8,
    height & 0xFF // height
  ]));
};

trak = function(duration, width, height) {
  return box(types.trak, tkhd(duration, width, height), mdia(duration, width, height));
};

window.videojs.mp4 = {
  ftyp: ftyp,
  moov: moov,
  initSegment: function() {
    var
      fileType = ftyp(),
      movie = moov(1, 1280, 720),
      result = new Uint8Array(fileType.byteLength + movie.byteLength);

    result.set(fileType);
    result.set(movie, fileType.byteLength);
    return result;
  }
};

})(window, window.videojs);