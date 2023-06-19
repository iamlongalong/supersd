<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  components: {},
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    showHeader: {
      type: Boolean,
      required: false,
      default: true
    },
    title: {
      type: String,
      required: false,
      default: ''
    },
    showClose: {
      type: Boolean,
      required: false,
      default: true
    },
    modalWidth: {
      type: String,
      required: false,
      default: '100%'
    },
    modalHeight: {
      type: String,
      required: false,
      default: '70vh'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const showModal = ref<boolean>(props.modelValue)
    const closing = ref<boolean>(!showModal.value)

    watch(
      () => props.modelValue,
      (nv, ov) => {
        if (nv) {
          showModal.value = true

          closing.value = false
        }

        if (!nv) {
          closing.value = true

          // 1s 后关闭
          setTimeout(() => {
            showModal.value = false
          }, 500)
        }
      }
    )

    const getModalWidth = (): string => {
      return props.modalWidth
    }
    const getModalHeight = (): string => {
      if (!showModal.value) {
        return '0px'
      }

      return props.modalHeight
    }

    const getContainerBottom = (): string => {
      if (closing.value) {
        return '-100vh'
      }

      return '0'
    }
    const closeModal = () => {
      emit('update:modelValue', false)
    }

    const handleClick = (e: Event) => {
      e.stopPropagation()
      e.preventDefault()
    }

    return {
      showModal,
      closeModal,
      getModalWidth,
      getModalHeight,
      getContainerBottom,
      handleClick
    }
  }
})
</script>

<template>
  <div
    v-show="showModal"
    :style="{ width: getModalWidth() }"
    class="modal-mask"
    style="z-index: 403"
    @click="closeModal"
  >
    <div
      style="
        position: fixed;
        height: 100vh;
        right: 0;
        bottom: '-100vh';
        background-color: #ffffff;
        border-radius: 1rem 1rem 0 0;
        z-index: 404;
        transition: bottom 0.5s ease-in-out;
        display: flex;
        flex-direction: column;
      "
      :style="{
        width: getModalWidth(),
        height: getModalHeight(),
        bottom: getContainerBottom()
      }"
      @click.stop="handleClick"
    >
      <div v-if="showHeader" class="modal-header-container">
        <slot name="header" class="modal-header-slot">
          <div class="modal-header-default">
            <div>{{ title }}</div>
          </div>
        </slot>

        <div class="modal-header-close" @click="closeModal">
          <el-icon><Close /></el-icon>
        </div>
      </div>
      <div class="modal-content">
        <slot></slot>
      </div>
      <div style="flex-shrink: 0; overflow: auto">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.modal-mask {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(75, 74, 74, 0.2);
}

.modal-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem 1rem;
  border-bottom: 1px solid #d8d8d8;
  margin-bottom: 1rem;
  flex-shrink: 0;

  .modal-header-slot {
    flex: 1;
  }

  .modal-header-default {
    color: #3d3d3d;
    font-size: 1.4rem;
    font-weight: bold;
    text-align: left;
  }

  .modal-header-close {
    align-self: flex-end;
    cursor: pointer;
    line-height: 1rem;
    padding: 0.1rem 0.4rem;
    background-color: #f4f4f4;
    color: #90959d;
    border-radius: 10px;
  }
}
.modal-content {
  flex-grow: 1;
  overflow-y: scroll;
}
</style>
