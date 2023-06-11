<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  components: {},
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
  <div>my page here</div>
</template>

<style scoped lang="less"></style>
