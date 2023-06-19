<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import TagEditor from './TagEditor.vue'
import TagSelector from './TagSelector.vue'
import CountBadge from './CountBadge.vue'
import { tagsDictArr, tagsDictMap } from './tagdict'
import { autoHistories, userHistories } from './history.ts'

export default defineComponent({
  components: { TagEditor, TagSelector, CountBadge },
  props: {
    editTags: {
      type: Array as () => Array<SelectedTag>,
      required: true
    },
    edittagschanged: {
      type: Boolean,
      required: false
    }
  },
  setup(props, { emit }) {
    const selectedModel = ref<string>('stable-diffusion-webui')

    const getTagDictByName = (dictName: string): TagDict => {
      return tagsDictMap.get(dictName)
    }

    // <tagdictName,<tagId, isInDict>>
    const tagsInTagDictMap = new Map<string, Map<number, boolean>>()

    const allTags: Map<number, Tag> = new Map([])
    tagsDictMap.forEach((tagdict, dname) => {
      let dictMap = new Map<number, boolean>()
      tagsInTagDictMap.set(dname, dictMap)

      tagdict.classes.forEach((classes, cname) => {
        classes.contents.forEach((tag) => {
          allTags.set(tag.id, tag)
          dictMap.set(tag.id, true)
        })
      })
    })

    const isTagInTagDict = (tagId: number, dictName: string): boolean => {
      let isIn = false
      // Array.from(tagsInTagDictMap.keys()).some((dictName) => {
      let dictMap = tagsInTagDictMap.get(dictName) || new Map()

      if (dictMap.get(tagId)) {
        isIn = true
      }
      // })

      return isIn
    }

    const getTagsInDictCount = (dictName: string): number => {
      let dictCount = 0

      selectedTagsArr.value.forEach((tagId) => {
        if (isTagInTagDict(tagId, dictName)) {
          dictCount++
        }
      })

      return dictCount
    }

    const getTagByID = (tagID: number): Tag => {
      return allTags.get(tagID)
    }

    const tagDicts = ref<Array<TagDict>>([])
    tagsDictArr.forEach((dictName) => {
      let tagDict = getTagDictByName(dictName)
      tagDicts.value.push(tagDict)
    })

    let firstTagDict = tagDicts.value[0]
    const selectedTagDict = ref<TagDict>(firstTagDict)

    // 选择的 tag ，保证顺序
    let selectedTagsArr = ref<Array<number>>([])

    // 选择的 tag ，保证内容
    let selectedTagsMap = ref<Map<number, SelectedTag>>(new Map())

    // selectedTagsMap.value.set(1, {
    //   id: 1,
    //   nameCh: '超高清',
    //   nameEng: 'UHD',
    //   enhance: 1
    // } as SelectedTag)
    // selectedTagsArr.value.push(1)

    // selectedTagsMap.value.set(3, {
    //   id: 3,
    //   nameCh: '8K效果',
    //   nameEng: '8K',
    //   enhance: 2
    // } as SelectedTag)
    // selectedTagsArr.value.push(3)

    // selectedTagsMap.value.set(4, {
    //   id: 4,
    //   nameCh: '一个女孩',
    //   nameEng: '1girl',
    //   enhance: 0
    // } as SelectedTag)
    // selectedTagsArr.value.push(4)

    // 处理选择 tag (或取消选择)
    const handleTagSelect = (tagId: number, enhances?: number) => {
      if (selectedTagsMap.value.has(tagId)) {
        // 存在，则去除
        let idx = selectedTagsArr.value.indexOf(tagId)
        if (idx != -1) {
          selectedTagsArr.value.splice(idx, 1)
          selectedTagsMap.value.delete(tagId)
        }
      } else {
        // 不存在，则添加
        let tag = getTagByID(tagId)

        let selectedTag = {
          ...tag,
          enhance: enhances || 0
        } as SelectedTag

        selectedTagsMap.value.set(tagId, selectedTag)

        selectedTagsArr.value.push(tagId)
      }

      return
    }

    const handleEnhance = (id: number) => {
      let tag = selectedTagsMap.value.get(id)
      tag.enhance++
      return
    }

    const handleDehance = (id: number) => {
      let tag = selectedTagsMap.value.get(id)
      tag.enhance--
      return
    }

    const handleRemove = (id: number) => {
      handleTagSelect(id)
      return
    }

    const randomN = (max: number): number => {
      return Math.floor(Math.random() * max)
    }

    const handleRandom = () => {
      let randomSelectedTags = Array<SelectedTag>()
      // 每个 dict 抽一个
      tagsDictArr.forEach((dictName) => {
        let tagDict = getTagDictByName(dictName)
        let arr = Array.from(tagDict.classes.entries())
        let contents = arr[randomN(arr.length)][1].contents
        let tag = contents[randomN(contents.length)]

        randomSelectedTags.push({
          ...tag
        } as SelectedTag)
      })

      // 处理清理
      handleCleanAll()

      // 处理重新赋值
      randomSelectedTags.forEach((tag) => {
        handleTagSelect(tag.id)
      })

      return
    }

    const handleAutoSave = () => {
      if (!selectedTagsArr.value.length) {
        return
      }

      let selectedTags = new Array<SelectedTag>()
      selectedTagsArr.value.forEach((tagid) => {
        let stag = selectedTagsMap.value.get(tagid)

        selectedTags.push({
          id: stag.id,
          nameCh: stag.nameCh,
          nameEng: stag.nameEng,
          enhance: stag.enhance
        })
      })

      autoHistories.saveHistory(selectedTags)
      return
    }

    if (props.editTags) {
      props.editTags.forEach((stag) => {
        handleTagSelect(stag.id, stag.enhance)
      })
    }

    watch(
      () => props.edittagschanged,
      (nv, ov) => {
        // 因为监听不到 editTags 的变化，兼容处理一下

        if (props.editTags.length > 0) {
          handleCleanAll()

          props.editTags.forEach((tag) => {
            handleTagSelect(tag.id, tag.enhance)
          })
        }
      }
    )

    const handleCleanAll = () => {
      // 处理自动保存
      handleAutoSave()

      // 清理
      if (selectedTagsArr.value.length > 0) {
        selectedTagsArr.value.splice(0, selectedTagsArr.value.length)
        selectedTagsMap.value.clear()
      }
      return
    }

    let lastSaveTime = new Date().getTime()
    const handleSaveAll = () => {
      let lastSaveDiffSec = Math.floor(
        (new Date().getTime() - lastSaveTime) / 1000
      )
      // 频繁点错控制
      if (lastSaveDiffSec < 3) {
        ElMessage({
          message: `${lastSaveDiffSec}s 前才保存了的~`,
          type: 'warning'
        })
        return
      }

      lastSaveTime = new Date().getTime()

      let selectedTags = new Array<SelectedTag>()
      selectedTagsArr.value.forEach((tagid) => {
        let stag = selectedTagsMap.value.get(tagid)

        selectedTags.push({
          id: stag.id,
          nameCh: stag.nameCh,
          nameEng: stag.nameEng,
          enhance: stag.enhance
        })
      })

      userHistories.saveHistory(selectedTags)

      ElMessage({
        message: '保存成功',
        type: 'success'
      })
      return
    }

    const handleChangePosition = (sourceIdx: number, targetIdx: number) => {
      console.log('in handle change position', sourceIdx, targetIdx)

      const removed = selectedTagsArr.value.splice(sourceIdx, 1)

      if (targetIdx > sourceIdx) {
        selectedTagsArr.value.splice(targetIdx, 0, removed[0])
      } else {
        selectedTagsArr.value.splice(targetIdx + 1, 0, removed[0])
      }
    }

    return {
      selectedModel,
      tagDicts,
      selectedTagDict,
      selectedTagsArr,
      selectedTagsMap,
      handleTagSelect,
      getTagDictByName,
      handleEnhance,
      handleDehance,
      handleRemove,
      handleRandom,
      handleCleanAll,
      handleSaveAll,
      getTagByID,
      getTagsInDictCount,
      handleChangePosition
    }
  }
})
</script>

