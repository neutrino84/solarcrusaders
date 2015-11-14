
var XRegExp = require('xregexp').XRegExp;

var Sanitation = {
  invalidUnicodeChars: XRegExp('[^\\p{L}\\s\\d\\-_]', 'g'),
  invalidLatinChars: /[^\w\s\d\-_]/g,
  trimRegex: /^\s+|\s+$/g,
  collapseWhitespace: /\s+/g,
  collapseDash: /-+/g,
  trimTrailingDash: /-$/g,
  trimLeadingDash: /^-/g,
  isLatin: /^[\w\d\s.,\-@]+$/,
  languageKeyRegex: /\[\[[\w]+:.+\]\]/,
  ipRegex: /[^\d\.]/g,
  redisRegex: /:/g
};

Sanitation.ip = function(ip) {
  return ip.replace(Sanitation.ipRegex, '');
};

Sanitation.redis = function(key) {
  return key.replace(Sanitation.redisRegex, '');
};

Sanitation.slugify = function(str, preserveCase) {
  if(!str) { return ''; }
  str = str.replace(Sanitation.trimRegex, '');
  if(Sanitation.isLatin.test(str)) {
    str = str.replace(Sanitation.invalidLatinChars, '-');
  } else {
    str = XRegExp.replace(str, Sanitation.invalidUnicodeChars, '-');
  }
  str = !preserveCase ? str.toLocaleLowerCase() : str;
  str = str.replace(Sanitation.collapseWhitespace, '-');
  str = str.replace(Sanitation.collapseDash, '-');
  str = str.replace(Sanitation.trimTrailingDash, '');
  str = str.replace(Sanitation.trimLeadingDash, '');
  return str;
};

module.exports = Sanitation;
