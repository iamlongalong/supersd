<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  components: {},
  props: {
    value: {
      type: Number,
      default: 0,
      required: false
    },
    showzero: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  emits: [],
  setup(props, { emit }) {
    const cache = ref<string>('')

    return {
      cache
    }
  }
})
</script>

<template>
  <span style="position: relative">
    <slot></slot>
    <span v-if="value != 0 || showzero" class="count-badge">{{ value }}</span>
  </span>
</template>

<style scoped lang="less">
.count-badge {
  font-weight: 500;
  letter-spacing: 0em;
  color: #1a1a1a;

  position: absolute;
  right: 0;
  top: -1rem;
  display: block;
  border-radius: 0.5rem;
  height: 1rem;
  padding: 0.1rem 0.3rem;
  font-size: 0.7rem;
  line-height: 1rem;
  text-align: center;

  background-color: #ffd83c;
}
</style>
