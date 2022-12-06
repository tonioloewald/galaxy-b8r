// standard clamp function -- clamps a value into a range
Math.clamp = function (a, min, max) {
  return a < min ? min : (a > max ? max : a)
}

// linear interpolation from a to b by parameter t
Math.lerp = function (a, b, t) {
  return a * (1 - t) + b * t
}

// dumb ass roman numeral generator for naming planets after their star
export const romanNumeral = n => {
  const units = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix']

  if (!n) {
    return ''
  } else if (n < 0 || n >= 20) {
    return n
  } else if (n >= 10) {
    return 'x' + romanNumeral(n - 10)
  } else {
    return units[n - 1]
  }
}

// capitalizes first character of a string
export function capitalize (s) {
  if (s) {
    return s.substr(0, 1).toUpperCase() + s.substr(1)
  } else {
    return ''
  }
}

// renders an object / array as HTML
export function objToHTML (obj, recurse) {
  let html = ''
  for (const key in obj) {
    const label = capitalize(key.replace(/([a-z])([A-Z])/g, '$1 $2'))

    switch (typeof (obj[key])) {
      case 'string':
        html += '<b>' + label + '</b>: ' + obj[key] + '<br/>\n'
        break
      case 'number':
        if (obj[key] % 1 === 0) {
          html += '<b>' + label + '</b>: ' + obj[key] + '<br/>\n'
        } else {
          html += '<b>' + label + '</b>: ' + obj[key].toFixed(2) + '<br/>\n'
        }
        break
      case 'object':
        if (recurse) {
          html += '<h4>' + label + '</h4>\n'
          if (obj[key] !== null) {
            const value = obj[key]
            if (value.length !== undefined) {
              html += objToHTML(value, recurse)
            } else {
              html += '<div class="subrecord">' + objToHTML(value, recurse) + '</div>'
            }
          }
        }
        break
    }
  }
  return html
}
