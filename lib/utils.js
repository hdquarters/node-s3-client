const path = require("path");
const url = require("url");
const constants = require("./constants");

const toUnixSep = str => str.replace(constants.TO_UNIX_RE, "/");
const toNativeSep = str => str.replace(/\//g, path.sep);
const quotemeta = str => String(str).replace(/(\W)/g, "\\$1");

const ensureChar = (str, c) => str[str.length - 1] === c ? str : str + c;
const ensureSep = dir => ensureChar(dir, path.sep);
const ensureSlash = dir => ensureChar(dir, "/");

const extend = (target, source) => {
  for (var propName in source) {
    target[propName] = source[propName];
  }
  return target;
}
const chunkArray = (array, maxLength) => {
  var slices = [array];
  while (slices[slices.length - 1].length > maxLength) {
    slices.push(slices[slices.length - 1].splice(maxLength));
  }
  return slices;
}

const cleanETag = eTag => eTag ? eTag.replace(/^\s*'?\s*"?\s*(.*?)\s*"?\s*'?\s*$/, "$1") : "";
const compareMultipartETag = (eTag, multipartETag) => multipartETag.anyMatch(cleanETag(eTag));
const getETagCount = eTag => {
  var match = (eTag || "").match(/[a-fA-F0-9]{32}-(\d+)$/);
  return match ? parseInt(match[1], 10) : 1;
}
const keyOnly = item => ({ Key: item.Key, VersionId: item.VersionId });
const encodeSpecialCharacters = filename => {
  return encodeURI(filename).replace(/[!'()* ]/g, function (char) {
    return "%" + char.charCodeAt(0).toString(16);
  });
}
const getPublicUrl = (bucket, key, bucketLocation, endpoint) => {
  const nonStandardBucketLocation = bucketLocation && bucketLocation !== "us-east-1";
  const hostnamePrefix = nonStandardBucketLocation ? "s3-" + bucketLocation : "s3";
  const parts = {
    protocol: "https:",
    hostname: hostnamePrefix + "." + (endpoint || "amazonaws.com"),
    pathname: "/" + bucket + "/" + encodeSpecialCharacters(key),
  };
  return url.format(parts);
}
const getPublicUrlHttp = (bucket, key, endpoint) => {
  const parts = {
    protocol: "http:",
    hostname: bucket + "." + (endpoint || "s3.amazonaws.com"),
    pathname: "/" + encodeSpecialCharacters(key),
  };
  return url.format(parts);
}

module.exports = {
  toUnixSep,
  toNativeSep,
  quotemeta,

  ensureSep,
  ensureSlash,

  extend,
  chunkArray,

  cleanETag,
  compareMultipartETag,
  getETagCount,
  keyOnly,
  encodeSpecialCharacters,
  getPublicUrl,
  getPublicUrlHttp
}


