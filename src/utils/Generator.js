
var syllables = {
  ubaidian: ['tu', 'nos', 'vos', 'is', 'ea', 'id', 'suus', 'meus', 'ipse', 'a', 'um', 'pro', 'nam', 'nunc', 'ita', 'ous', 'galle', 'nte'],
  hederaa: ['ma', 'kima', 'mala', 'ma', 'su', 'lu', 'am', 'ayyu', 'minu', 'ghu', 'dru', 'innu', 'sag', 'ga', 'ka']//,
  // mechan: [],
  // seekers: []
};

var Generator = {
  rfloor: function(value) {
    return global.Math.floor(global.Math.random() * value);
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
    return name.replace(/[^a-zA-Z]+/g, '');
  }
};

module.exports = Generator;
