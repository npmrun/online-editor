<script lang="ts" setup>
import { watchEffect, onMounted, watch, toRaw } from 'vue';
import { useSandpack } from 'sandpack-vue3';

const { sandpack } = useSandpack();

const emit = defineEmits(["change"])

watch(
  () => sandpack.files,
  (code) => {
    emit('change', JSON.parse(JSON.stringify(toRaw(code))))
  }
);
</script>
<template></template>