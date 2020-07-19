const path = require("path");
const utils = require("./utils");

const MAX_PUTOBJECT_SIZE = 5 * 1024 * 1024 * 1024;
const MAX_DELETE_COUNT = 1000;
const MAX_MULTIPART_COUNT = 10000;
const MIN_MULTIPART_SIZE = 5 * 1024 * 1024;

const TO_UNIX_RE = new RegExp(utils.quotemeta(path.sep), "g");

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 * 1024;
const COMMON_UPLOAD_SIZE_1 = 10 * 1024 * 1024;
const COMMON_UPLOAD_SIZE_2 = 15 * 1024 * 1024;
const MIN_UPLOAD_SIZE = 5 * 1024 * 1024;

module.exports = {
  MAX_PUTOBJECT_SIZE,
  MAX_DELETE_COUNT,
  MAX_MULTIPART_COUNT,
  MIN_MULTIPART_SIZE,
  TO_UNIX_RE,

  MAX_UPLOAD_SIZE,
  COMMON_UPLOAD_SIZE_1,
  COMMON_UPLOAD_SIZE_2,
  MIN_UPLOAD_SIZE
}
