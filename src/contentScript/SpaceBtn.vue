<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  components: {},
  props: {},
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
  <div style="display: inline-block">
    <slot></slot>
  </div>
</template>

<style scoped lang="less"></style>
