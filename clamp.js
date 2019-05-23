// 用来多行显示省略号
// element，选择器字符串或者元素
// options: {
//   clamp: 行数或者px,
//   tail: 默认...，
//   tailHtml： ,
//   useNative: 使用wekit的非标准css特性，但是无法添加tailHtml,
// }
// 只能用于元素内部直接是文字的,不能有内嵌标签
(function (factory) {
  if(typeof module !== 'undefined' && module.exports) {
    module.exports = factory()
  } else if (typeof define === 'function' && define.amd) {
    define(factory)
  } else {
    window.$clamp = factory()
  }
})(function () {
  let spaceFlag = false;
  function clamp(element, options) {
    let target = element
    typeof element === 'string' && (target = document.querySelector(element))
    let nodeValue = target.lastChild.nodeValue
    if (!target.style || !nodeValue || target.lastChild.nodeType !== 3) {
      warn('need a element or a selector in first param and ...')
      return
    }
    options = {
      clamp: options.clamp || 2,
      tail: options.tail || '...',
      tailHtml: options.tailHtml || '',
      useNative: options.useNative || false
      // lang: options.lang || 'En'
    }
    if (options.useNative && target.style.webkitLineClamp !== undefined) {
      target.classList.add(`wekit-clamp-native-${options.clamp}`)
      return
    }
    options = Object.assign({}, options, getElementInfo(target), { target })
    let result = computeWords(options, nodeValue)
    target.innerHTML = result
  }

  let getLetterWidth = (function () {
    const checkObj = {
      chWidth: /[―…！\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b]/,
      checkEna: /[a-z]/,
      checkEnA: /[A-Z]/,
      puncWidth: /[.,\"\\?!:']/
    }
    return function (letter, fontWidth) {
      for (let reg in checkObj) {
        if (checkObj[reg].test(letter)) {
          spaceFlag = false
          return fontWidth[reg]
        }
      }
      // console.log(letter)
      if (spaceFlag) {
        return 0
      } else {
        spaceFlag = true
        return 2
      }
    }
  })()

  function getFontWidth(options) {
    let tmpEle = document.createElement('span')
    tmpEle.innerText = '透'
    tmpEle.style.cssText = `
        "font-size": "inherit",
        "font-family": "inherit",
        "letter-spacing" :"inherit"
        "position": "absolute"，
        "text-indent": 0
      `
    options.target.append(tmpEle)
    let chWidth = tmpEle.offsetWidth
    tmpEle.innerText = '.'
    let puncWidth = tmpEle.offsetWidth
    tmpEle.innerText = "a"
    let EnaWidth = tmpEle.offsetWidth
    tmpEle.innerText = 'A'
    let EnAWidth = tmpEle.offsetWidth
    tmpEle.remove()
    return {
      chWidth,
      puncWidth,
      EnaWidth,
      EnAWidth
    }
  }

  function computeWords(options, nodeValue) {
    let fontWidth = getFontWidth(options),
      rows,
      tialWidth,
      tialHtmlWidth = 0
    rows = typeof options.clamp === 'string' ?
      Math.max(Math.floor(parseFloat(options.clamp) / options.lineHeight), 0) : options.clamp
    if (options.tailHtml) {
      let reg = /(?<=<[^>]*>)[^<]*(?=<[^>]*>)/i
      let tailHtml = reg.exec(options.tailHtml)[0]
      // let wordsNum = Math.floor(rows * Math.floor(options.width / oneWid) - 
      //   options.textIndent / options.fontSize  - tailHtml.length - options.tail.length / 2)
      // return nodeValue.substring(0, wordsNum) + options.tail + options.tailHtml
      tialHtmlWidth = getTailWidth(fontWidth, tailHtml)
    }
    tialWidth = getTailWidth(fontWidth, options.tail)
    nodeValue = nodeValue.trim()
    let stringCount = 0
    for (let n = 0; n < rows; n++) {
      let theWidth = 0
      let letterWid = 0
      let targetWidth = options.width - (n === 0 ? options.textIndent : n === rows - 1 ? (tialHtmlWidth + tialWidth) : 0)
      while (1) {
        letterWid = getLetterWidth(nodeValue[stringCount], fontWidth)
        if (theWidth + letterWid <= targetWidth) {
          theWidth += letterWid
          stringCount++
        } else {
          if (theWidth + letterWid - options.letterSpacing < targetWidth) {
            theWidth += letterWid
            stringCount++
          } else {
            break;
          }
        }
      }
    }
    return nodeValue.substring(0, stringCount) + options.tail + options.tailHtml
  }

  function getTailWidth(fontWidth, tailHtml) {
    let array = tailHtml.split('')
    let width = 0;
    for (let x = 0, len = array.length; x < len; x++) {
      width += getLetterWidth(array[x], fontWidth)
    }
    return width
  }

  function warn(info) {
    console.error(`[clamp warn]: ${info}`)
  }

  function getElementInfo(target) {
    let compStyle = window.getComputedStyle(target)
    let result = {}
    result.letterSpacing = parseFloat(compStyle.getPropertyValue('letter-spacing'))
    result.fontSize = parseFloat(compStyle.getPropertyValue('font-size'))
    result.lineHeight = parseFloat(compStyle.getPropertyValue('line-height'))
    result.textIndent = parseFloat(compStyle.getPropertyValue('text-indent'))
    result.width = target.clientWidth
    if (isNaN(result.letterSpacing)) {
      result.letterSpacing = 0
    }
    if (isNaN(result.lineHeight)) {
      result.lineHeight = 1.2 * result.fontSize
    }
    return result
  }

  return clamp
})


