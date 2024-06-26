<template>
  <DialogComponent v-model:isVisible="dialogs.isVisible" :title="dialogs.title" :message="dialogs.message" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const dialogs = ref({ isVisible: false, title: 'Dialog 1', message: 'Message 1' });
</script>