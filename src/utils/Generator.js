
var uuid = require('uuid'),
    syllables = {
      ubaidian: [
        'tu', 'nos', 'vos', 'is', 'ea', 'id', 'suus',
        'meus', 'ipse', 'a', 'um', 'pro', 'nam', 'nunc',
        'ita', 'ous', 'galle', 'nte'],
      hederaa: [
        'ma', 'kima', 'mala', 'ma', 'su', 'lu', 'am',
        'ayu', 'minu', 'ghu', 'dru', 'innu', 'sag', 'ga', 'ka']
    };

var Generator = {
  rfloor: function(value) {
    return global.Math.floor(global.Math.random() * value);
  },

  getGuest: function() {
    var ids = uuid.v4().split('-');
    return 'guest (' + ids[0] + ')';
  },

  getName: function(race) {
    var r, s, num = Generator.rfloor(3) + 2,
        parts = [];
    for(var i=0; i<num; i++) {
      s = syllables[race];
      r = Generator.rfloor(s.length);
      parts.push(s[r]);
    }
    switch(race) {
      case 'ubadian':
        if(parts.length >= 4) {
          parts.splice(2, 0, ' ');
        }
        break;
      case 'hederaa':
        parts.splice(1, 0, '\'');
        break;
    }
    return parts.join('');
  },

  getUsername: function() {
    var races = Object.keys(syllables),
        race = races[Generator.rfloor(races.length)],
        name = Generator.getName(race);
    if(name.length > 8) {
      name = name.slice(0, 8 + Generator.rfloor(global.Math.max(name.length/2 - 8, 0)));
    }
    return name.replace(/[^a-zA-Z]+/g, '');
  }
};

module.exports = Generator;
