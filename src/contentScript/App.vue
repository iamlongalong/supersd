<script lang="ts">
import { defineComponent, ref } from 'vue'
// import { ElButton, ElDialog } from 'element-plus'
import GenPage from './GenPage.vue'
import MyPage from './MyPage.vue'

export default defineComponent({
  components: {
    GenPage,
    MyPage
  },
  setup() {
    const cache = ref<string>('')

    const selectedPage = ref<string>('genpage')

    const handleClickHistory = () => {
      ElMessage({
        message: '查看历史记录',
        type: 'success'
      })
      return
    }

    const isscaleout = ref<boolean>(false)
    const handleClickScaleout = () => {
      return
    }

    const isquit = ref<boolean>(true)
    const handleClickQuit = () => {
      if (isquit.value) {
        isquit.value = false
      } else {
        isquit.value = true

        setTimeout(() => (isscaleout.value = false), 1000)
      }
      return
    }

    const getRootClasses = (): string => {
      let classStrs = ''

      if (isquit.value) {
        classStrs += 'root-quit '
      }

      if (isscaleout.value) {
        classStrs += 'root-scaleout '
      }

      return classStrs
    }

    return {
      cache,
      selectedPage,
      handleClickHistory,
      isscaleout,
      handleClickScaleout,
      isquit,
      handleClickQuit,
      getRootClasses
    }
  }
})
</script>

<template>
  <div data-root="true" class="root-content" :class="getRootClasses()">
    <el-container>
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
          v-if="selectedPage == 'genpage'"
          style="height: 100%"
        ></GenPage>
        <MyPage v-if="selectedPage == 'mypage'" style="height: 100%"></MyPage>
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
  // color: #9c9c9c;
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

  &.root-scaleout {
    width: 900px;
  }

  &.root-quit {
    right: -100%;
  }
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
</style>
