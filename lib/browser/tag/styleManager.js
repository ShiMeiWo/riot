import { $, mkEl, setAttr } from './../common/util/dom'
import { WIN } from './../common/global-variables'

let styleNode
// Create cache and shortcut to the correct property
let cssTextProp
let byName = {}
let remainder = []
let needsInject = false

// skip the following code on the server
if (WIN) {
  styleNode = ((() => {
    // create a new style element with the correct type
    const newNode = mkEl('style')
    // replace any user node or insert the new one into the head
    const userNode = $('style[type=riot]')

    setAttr(newNode, 'type', 'text/css')
    /* istanbul ignore next */
    if (userNode) {
      if (userNode.id) newNode.id = userNode.id
      userNode.parentNode.replaceChild(newNode, userNode)
    } else document.getElementsByTagName('head')[0].appendChild(newNode)

    return newNode
  }))()
  cssTextProp = styleNode.styleSheet
}

/**
 * Object that will be used to inject and manage the css of every tag instance
 */
export default {
  styleNode,
  /**
   * Save a tag style to be later injected into DOM
   * @param { String } css - css string
   * @param { String } name - if it's passed we will map the css to a tagname
   */
  add(css, name) {
    if (name) byName[name] = css
    else remainder.push(css)
    needsInject = true
  },
  /**
   * Inject all previously saved tag styles into DOM
   * innerHTML seems slow: http://jsperf.com/riot-insert-style
   */
  inject() {
    if (!WIN || !needsInject) return
    needsInject = false
    const style = Object.keys(byName)
      .map(k => byName[k])
      .concat(remainder).join('\n')
    /* istanbul ignore next */
    if (cssTextProp) cssTextProp.cssText = style
    else styleNode.innerHTML = style
  }
}