<template>
  <div>
    <!-- 提示词框 -->
    <div class="bigblock">
      <el-row justify="space-between" align="middle">
        <el-col :span="12">
          <h3 class="tag-title">选择Tag，生成提示词</h3>
        </el-col>
        <el-col :span="12">
          <el-row justify="end">
            <!-- <el-select v-model="selectedModel" placeholder="选择类型">
              <el-option
                label="stable-diffusion-webui"
                value="stable-diffusion-webui"
              />
              <el-option label="midjourney" value="midjourney" />
            </el-select> -->
          </el-row>
        </el-col>
      </el-row>

      <TagEditor
        :selected-tagsmap="selectedTagsMap"
        :selected-tagsarr="selectedTagsArr"
        @enhance="handleEnhance"
        @dehance="handleDehance"
        @remove="handleRemove"
        @random="handleRandom"
        @cleanall="handleCleanAll"
        @saveall="handleSaveAll"
        @change-position="handleChangePosition"
      ></TagEditor>
    </div>

    <!-- tag 词典 -->
    <div class="bigblock">
      <el-row justify="start" align="middle">
        <el-col :span="12">
          <h3>我的 Tag 词典</h3>
        </el-col>
        <el-col :span="12">
          <el-row justify="end">
            <div style="cursor: pointer">自定义词典</div>
          </el-row>
        </el-col>
      </el-row>

      <el-row style="width: 100%; margin-bottom: 10px">
        <div class="tag-dict-slides">
          <span
            v-for="dict in tagDicts"
            :key="dict.name"
            @click="selectedTagDict = dict"
          >
            <CountBadge
              :value="getTagsInDictCount(dict.name)"
              type="warning"
              :max="10"
            >
              <span
                class="tag-dict-item"
                :class="selectedTagDict.name == dict.name ? 'selected' : ''"
              >
                {{ dict.label }}
              </span>
            </CountBadge>
          </span>
        </div>
      </el-row>

      <TagSelector
        class="tag-selector"
        :tagdict="selectedTagDict"
        :selected-tags="selectedTagsArr"
        @tag-select="handleTagSelect"
      ></TagSelector>
    </div>
  </div>
