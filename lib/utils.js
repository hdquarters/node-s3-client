const toUnixSep = str => str.replace(TO_UNIX_RE, "/");
const toNativeSep = str => str.replace(/\//g, path.sep);
const quotemeta = str => String(str).replace(/(\W)/g, "\\$1");

const ensureChar = (str, c) => str[str.length - 1] === c ? str : str + c;
const ensureSep = dir => ensureChar(dir, path.sep);
const ensureSlash = dir => ensureChar(dir, "/");

module.exports = {
  toUnixSep,
  toNativeSep,
  quotemeta,

  ensureSep,
  ensureSlash
}
