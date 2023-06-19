<script lang="ts">
import { Ref, defineComponent, nextTick, ref, watch } from 'vue'

declare global {
  interface Window {
    xx: any
  }
}

export default defineComponent({
  components: {},
  props: {
    tag: {
      type: Object as () => SelectedTag,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    selectedLanguage: {
      type: String,
      default: 'chinese',
      required: false
    },
    canEdit: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  emits: ['enhance', 'dehance', 'remove', 'changeposition'],
  setup(props, { emit }) {
    const handleEnhance = () => {
      emit('enhance')
    }
    const handleDehance = () => {
      emit('dehance')
    }
    const handleRemove = () => {
      emit('remove')
    }

    const editTagValue = ref<string>(props.tag.nameEng)
    const inEditMode = ref<boolean>(false)

    const hovered = ref<boolean>(false)
    const shouldShowPlus = ref<boolean>(false)

    let timeoutid
    watch(hovered, (newVal, oldVal) => {
      if (!props.canEdit) {
        return
      }
      clearTimeout(timeoutid)
      if (!newVal) {
        // 延迟关闭
        timeoutid = setTimeout(() => (shouldShowPlus.value = false), 300)
        return
      }

      if (newVal) {
        shouldShowPlus.value = true
        return
      }
    })

    const getTagString = (): string => {
      let stag = props.tag
      let label =
        props.selectedLanguage == 'chinese' ? stag.nameCh : stag.nameEng

      let str = ''
      if (stag.enhance > 0) {
        str += '('.repeat(stag.enhance)
        str += label
        str += ')'.repeat(stag.enhance)
      }

      if (stag.enhance < 0) {
        str += '['.repeat(Math.abs(stag.enhance))
        str += label
        str += ']'.repeat(Math.abs(stag.enhance))
      }

      if (stag.enhance == 0) {
        str = label
      }

      return str
    }

    const onDragStart = (event: DragEvent) => {
      event.dataTransfer?.setData('text/plain', props.index.toString())
    }
    const onDragOver = (event: DragEvent) => {
      event.preventDefault()
    }
    const onDrop = (event: DragEvent) => {
      // 获取拖动项的索引
      const sourceIndex = parseInt(event.dataTransfer!.getData('text/plain'))

      // 获取放置目标的索引
      const targetIndex = props.index

      // 在列表中交换两个项的位置
      emit('changeposition', sourceIndex, targetIndex)
    }

    const inputRef: Ref<HTMLInputElement | null> = ref(null)

    const getFontSizeInPx = (): number => {
      const computedStyle = window.getComputedStyle(inputRef.value)
      const fontSizeStr = computedStyle.getPropertyValue('font-size')
      const fontSizeInPx = parseFloat(fontSizeStr)
      return fontSizeInPx
    }

    const changeInputWidth = () => {
      let l = getFontSizeInPx()
      // 英文长度占一般
      let len = (l * (editTagValue.value.length + 2)) / 2
      inputRef.value.style.width = `${len}px`
    }

    // 当变为编辑模式时，则设置 focus
    watch(inEditMode, (nv, ov) => {
      if (nv) {
        nextTick(() => {
          inputRef.value.focus()
          changeInputWidth()
        })
      }
    })

    return {
      hovered,
      shouldShowPlus,
      editTagValue,
      inEditMode,
      handleEnhance,
      handleDehance,
      handleRemove,
      getTagString,
      onDragStart,
      onDragOver,
      onDrop,
      inputRef,
      changeInputWidth
    }
  },
  mounted() {
    // this.mounted()
  }
})
</script>

<template>
  <span
    class="selected-container"
    @mouseover="hovered = true"
    @mouseout="hovered = false"
  >
    <span class="selected-tag">
      <span v-if="shouldShowPlus">
        <!-- <span
          class="tag-func tag-enhance"
          @click="handleEnhance"
          @mouseover="hovered = true"
          ><el-icon><Plus /></el-icon
        ></span>
        <span
          class="tag-func tag-dehance"
          @click="handleDehance"
          @mouseover="hovered = true"
          ><el-icon><Minus /></el-icon
        ></span> -->
        <span
          class="tag-func tag-remove"
          @click="handleRemove"
          @mouseover="hovered = true"
          ><el-icon><Close /></el-icon
        ></span>
      </span>

      <!-- <span class="selected-mask" @mouseout="hovered = false"></span> -->

      <span v-draggable :draggable="true" @dragstart="onDragStart">
        <span class="tag-content">
          <span
            v-if="canEdit && !inEditMode"
            class="mask-container"
            @click="inEditMode = true"
          >
            <!-- <span class="mask-minus" @click="handleDehance"
              ><el-icon><Minus /></el-icon
            ></span>
            <span class="mask-move"
              ><el-icon><Rank /></el-icon
            ></span>
            <span class="mask-plus" @click="handleEnhance"
              ><el-icon><Plus /></el-icon
            ></span> -->
            <span class="mask-minus" @click.stop="handleDehance"></span>
            <span class="mask-move"></span>
            <span class="mask-plus" @click.stop="handleEnhance"></span>
          </span>
          <input
            v-show="inEditMode"
            ref="inputRef"
            v-model="editTagValue"
            class="input-box"
            type="text"
            @blur="inEditMode = false"
            @input="changeInputWidth"
          />
          <span v-show="!inEditMode">{{ getTagString() }}</span>
        </span>
      </span>
    </span>
  </span>
</template>

<style scoped lang="less">
.input-box {
  outline: none;
  border: none;
  line-height: 1.5rem;
  background-color: #f9f8fe;
  border-radius: 0.3rem;
}
.tag-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5rem;

  .mask-container {
    position: absolute;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    left: -5px;
    right: -5px;
    top: -5px;
    bottom: -5px;

    .mask-minus,
    .mask-plus {
      content: '';
      width: 30%;
      height: 100%;
    }

    .mask-minus {
      left: -5px;
      cursor: url('https://static.longalong.cn/icons/icon-minus-circle.svg'),
        auto;

      // background: rgba(100, 100, 100, 0.3);
    }

    .mask-plus {
      right: 0;
      cursor: url('https://static.longalong.cn/icons/icon-plus-circle.svg'),
        auto;
      // background: rgba(100, 100, 100, 0.5);
    }

    .mask-move {
      position: absolute;
      cursor: move;
      width: 15px;
      height: 6px;
      top: 0;
      left: 50%;
    }
  }
}
.selected-container {
  display: inline-block;
  position: relative;
  margin-bottom: 0.3rem;
}
.selected-mask {
  position: absolute;
  top: -5px;
  bottom: -5px;
  left: -15px;
  right: -15px;
  background-color: rgba(100, 100, 100, 0.3);
  z-index: -1;
  cursor: pointer;
}
.selected-tag {
  background-color: #ebdcfc;
  padding: 0.2rem 0.3rem;
  border-radius: 0.3rem;
  cursor: pointer;
  position: relative;
  display: inline-block;

  .tag-func {
    position: absolute;
    width: 15px;
    height: 15px;
    font-size: 0.6rem;
    border-radius: 7.5px;
    background: #ebdcfc;
    text-align: center;
    line-height: 1rem;
  }
  .tag-enhance {
    top: 0;
    left: -12px;
  }

  .tag-dehance {
    bottom: 0;
    left: -12px;
  }

  .tag-remove {
    top: 0.4rem;
    right: -15px;
  }
}
</style>
