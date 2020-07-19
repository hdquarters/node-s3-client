const Transform = require("stream").Transform;
const util = require("util");
const crypto = require("crypto");
const constants = require("./constants");

module.exports = MultipartETag;

util.inherits(MultipartETag, Transform);
function MultipartETag(options) {
  options = options || {};
  Transform.call(this, options);
  let sizes = [
    constants.MAX_UPLOAD_SIZE,
    constants.MIN_UPLOAD_SIZE,
    constants.COMMON_UPLOAD_SIZE_1,
    constants.COMMON_UPLOAD_SIZE_2,
  ];
  if (options.size != null && options.count != null) {
    if (options.count === 1) {
      sizes = [constants.MAX_UPLOAD_SIZE];
    } else {
      sizes.push(guessPartSizeFromSizeAndCount(options.size, options.count));
    }
  }
  this.sums = [];
  this.bytes = 0;
  this.digest = null; // if it is less than MAX_UPLOAD_SIZE
  this.done = false;
  for (let i = 0; i < sizes.length; i += 1) {
    this.sums.push({
      size: sizes[i],
      hash: crypto.createHash("md5"),
      amtWritten: 0,
      digests: [],
      eTag: null,
    });
  }
}

MultipartETag.prototype._transform = function (chunk, encoding, callback) {
  this.bytes += chunk.length;
  for (let i = 0; i < this.sums.length; i += 1) {
    var sumObj = this.sums[i];
    var newAmtWritten = sumObj.amtWritten + chunk.length;
    if (newAmtWritten <= sumObj.size) {
      sumObj.amtWritten = newAmtWritten;
      sumObj.hash.update(chunk, encoding);
    } else {
      var finalBytes = sumObj.size - sumObj.amtWritten;
      sumObj.hash.update(chunk.slice(0, finalBytes), encoding);
      sumObj.digests.push(sumObj.hash.digest());
      sumObj.hash = crypto.createHash("md5");
      sumObj.hash.update(chunk.slice(finalBytes), encoding);
      sumObj.amtWritten = chunk.length - finalBytes;
    }
  }
  this.emit("progress");
  callback(null, chunk);
};

MultipartETag.prototype._flush = function (callback) {
  for (var i = 0; i < this.sums.length; i += 1) {
    var sumObj = this.sums[i];
    var digest = sumObj.hash.digest();
    sumObj.digests.push(digest);
    var finalHash = crypto.createHash("md5");
    for (var partIndex = 0; partIndex < sumObj.digests.length; partIndex += 1) {
      digest = sumObj.digests[partIndex];
      finalHash.update(digest);
    }
    sumObj.eTag = finalHash.digest("hex") + "-" + sumObj.digests.length;
    if (i === 0 && sumObj.digests.length === 1) {
      this.digest = digest;
    }
  }
  this.done = true;
  this.push(null);
  callback();
};

MultipartETag.prototype.anyMatch = function (eTag) {
  if (this.digest && this.digest.toString("hex") === eTag) {
    return true;
  }
  for (var i = 0; i < this.sums.length; i += 1) {
    if (this.sums[i].eTag === eTag) {
      return true;
    }
  }
  return false;
};

function guessPartSizeFromSizeAndCount(size, count) {
  var divided = size / count;
  var floored = Math.floor(divided);
  return divided === floored ? divided : floored + 1;
}
