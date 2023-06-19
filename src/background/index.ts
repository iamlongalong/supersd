import { type } from 'os'
import { SavedTags } from './../contentScript/types'
import { SDEvents, onMessage, sendMessage } from './../events/index'
import db from './db'

const baseHistIndexKey = 'hisindex:'
const baseHistKey = 'hisitems:'

let userHistIndexes = new Array<number>(...[])
const userHistIndexKey = 'user'

let autoHistIndexes = new Array<number>(...[])
const autoHistIndexKey = 'auto'

const userHistRecords = new Array<SavedTags>()
const autoHistRecords = new Array<SavedTags>()

const MaxAutoHists = 100

async function initGetHistIndexes(savingType: string): Promise<number[]> {
  return await db
    .getValue(baseHistIndexKey + savingType)
    .then((idxes: number[]) => {
      console.log('get userHistIndexes', savingType, idxes)
      return idxes
    })
}

async function initGetHist(savingType: string, ts: number): Promise<SavedTags> {
  return await db
    .getValue(baseHistKey + savingType + ':' + String(ts))
    .then((stags: SavedTags) => {
      console.log('get hist saved tags', savingType, stags)
      return stags
    })
}

async function init() {
  userHistIndexes = await initGetHistIndexes(userHistIndexKey)
  autoHistIndexes = await initGetHistIndexes(autoHistIndexKey)

  userHistIndexes.forEach(async (ts) => {
    const stags = await initGetHist(userHistIndexKey, ts)
    userHistRecords.unshift(stags)
  })

  autoHistIndexes.forEach(async (ts) => {
    const stags = await initGetHist(autoHistIndexKey, ts)
    autoHistRecords.unshift(stags)
  })

  // 5 min 删除一次自动保存的
  setInterval(clearOverlayAutoHists, 1000 * 60 * 5)
}

// 初始化
init()

onMessage(
  SDEvents.SavingPrompts,
  async (params: { savingType?: string; stags?: SavedTags }) => {
    const { savingType = 'user', stags = null } = params

    let idxes = userHistIndexes
    if (savingType == 'auto') {
      idxes = autoHistIndexes
    }

    let records = userHistRecords
    if (savingType == 'auto') {
      records = autoHistRecords
    }

    await db.setValue(baseHistKey + savingType + ':' + stags.timestamp, stags)

    idxes.unshift(stags.timestamp)

    await db.setValue(baseHistIndexKey + savingType, idxes)

    records.unshift(stags)
  }
)

onMessage(SDEvents.GetPromptsUserHist, async ({ pagesize = 15, page = 1 }) => {
  const res = new Array<SavedTags>(...[])

  const startIdx = pagesize * (page - 1)
  let endIdx = startIdx + pagesize

  if (userHistRecords.length < startIdx) {
    // 没了
    return res
  }

  if (userHistRecords.length < endIdx) {
    endIdx = userHistRecords.length
  }

  for (let i = startIdx; i < endIdx; i++) {
    res.unshift(deepCopy(userHistRecords[i]))
  }

  return res
})

async function clearOverlayAutoHists() {
  if (autoHistIndexes.length > MaxAutoHists) {
    const over = autoHistIndexes.length - MaxAutoHists

    console.log('in auto clean', over)

    autoHistIndexes.splice(0, over)

    await db.setValue(baseHistIndexKey + 'auto', autoHistIndexes)

    for (let i = 0; i < over; i++) {
      const stags = autoHistRecords[i]
      await db.deleteValue(baseHistKey + 'auto' + ':' + stags.timestamp)
    }

    autoHistRecords.shift()
  }
}

onMessage(
  SDEvents.DeletePromptsHist,
  async (params: { savingType: string; ts: number }) => {
    const { savingType, ts } = params

    // 目前 savingType 仅能为 user
    const idxes = userHistIndexes
    const records = userHistRecords
    for (let i = 0; i < idxes.length; i++) {
      const v = idxes[i]
      if (v == ts) {
        // 删除一个元素
        idxes.splice(i, 1)
        records.splice(i, 1)

        await db.setValue(baseHistIndexKey + savingType, idxes)
        await db.deleteValue(baseHistKey + savingType + ':' + ts)

        return
      }
    }
  }
)

onMessage(SDEvents.GetPromptsAutoHist, async ({ pagesize = 15, page = 1 }) => {
  const res = new Array<SavedTags>(...[])

  const startIdx = pagesize * (page - 1)
  let endIdx = startIdx + pagesize

  if (autoHistRecords.length < startIdx) {
    // 没了
    return res
  }

  if (autoHistRecords.length < endIdx) {
    endIdx = autoHistRecords.length
  }

  for (let i = startIdx; i < endIdx; i++) {
    res.unshift(deepCopy(autoHistRecords[i]))
  }

  return res
})

function deepCopy(obj) {
  let copy

  // 判断对象是否为数组
  if (Array.isArray(obj)) {
    copy = []
    for (let i = 0; i < obj.length; i++) {
      copy[i] = deepCopy(obj[i])
    }
    return copy
  }

  // 判断对象是否为对象类型
  if (typeof obj === 'object' && obj !== null) {
    copy = {}

    for (const key in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(key)) {
        copy[key] = deepCopy(obj[key])
      }
    }
    return copy
  }

  // 如果是基本数据类型或函数，则直接返回
  return obj
}
