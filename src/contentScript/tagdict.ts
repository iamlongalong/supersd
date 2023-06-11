import { TagsDict } from './tags.ts'

const tagsDictArr: Array<string> = []
const tagsDictMap: Map<string, TagDict> = new Map()

Object.keys(TagsDict).forEach((tagdict) => {
  const dict = TagsDict[tagdict]

  const myTagDict: TagDict = {
    name: dict.name,
    label: dict.label,
    classes: new Map<string, DictClass>()
  }

  Object.keys(dict.classes).forEach((className) => {
    const classes = dict.classes[className]
    const contents: [Tag] = classes.contents

    const myClass: DictClass = {
      id: classes.id,
      name: classes.name,
      label: classes.label,
      contents: contents
    }

    myTagDict.classes.set(myClass.name, myClass)
  })

  // 值
  tagsDictMap.set(myTagDict.name, myTagDict)

  // 顺序
  tagsDictArr.push(myTagDict.name)
})

export { tagsDictArr, tagsDictMap }
