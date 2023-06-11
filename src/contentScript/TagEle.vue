<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  components: {},
  props: {
    tag: {
      type: Object as () => Tag,
      required: true
    },
    selected: {
      type: Boolean,
      required: false
    },
    language: {
      type: String,
      required: false,
      default: 'both'
    }
  },
  setup() {
    const cache = ref<string>('')

    const handleClose = () => {
      return
    }

    return {
      cache,
      handleClose
    }
  }
})
</script>

<template>
  <div class="sdtag" :class="selected ? 'selected' : ''">
    <span
      style="
        background-color: #f4f4f4;
        border-radius: 0.3rem 0 0 0.3rem;
        padding: 0.4rem 0.3rem 0.4rem 0.6rem;
        display: inline-block;
      "
      >{{ tag.nameEng }}</span
    >
    <span
      style="
        background-color: #ebdcfc;
        border-radius: 0 0.3rem 0.3rem 0;
        color: #8f6fe4;
        padding: 0.4rem 0.6rem 0.4rem 0.3rem;
        display: inline-block;
      "
      >{{ tag.nameCh }}</span
    >
  </div>
</template>

<style scoped lang="less">
.sdtag {
  margin: 0.3rem;
  cursor: pointer;
  border-radius: 0.3rem;
  box-sizing: border-box;
  color: #9c9c9c;

  &.selected {
    // border: solid 2px #efefef;
    color: #8f6fe4;
  }
}
</style>
