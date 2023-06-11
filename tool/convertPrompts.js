/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')

fs.readFile('./prompts.json', (error, data) => {
  if (error) {
    console.error(error)
    return
  }
  const jsonData = JSON.parse(data)

  let noDirTags = []

  let dirsTags = {}

  Object.keys(jsonData).forEach((key) => {
    let tag = jsonData[key]

    if (tag.lang_zh == '') {
      tag.lang_zh = tag.text
    }

    if (!tag.dir) {
      noDirTags.push(tag)
      return
    }

    let dirs = tag.dir.split('/')
    let firstClass = dirs[0]

    let classTags = dirsTags[firstClass]
    if (!classTags) {
      classTags = {}
      dirsTags[firstClass] = classTags
    }

    if (dirs.length == 2) {
      let tags = classTags[dirs[1]]
      if (!tags) {
        tags = []
        classTags[dirs[1]] = tags
      }

      tags.push(tag)
    }

    if (dirs.length == 1) {
      let tags = classTags['other']
      if (!tags) {
        tags = []
        classTags['other'] = tags
      }

      tags.push(tag)
    }
  })

  let ourDictTags = {}
  // 转换为我们需要的 tag

  for (const [dname, dict] of Object.entries(dirsTags)) {
    let tagDict = {
      name: dname,
      label: dname,
      classes: {}
    }

    for (const [cname, dclassTags] of Object.entries(dict)) {
      let dclass = {
        id: Math.floor(Math.random() * 1000000),
        name: cname,
        label: cname,
        contents: []
      }

      // console.log(dclassTags)

      dclassTags.forEach((tag) => {
        dclass.contents.push({
          id: Math.floor(Math.random() * 1000000),
          nameEng: tag.text,
          nameCh: tag.lang_zh || tag.text
        })
      })

      tagDict.classes[dclass.name] = dclass
    }

    ourDictTags[dname] = tagDict
  }

  fs.writeFileSync('./outprompt.json', JSON.stringify(dirsTags))
  fs.writeFileSync('./ourtags.json', JSON.stringify(ourDictTags))
  fs.writeFileSync('./nodirprompt.json', JSON.stringify(noDirTags))
})
