<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  components: {},
  setup() {
    const cache = ref<string>('')

    return {
      cache
    }
  }
})
</script>

<template>
  <div data-root="true" class="root-content"></div>
</template>

<style scoped lang="less"></style>
