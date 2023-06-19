import { reactive } from 'vue'
import { SDEvents, sendMessage } from '../events/'

class Histories {
  _histories: Array<SavedTags>
  private savingType: string

  // histories 需要放到后台执行，各端需要同步
  constructor(savingType: string) {
    this._histories = reactive<Array<SavedTags>>([])
    this.savingType = savingType

    this.syncHistories()
  }

  get histories(): Array<SavedTags> {
    this.syncHistories().catch((err) => {
      console.log('sync history fail')
    })

    return this._histories
  }

  async syncHistories() {
    let event = ''
    if (this.savingType == 'user') {
      event = SDEvents.GetPromptsUserHist
    }
    if (this.savingType == 'auto') {
      event = SDEvents.GetPromptsAutoHist
    }

    await sendMessage(event, {})
      .then((hists: Array<SavedTags>) => {
        this._histories = hists
      })
      .catch((err) => {
        console.log('sync histories fail', err)
      })
    return null
  }

  saveHistory(tags: Array<SelectedTag>) {
    const ts = new Date().getTime()
    const savedTags = {
      timestamp: ts,
      selectedTags: tags
    }

    this.histories.push(savedTags)

    sendMessage(SDEvents.SavingPrompts, {
      stags: savedTags,
      savingType: this.savingType
    })
      .then((res) => {
        console.log('get saving prompts res : ', res)
      })
      .catch((err) => {
        console.log('got saving prompt err : ', err)
      })
  }

  deleteHistory(ts: number) {
    for (let i = 0; i < this.histories.length; i++) {
      const v = this.histories[i]
      if (v.timestamp == ts) {
        // 删除一个元素
        this.histories.splice(i, 1)
        return
      }
    }
  }
}

const autoHistories = new Histories('auto')
const userHistories = new Histories('user')

// userHistories.histories.value.push({
//   timestamp: new Date().getTime() - 1000 * 60 * 60 * 11,
//   selectedTags: [
//     {
//       id: 1,
//       enhance: 1,
//       nameCh: '高质量',
//       nameEng: 'high quality'
//     },
//     {
//       id: 3,
//       enhance: -2,
//       nameCh: '炫丽的',
//       nameEng: 'colorful'
//     }
//   ]
// })
// autoHistories.histories.push({
//   timestamp: new Date().getTime() - 1013 * 60 * 60 * 12,
//   selectedTags: [
//     {
//       id: 1,
//       enhance: 1,
//       nameCh: '清晰的',
//       nameEng: 'clear'
//     },
//     {
//       id: 3,
//       enhance: -2,
//       nameCh: '炫丽的',
//       nameEng: 'colorful'
//     }
//   ]
// })

export { Histories, autoHistories, userHistories }
