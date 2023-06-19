<script lang="ts">
import { defineComponent } from 'vue'
import { copyToClipboard, getTagString } from './utils'
import TagSelected from './TagSelected.vue'

export default defineComponent({
  components: { TagSelected },
  props: {
    historyList: {
      type: Object as () => SavedTags[],
      required: true,
      default: new Array<SavedTags>()
    },
    canRemove: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['remove', 'edit'],
  setup(props, { emit }) {
    const tagsMap = new Map<number, Map<number, SelectedTag>>()

    const selectLanguageMap = new Map<number, string>()
    const getSelectedLanguage = (ts: number): string => {
      let language = selectLanguageMap.get(ts)
      if (!language) {
        language = 'chinese'
      }

      return language
    }

    const reverseHistories = props.historyList.slice().reverse()

    const getTimeString = (ts: number): string => {
      const date = new Date(ts)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours()
      const minutes = date.getMinutes()

      return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    props.historyList.forEach((stags) => {
      let tagMap = new Map<number, SelectedTag>()
      stags.selectedTags.forEach((stag) => {
        tagMap.set(stag.id, stag)
      })

      tagsMap.set(stags.timestamp, tagMap)
    })

    const getSelectedTagsArr = (ts: number): SavedTags => {
      let res: SavedTags
      props.historyList.some((sts) => {
        if (sts.timestamp == ts) {
          res = sts
          return false
        }
      })

      return res
    }

    const getSelectedTag = (ts: number, tagid: number): SelectedTag => {
      let savedTags = tagsMap.get(ts)

      return savedTags.get(tagid)
    }

    const handleRemove = (ts: number) => {
      emit('remove', ts)
    }
    const handleEdit = (ts: number) => {
      let savedTags = getSelectedTagsArr(ts)
      emit('edit', savedTags)
    }

    const handleCopy = (ts: number) => {
      let savedTags = getSelectedTagsArr(ts)

      let tagStrArr = Array<string>()

      savedTags.selectedTags.forEach((tag) => {
        tagStrArr.push(getTagString(tag))
      })

      let str = tagStrArr.join(',')

      copyToClipboard(str)

      ElMessage({
        message: '复制成功',
        type: 'success'
      })

      return
    }

    return {
      getSelectedTag,
      getSelectedLanguage,
      handleRemove,
      handleEdit,
      handleCopy,
      getTimeString,
      reverseHistories
    }
  }
})
</script>

<template>
  <div>
    <div
      v-for="stags in reverseHistories"
      :key="stags.timestamp"
      class="hist-block-container"
    >
      <div class="timeline-aside">
        <div class="timeline-outer-breath-light">
          <div class="timeline-inner-breath-light"></div>
        </div>
      </div>
      <div class="hist-block">
        <el-row style="margin-bottom: 0.5rem">
          <el-col :span="12">
            <el-row justify="start" class="time-header">
              {{ getTimeString(stags.timestamp) }}
            </el-row>
          </el-col>
          <el-col :span="12">
            <el-row justify="end">
              <span class="btn-handler" @click="handleEdit(stags.timestamp)">
                <el-icon class="icon"><EditPen /></el-icon>编辑
              </span>
              <span class="btn-handler" @click="handleCopy(stags.timestamp)">
                <el-icon class="icon"><Document /></el-icon>复制
              </span>
              <span
                v-if="canRemove"
                class="btn-handler"
                @click="handleRemove(stags.timestamp)"
              >
                <el-icon class="icon"><Delete /></el-icon>删除
              </span>
            </el-row>
          </el-col>
        </el-row>

        <div>
          <div style="position: relative">
            <el-row justify="start" align="top" class="tag-editor">
              <el-col>
                <span
                  v-for="(tag, idx) of stags.selectedTags"
                  :key="tag.id"
                  style="
                    margin-right: 5px;
                    display: inline-block;
                    line-height: 1.5rem;
                  "
                >
                  <TagSelected
                    :selected-language="getSelectedLanguage(stags.timestamp)"
                    :tag="tag"
                    :index="idx"
                    :can-edit="false"
                  ></TagSelected>
                  <span v-if="idx < stags.selectedTags.length - 1">，</span>
                </span>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.btn-handler {
  display: flex;
  align-items: center;
  background: #f9f7ff;
  text-align: center;
  padding: 0.3rem 0.6rem;
  line-height: 1.5rem;
  box-sizing: border-box;

  border: 1px solid #f1eef5;
  border-radius: 5px;
  margin-right: 0.5rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  color: #8d74d4;
  font-weight: 500;

  cursor: pointer;
}
.hist-block-container {
  position: relative;
  .timeline-aside {
    position: absolute;
    left: 0;
    top: 1rem;
    bottom: -2rem;
    width: 1px;
    background-color: #d8d8d8;

    .timeline-outer-breath-light {
      position: absolute;
      width: 1.1rem;
      height: 1.1rem;
      background-color: #ebe7f4;
      border-radius: 50%;
      top: -0.55rem;
      left: -0.55rem;

      .timeline-inner-breath-light {
        position: absolute;
        width: 0.5rem;
        height: 0.5rem;
        background-color: #8f6fe4;
        border-radius: 50%;

        top: 0.3rem;
        left: 0.3rem;
      }
    }
  }

  .hist-block {
    padding-left: 1rem;
  }
}

.time-header {
  font-weight: bold;
  font-size: 1.3rem;
}

.tag-editor {
  line-height: 2rem;
  background-color: #f9f8fe;
  padding: 0.6rem;
  border-radius: 0.3rem;
  // height: 90px;
  max-height: 220px;
  overflow-y: scroll;
  margin-bottom: 1.5rem;

  scrollbar-width: 2px;
  scrollbar-color: #efefef #f5f5f5;

  &::-webkit-scrollbar-thumb {
    width: 2px;
    height: 30px;
    background-color: #ccc;
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
    border-radius: 10px;
  }

  &::-webkit-scrollbar {
    display: block;
    width: 3px;
    background-color: #f5f5f5;
  }
}

.icon {
  margin-right: 4px;
}
</style>