</template>

<style scoped lang="less">
.bigblock {
  margin: 0 0 20px;
}

.tag-title {
  position: relative;

  &::after {
    content: ''; /* 必须设置，否则伪元素不会显示 */
    position: absolute; /* 设置绝对定位，让伪元素与div重叠 */
    bottom: -1px;
    width: 13.5rem;
    left: -1rem;
    right: 2rem;
    height: 0.9rem;
    border-radius: 1rem;
    background-color: #ffd83c;
    z-index: -1;
  }
}
.tag-selector {
  max-height: 50vh;
  overflow-y: scroll;
}
.tag-dict-slides {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  background: #f9f7ff;
  border-radius: 30px;
  box-sizing: border-box;
  border: 1px solid #f0edf4;
  padding: 0.2rem 0.4rem;
  line-height: 2.5rem;
  font-size: 1rem;
  transition: all 0.2s;

  .tag-dict-item {
    font-weight: 500;
    letter-spacing: 0em;
    padding: 0.3rem 0.8rem;
    cursor: pointer;
    color: #8d74d4;
    line-height: 1.8rem;
    display: inline-block;
    // transition: all 0.3s;

    &.selected {
      border-radius: 30px;
      background: #8d74d4;
      color: #ffffff;
      // transition: all 0.3s;
    }
  }
}

.badge-selected-num {
  background-color: #ffd83c;
  color: #1a1a1a;
  font-weight: 500;
}
</style>
