<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { TagDict } from './types.ts'
import TagEle from './TagEle.vue'
import { CollapseModelValue } from 'element-plus'

export default defineComponent({
  components: { TagEle },
  props: {
    tagdict: {
      type: Object as () => TagDict,
      required: true
    },
    selectedTags: {
      type: Object as () => Array<number>,
      required: false,
      default: new Array<number>()
    }
  },
  emits: ['tagSelect'],
  setup(props, { emit }) {
    const isSelected = (id: number): boolean => {
      for (let tagID of props.selectedTags) {
        if (tagID == id) {
          return true
        }
      }
    }

    const firstKey: string = Array.from(props.tagdict.classes.keys())[0]
    const firstValue: string = props.tagdict.classes.get(firstKey).name

    const activeDictClass = ref<CollapseModelValue>([firstValue])

    const handleActiveChange = (v: CollapseModelValue) => {
      activeDictClass.value = v
      return
    }

    let drawersStatus = ref<Map<string, boolean>>(new Map())
    // 第一个二级分类要打开
    for (const [, dictClass] of props.tagdict.classes.entries()) {
      let key = props.tagdict.name + '/' + dictClass.name
      drawersStatus.value.set(key, true)
      break
    }

    watch(
      () => props.tagdict,
      (newVal, oldVal) => {
        for (const [, dictClass] of props.tagdict.classes.entries()) {
          let key = props.tagdict.name + '/' + dictClass.name
          drawersStatus.value.set(key, true)
          break
        }
      }
    )

    const isOpen = (dictname: string, class2: string): boolean => {
      return drawersStatus.value.get(dictname + '/' + class2)
    }

    const handleToggle = (dictname: string, class2: string) => {
      let key = dictname + '/' + class2

      drawersStatus.value.set(key, !drawersStatus.value.get(key))
    }

    const handleSelectTag = (id: number) => {
      console.log('select tag : ', id)
      emit('tagSelect', id)
      return
    }

    return {
      isSelected,
      handleActiveChange,
      isOpen,
      handleToggle,
      handleSelectTag
    }
  }
})
</script>

<template>
  <div>
    <div v-for="dictClass in tagdict.classes" :key="dictClass[0]">
      <div
        style="cursor: pointer; margin: 5px 0"
        @click="handleToggle(tagdict.name, dictClass[0])"
      >
        <div class="class2-container">
          <el-icon
            class="class2-icon"
            :class="isOpen(tagdict.name, dictClass[0]) ? 'selected' : ''"
          >
            <ArrowRight
          /></el-icon>

          <span class="class2-label">{{ dictClass[1].label }}</span>

          <span class="class2-count">{{ dictClass[1].contents.length }}</span>
        </div>
      </div>

      <div
        class="tag-list-container"
        :class="isOpen(tagdict.name, dictClass[0]) ? '' : 'close'"
      >
        <el-row class="tag-list-innter-container" justify="start">
          <TagEle
            v-for="tag in dictClass[1].contents"
            :key="tag.id"
            :tag="tag"
            :selected="isSelected(tag.id)"
            @click="handleSelectTag(tag.id)"
          ></TagEle>
        </el-row>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.tag-list-container {
  position: relative;
  transition: height 0.5s;
  padding: 0.5rem 0;

  &.close {
    height: 0;
    display: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0rem;
    left: 0;
    right: 0;
    height: 1px;
    border-radius: 1rem;
    background-color: #f4f4f4;
    z-index: -1;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0rem;
    left: 0;
    right: 0;
    height: 1px;
    border-radius: 1rem;
    background-color: #f4f4f4;
    z-index: -1;
  }
}

.tag-list-innter-container {
  max-height: 240px;
  overflow-y: scroll;
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

.class2-container {
  font-weight: bold;
  line-height: 1.5rem;
  display: flex;
  align-items: center;
  color: #7c7b7b;

  .class2-icon {
    margin-right: 10px;
    transform-origin: center;
    transition: transform 0.3s ease-out;
  }

  .selected {
    position: relative;
    transform: rotate(90deg);
  }

  .class2-label {
    font-size: 1.2rem;
  }

  .class2-count {
    margin-left: 10px;
    padding: 3px 8px;
    color: #9c9c9c;
    font-size: 0.7rem;
    background-color: #f4f4f4;
    line-height: 1rem;
    border-radius: 0.5rem;
  }
}
</style>
