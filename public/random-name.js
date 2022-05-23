/*
  Pieces of star and similar names designed to allow random fabrication of plausible star names -- seems to work well!
*/
const nameParts = {
  prefix: ['a', 'aeg', 'ai', 'alf', 'alph', 'amn', 'an', 'and', 'apt', 'arct', 'ard', 'ath', 'aur', 'b', 'bell', 'bet', 'bor', 'c', 'call', 'can', 'canc', 'cap', 'ceph', 'ch', 'chl', 'cr', 'cz', 'delt', 'drac', 'e', 'eps', 'f', 'fom', 'g', 'gamm', 'gall', 'gat', 'gemi', 'gn', 'gr', 'h', 'heph', 'her', 'holl', 'i', 'in', 'ind', 'ir', 'j', 'k', 'kn', 'l', 'lep', 'lin', 'lov', 'm', 'malth', 'mar', 'med', 'mir', 'mirc', 'n', 'nept', 'o', 'or', 'pers', 'p', 'ph', 'plei', 'plut', 'pn', 'poll', 'pr', 'ps', 'pt', 'pyr', 'q', 'qu', 'r', 'rig', 's', 'sag', 'sc', 'sir', 'str', 't', 'taur', 'tell', 'th', 'tn', 'trop', 'ts', 'u', 'ull', 'ult', 'ur', 'v', 'veg', 'vesp', 'vr', 'w', 'wh', 'wr', 'x', 'xz', 'y', 'z', 'z'],
  middle: ['acl', 'ac', 'ad', 'aedr', 'agg', 'al', 'alh', 'alr', 'alt', 'am', 'an', 'apr', 'aqu', 'ar', 'ath', 'cul', 'e', 'ec', 'ed', 'ef', 'egg', 'elg', 'em', 'en', 'eph', 'er', 'et', 'i', 'iat', 'ib', 'ic', 'id', 'ig', 'il', 'ir', 'isc', 'ist', 'itt', 'od', 'of', 'om', 'on', 'oph', 'opt', 'orp', 'om', 'oth', 'ue', 'ulp', 'ulph', 'ur', 'und', 'us', 'ut', 'uu'],
  suffix: ['a', 'ae', 'ai', 'anae', 'ao', 'ar', 'arn', 'aur', 'aut', 'ea', 'ei', 'el', 'eo', 'eon', 'eos', 'es', 'ga', 'ho', 'holm', 'hus', 'i', 'ia', 'iea', 'ii', 'io', 'ion', 'is', 'las', 'o', 'oe', 'oea', 'oi', 'oia', 'on', 'one', 'or', 'orn', 'os', 'ov', 'ova', 'u', 'ua', 'ue', 'ula', 'uo', 'um', 'un', 'us', 'ux', 'z'],
  secondary: ['Major', 'Minor', 'Secundus', 'Tertius', 'Quartus', 'Quintus', 'Septimus', 'Octavus', 'Nonus', 'Decimus']
}

function randomName (PRNG, numberOfSyllables, allowSecondName, allowSecondary) {
  const syllables = []; let name; let suffix
  syllables.push(PRNG.pick(nameParts.prefix))
  for (let j = 2; j < numberOfSyllables; j++) {
    syllables.push(PRNG.pick(nameParts.middle))
  }
  syllables.push(PRNG.pick(nameParts.suffix))
  name = syllables.join('')
  suffix = PRNG.pick(['', 'first-name', 'second-name', 'secondary'], [8, 1, 1, 4])
  switch (suffix) {
    case 'first-name':
      if (allowSecondName !== false) {
        name = randomName(PRNG, PRNG.range(2, numberOfSyllables), false, false).capitalize() + ' ' + name
      }
      break
    case 'second-name':
      if (allowSecondName !== false) {
        name = name + ' ' + randomName(PRNG, PRNG.range(2, numberOfSyllables), false).capitalize()
      }
      break
    case 'secondary':
      if (allowSecondary !== false) {
        name += ' ' + PRNG.pick(nameParts.secondary)
      }
      break
  }
  return name.capitalize()
}

export { randomName }
