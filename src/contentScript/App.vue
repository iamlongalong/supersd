<script lang="ts">
import { StyleValue, defineComponent, ref } from 'vue'
// import { ElButton, ElDialog } from 'element-plus'
import GenPage from './GenPage.vue'
import MyPage from './MyPage.vue'
import ModalMask from './ModalMask.vue'
import { autoHistories } from './history.ts'
import HistoryView from './HistoryView.vue'

export default defineComponent({
  components: {
    GenPage,
    MyPage,
    HistoryView,
    ModalMask
  },
  setup(props, { emit }) {
    // const selectedPage = ref<string>('mypage')
    const selectedPage = ref<string>('genpage')

    const histLists = () => autoHistories.histories

    const handleClickHistory = () => {
      isHistoryOpen.value = !isHistoryOpen.value
      return
    }

    const isscaleout = ref<boolean>(false)
    const handleClickScaleout = () => {
      return
    }

    // const isquit = ref<boolean>(true)
    const isquit = ref<boolean>(false)
    const handleClickQuit = () => {
      if (isquit.value) {
        isquit.value = false
      } else {
        isquit.value = true

        setTimeout(() => (isscaleout.value = false), 1000)
      }
      return
    }

    const getRootStyle = (): StyleValue => {
      let res = { width: '500px', right: '0' }

      if (isquit.value) {
        res.right = '-100%'
      }

      if (isscaleout.value) {
        res.width = '900px'
      }

      return res
    }

    const getModalWidth = (): string => {
      if (isscaleout.value) {
        // 存在 30px 边框
        return '930px'
      }
      return '530px'
    }

    const editTags = ref<Array<SelectedTag>>([])
    const edittagschanged = ref<boolean>(false)

    const handleEdit = (stags: SavedTags) => {
      console.log('handle edit history', stags)

      if (editTags.value.length > 0) {
        editTags.value.splice(0, editTags.value.length)
      }

      edittagschanged.value = !edittagschanged.value

      editTags.value.push(...stags.selectedTags)

      selectedPage.value = 'genpage'
    }

    const handleEditAutoHist = (stags: SavedTags) => {
      isHistoryOpen.value = false

      handleEdit(stags)
    }

    const isHistoryOpen = ref<boolean>(false)

    return {
      selectedPage,
      handleClickHistory,
      isscaleout,
      handleClickScaleout,
      isquit,
      handleClickQuit,
      getRootStyle,
      getModalWidth,
      handleEdit,
      handleEditAutoHist,
      editTags,
      edittagschanged,
      histLists,
      isHistoryOpen,
      autoHistories
    }
  }
})
</script>

<template>
  <div data-root="true" class="root-content" :style="getRootStyle()">
    <el-container @scroll.stop="">
      <el-header class="header-container" height="2rem" style="padding: 0">
        <el-row justify="space-between">
          <el-col :span="12">
            <el-row justify="start">
              <div class="page-tag-container">
                <span
                  class="page-tag"
                  :class="selectedPage == 'genpage' ? 'page-tag-selected' : ''"
                  @click="selectedPage = 'genpage'"
                  ><el-icon style="margin-right: 5px">
                    <FolderAdd />
                  </el-icon>
                  生成</span
                >

                <span
                  class="page-tag"
                  :class="selectedPage == 'mypage' ? 'page-tag-selected' : ''"
                  @click="selectedPage = 'mypage'"
                  ><el-icon style="margin-right: 5px">
                    <User />
                  </el-icon>
                  我的</span
                >
              </div>
            </el-row>
          </el-col>
          <el-col :span="12">
            <el-row justify="end" class="header-icon-container">
              <!-- 历史记录 -->
              <el-icon class="his-icons" @click="handleClickHistory">
                <Clock />
              </el-icon>

              <!-- 展开收起 -->
              <el-icon
                class="his-icons"
                :class="isscaleout ? 'scale-selected' : ''"
                @click="isscaleout = !isscaleout"
              >
                <FullScreen />
              </el-icon>

              <!-- 退出 -->
              <el-icon class="his-icons" @click="handleClickQuit">
                <ArrowRightBold />
              </el-icon>
            </el-row>
          </el-col>
        </el-row>
      </el-header>

      <el-main
        style="max-height: 100vh - 50px; padding: 1.3rem 1rem"
        class="main-container"
      >
        <GenPage
          v-show="selectedPage == 'genpage'"
          style="height: 100%"
          :edit-tags="editTags"
          :edittagschanged="edittagschanged"
        ></GenPage>
        <MyPage
          v-if="selectedPage == 'mypage'"
          style="height: 100%"
          @edit="handleEdit"
        ></MyPage>

        <div class="hist-drawer-container">
          <!-- <el-drawer
            v-model="isHistoryOpen"
            class="hist-drawer"
            direction="btt"
          >
            <template #header>
              <h4></h4>
            </template>
          </el-drawer> -->

          <ModalMask
            v-model="isHistoryOpen"
            title="历史记录"
            :modal-width="getModalWidth()"
          >
            <div v-if="isHistoryOpen" style="padding: 0 20px">
              <HistoryView
                :history-list="histLists()"
                :can-remove="false"
                @edit="handleEditAutoHist"
              ></HistoryView>
            </div>
          </ModalMask>
        </div>
      </el-main>
    </el-container>
  </div>

  <!-- 脚标 -->
  <div
    class="footer-bar-root"
    :class="isquit ? 'footer-show' : ''"
    @click="handleClickQuit"
  >
    打开
  </div>
