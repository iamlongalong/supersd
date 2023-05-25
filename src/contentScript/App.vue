<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import { getCache } from './utils'

export default defineComponent({
  components: {
    ElButton,
    ElDialog
  },
  setup() {
    const dialogVisible = ref<boolean>(true)
    const cache = ref<string>('')
    const handleOpen = async () => {
      dialogVisible.value = true
      const data = await getCache('key1')
      cache.value = data.result
    }

    const handleClose = () => {
      dialogVisible.value = false
    }

    return {
      cache,
      dialogVisible,
      handleClose,
      handleOpen
    }
  }
})
</script>

<template>
  <div data-root="true" class="root-content">
    <div>顶部资源</div>

    <div>
      中间部分

      <div>第一部分</div>

      <div>第二部分</div>

      <div>第三部分</div>

      <div>第四部分</div>
    </div>

    <div>灵感部分</div>

    <el-button type="primary" @click="handleOpen">看看吗</el-button>

    <el-dialog
      v-model="dialogVisible"
      title="Tips"
      width="30%"
      :before-close="handleClose"
    >
      <span>hello world {{ cache }}</span>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="dialogVisible = false"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
// root fixed on the right of window
.root-content {
  position: fixed;
  right: 0px;
  top: 68px;
  z-index: 9999;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  overflow: auto;
}

.big-text {
  font-size: 50px;
  font-weight: bold;
}
</style>
