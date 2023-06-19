<script lang="ts">
import { defineComponent, ref } from 'vue'
import TagSelected from './TagSelected.vue'
import { copyToClipboard, getTagString } from './utils'

export default defineComponent({
  components: { TagSelected },
  props: {
    selectedTagsarr: {
      type: Object as () => Array<number>,
      required: false,
      default: new Array<number>()
    },
    selectedTagsmap: {
      type: Object as () => Map<number, SelectedTag>,
      required: false,
      default: new Map<number, SelectedTag>([])
    }
  },
  emits: [
    'changeLanguage',
    'enhance',
    'dehance',
    'remove',
    'random',
    'cleanall',
    'saveall',
    'changePosition'
  ],
  setup(props, { emit }) {
    const cache = ref<string>('')
    const selectedLanguage = ref<string>('chinese')

    const getSelectedTag = (tagid: number): SelectedTag => {
      return props.selectedTagsmap.get(tagid)
    }

    const handleChangeLanguage = (language: string) => {
      selectedLanguage.value = language

      emit('changeLanguage', selectedLanguage)
    }

    const handleEnhance = (id: number) => {
      emit('enhance', id)
    }
    const handleDehance = (id: number) => {
      emit('dehance', id)
    }
    const handleRemove = (id: number) => {
      emit('remove', id)
    }

    const handleRandom = () => {
      emit('random')
      return
    }

    const handleChangePosition = (sourceIdx: number, targetIdx: number) => {
      emit('changePosition', sourceIdx, targetIdx)
    }

    const handleCopy = () => {
      let tagStrArr = Array<string>()
      props.selectedTagsarr.forEach((tagId) => {
        let tag = getSelectedTag(tagId)
        tagStrArr.push(getTagString(tag))
      })

      let str = tagStrArr.join(',')

      copyToClipboard(str)

      // 提示
      ElMessage({
        message: '复制成功',
        type: 'success'
      })
      return
    }
    const handleSave = () => {
      emit('saveall')

      return
    }
    const handleClear = () => {
      emit('cleanall')

      return
    }

    const onDragOver = (event: DragEvent, idx: number) => {
      event.preventDefault()
    }
    const onDrop = (event: DragEvent, idx: number) => {
      // 获取拖动项的索引
      const sourceIndex = parseInt(event.dataTransfer!.getData('text/plain'))

      // 获取放置目标的索引
      const targetIndex = idx

      handleChangePosition(sourceIndex, targetIndex)
    }

    const handleNewTag = (idx: number) => {
      console.log('create new tag', idx)
    }

    return {
      cache,
      selectedLanguage,
      handleChangeLanguage,
      handleRandom,
      handleCopy,
      handleSave,
      handleClear,
      getSelectedTag,
      handleEnhance,
      handleDehance,
      handleRemove,
      handleChangePosition,
      onDragOver,
      onDrop,
      handleNewTag
    }
  }
})
</script>

<template>
  <div>
    <!-- tag 框 -->
    <div style="position: relative">
      <el-row justify="start" align="top" class="tag-editor">
        <el-col>
          <span
            v-for="(tagid, idx) of selectedTagsarr"
            :key="tagid"
            @dragover="(e) => onDragOver(e, idx)"
            @drop="(e) => onDrop(e, idx)"
          >
            <TagSelected
              style="transition: transform 0.3s ease-out"
              :selected-language="selectedLanguage"
              :tag="getSelectedTag(tagid)"
              :index="idx"
              :can-edit="true"
              @changeposition="handleChangePosition"
              @enhance="handleEnhance(tagid)"
              @dehance="handleDehance(tagid)"
              @remove="handleRemove(tagid)"
            ></TagSelected>
            <span
              v-if="idx < selectedTagsarr.length - 1"
              class="add-new"
              @click="handleNewTag(idx)"
              >，</span
            >
          </span>
        </el-col>
      </el-row>

      <div class="editor-tips">
        <span v-if="selectedTagsarr.length < 6">
          Tips：鼠标悬浮于 Tag，可增减 Tag 权重或删除 Tag；按住可拖动 Tag 顺序哦
        </span>
      </div>
    </div>

    <!-- 功能区 -->
    <el-row justify="start">
      <div class="switch-span" style="line-height: 2rem">
        <span
          :class="selectedLanguage == 'english' ? 'selected' : 'none-selected'"
          @click="handleChangeLanguage('english')"
          >英文</span
        >
        <span
          :class="selectedLanguage == 'chinese' ? 'selected' : 'none-selected'"
          @click="handleChangeLanguage('chinese')"
          >中文</span
        >
      </div>
      <div class="select-span" @click="handleRandom">
        <el-icon class="icon"><Refresh /></el-icon>随机
      </div>
      <div class="select-span" @click="handleCopy">
        <el-icon class="icon"><Document /></el-icon>复制
      </div>
      <div class="select-span" @click="handleSave">
        <el-icon class="icon"><Collection /></el-icon>保存
      </div>
      <div class="select-span" @click="handleClear">
        <el-icon class="icon"><Delete /></el-icon>清空
      </div>
    </el-row>
  </div>
</template>

<style scoped lang="less">
.add-new {
  cursor: text;
}
.switch-span {
  border-radius: 10px;
  background: #f4f4f4;
  padding: 0.15rem;
  margin-right: 0.6rem;
  box-sizing: border-box;
  border: 1px solid #f1eef5;
  cursor: pointer;

  .none-selected {
    border-radius: 10px;
    padding: 0 0.5rem;
    // line-height: 2rem;
    color: #7c7b7b;
  }

  .selected {
    display: inline-block;
    border-radius: 10px;
    background: #ebe7f4;
    // line-height: 2rem;
    padding: 0 0.5rem;
    color: #8d74d4;
  }
}
.select-span {
  display: flex;
  align-items: center;
  background: #f9f7ff;
  text-align: center;
  padding: 0.3rem 0.6rem;
  line-height: 1.5rem;
  box-sizing: border-box;
  border: 1px solid #f1eef5;
  border-radius: 10px;
  color: #8d74d4;
  margin-right: 0.5rem;
  cursor: pointer;

  .icon {
    margin-right: 4px;
  }
}

.editor-tips {
  position: absolute;
  font-size: 0.8rem;
  color: #a4a4a4;
  bottom: 0.8rem;
  left: 0.5rem;
  text-align: left;
  width: 100%;
}

.tag-editor {
  // line-height: 2rem;
  background-color: #f9f8fe;
  padding: 0.6rem;
  border-radius: 0.3rem;
  // height: 90px;
  height: 220px;
  overflow-y: scroll;
  margin-bottom: 20px;

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
</style>