</template>

<style lang="less">
::-webkit-scrollbar {
  display: none;
}

.root-content {
  user-select: none;
  color: #3d3d3d;
  font-size: 16px;
}
</style>

<style scoped lang="less">
// root fixed on the right of window

.root-content {
  position: fixed;
  width: 500px;
  right: 0;
  top: 0px;
  z-index: 9999;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  padding: 20px 15px 30px;
  border-radius: 10px;
  overflow: auto;
  opacity: 1;
  height: 100vh;
  transition: right 0.6s ease-in-out, width 0.6s ease-in-out;
}

.header-icon-container {
  display: flex;
  align-items: center;
  line-height: 3rem;
  height: 2rem;
}

.header-container {
  position: relative;

  &::after {
    content: '';
    /* 必须设置，否则伪元素不会显示 */
    position: absolute;
    /* 设置绝对定位，让伪元素与div重叠 */
    bottom: -1.5rem;
    /* 将伪元素定位在div的底部 */
    left: 0;
    /* 将伪元素左侧对齐div的左侧 */
    right: 0;
    /* 将伪元素右侧对齐div的右侧 */
    height: 1px;
    /* 设置伪元素的高度 */
    background-color: #d8d8d8;
    /* 设置伪元素的背景颜色 */
  }
}

.page-tag-container {
  display: flex;
  border-radius: 2rem;
  background: #f4f4f4;
  color: #7c7b7b;
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.04);
  padding: 0.3rem 0.3rem;
}

.page-tag {
  display: flex;
  font-weight: 500;
  align-items: center;
  padding: 3px 1rem;
  line-height: 1.5rem;
  border-radius: 1rem;
  cursor: pointer;

  &.page-tag-selected {
    background: #ebe7f4;
    color: #7b62db;
  }
}

.his-icons {
  display: inline-block;
  margin: 0 10px;
  line-height: 2rem;
  cursor: pointer;
}

div {
  // border: solid 0.1px #efefef;
}

.big-text {
  font-size: 50px;
  font-weight: bold;
}

.scale-selected {
  color: #ae5ed9;
}

.footer-bar-root {
  position: fixed;
  cursor: pointer;
  bottom: 100px;
  right: -50px;
  transition: right 0.8s ease-in-out;
  width: 50px;
  height: 50px;
  background-color: #ebdcfc;
  border-radius: 50%;
  line-height: 50px;
  text-align: center;
  box-shadow: 0px 0px 10px 0px rgba(143, 111, 228, 0.5);

  &.footer-show {
    right: 60px;
  }
}

.hist-drawer-container {
  position: relative;

  .hist-drawer {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0;
    top: 300px;
  }
}
</style>
