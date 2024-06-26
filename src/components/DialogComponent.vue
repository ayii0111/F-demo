<template>
  <div v-if="isVisible" class="dialog-backdrop">
    <div class="dialog-content">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button @click="close">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineModel } from 'vue'

// 定義組件的model
const isVisible = defineModel('isVisible', { type: Boolean, default: false })
const title = defineModel('title', { type: String, default: '' })
const message = defineModel('message', { type: String, default: '' })

// 關閉彈窗
const close = () => {
  // 重點，這裡看起來像是修改了props，實際上已由defineModel內涵的emitter通知父組件變更狀態
  isVisible.value = false
}
</script>
<style scoped>
.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}
</style>
