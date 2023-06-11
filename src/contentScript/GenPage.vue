<script lang="ts">
import { defineComponent, ref } from 'vue'
import TagEditor from './TagEditor.vue'
import TagSelector from './TagSelector.vue'
import { tagsDictArr, tagsDictMap } from './tagdict'

export default defineComponent({
  components: { TagEditor, TagSelector },

  setup() {
    const cache = ref<string>('')
    const selectedModel = ref<string>('stable-diffusion-webui')

    const getTagDictByName = (dictName: string): TagDict => {
      return tagsDictMap.get(dictName)
    }

    const allTags: Map<number, Tag> = new Map([])
    tagsDictMap.forEach((tagdict, dname) => {
      tagdict.classes.forEach((classes, cname) => {
        classes.contents.forEach((tag) => {
          allTags.set(tag.id, tag)
        })
      })
    })

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
    const handleTagSelect = (tagId: number) => {
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

        selectedTagsMap.value.set(tagId, {
          ...tag,
          enhance: 0
        } as SelectedTag)

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

    return {
      cache,
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
      getTagByID
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
      ></TagEditor>
    </div>

    <!-- tag 词典 -->
    <div class="bigblock">
      <el-row justify="start" align="middle">
        <el-col :span="12">
          <h3>Tag 词典</h3>
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
            class="tag-dict-item"
            :class="selectedTagDict.name == dict.name ? 'selected' : ''"
            @click="selectedTagDict = dict"
            >{{ dict.label }}</span
          >
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
</style>
