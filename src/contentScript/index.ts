import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
;(() => {
  const rootIdName = 'vite_crx_content_script'
  const beforeRoot = document.querySelector(`#${rootIdName}`)

  if (beforeRoot && __DEV__) {
    document.body.removeChild(beforeRoot)
  }

  const container = document.createElement('div')
  container.id = rootIdName

  const root = document.createElement('div')
  const styleEl = document.createElement('link')

  const shadowDOM =
    container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container

  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', chrome.runtime.getURL('contentScript/style.css'))

  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)

  document.body.appendChild(container)

  const app = createApp(App)
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.mount(root)
})()

// 给主页面导入 element css
// const link = document.createElement('link')
// link.rel = 'stylesheet'
// link.type = 'text/css'
// link.href = '//unpkg.com/element-plus/dist/index.css'
// document.head.appendChild(link)
