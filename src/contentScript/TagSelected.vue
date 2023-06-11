<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  components: {},
  props: {
    tag: {
      type: Object as () => SelectedTag,
      required: true
    },
    selectedLanguage: {
      type: String,
      default: 'chinese',
      required: false
    }
  },
  emits: ['enhance', 'dehance', 'remove'],
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

    const hovered = ref<boolean>(false)
    const shouldShowPlus = ref<boolean>(false)

    let timeoutid
    watch(hovered, (newVal, oldVal) => {
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

    return {
      hovered,
      shouldShowPlus,
      handleEnhance,
      handleDehance,
      handleRemove
    }
  }
})
</script>

<template>
  <span
    class="selected-container"
    @mouseout="hovered = false"
    @mouseover="hovered = true"
  >
    <span class="selected-tag">
      <span v-if="shouldShowPlus">
        <span
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
        ></span>
        <span
          class="tag-func tag-remove"
          @click="handleRemove"
          @mouseover="hovered = true"
          ><el-icon><Close /></el-icon
        ></span>
      </span>

      <span class="selected-mask" @mouseout="hovered = false"></span>

      <span v-for="i in tag.enhance" :key="i">(</span>
      <span>
        <span v-if="selectedLanguage == 'chinese'">{{ tag.nameCh }}</span>
        <span v-if="selectedLanguage == 'english'">{{ tag.nameEng }}</span>
      </span>
      <span v-for="i in tag.enhance" :key="i">)</span>
    </span>
  </span>
</template>

<style scoped lang="less">
.selected-container {
  display: inline-block;
  position: relative;
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
  padding: 0.3rem 0.4rem;
  border-radius: 0.3rem;
  cursor: pointer;
  position: relative;

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
    right: -12px;
  }
}
</style>
