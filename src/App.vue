<script setup lang="ts">
import FlemsEditor from '@/components/flems-editor/index.vue';
import VueEditor from '@/components/VueEditor/VueEditor.vue';
import SandPack from '@/components/SandPack/SandPack.vue';

import { utoa, atou } from '@/utils';
import { ref, watchEffect, toRaw, watch } from 'vue';
import { watchDeep } from '@vueuse/core';

const curEditor = ref('flems');
const query = new URLSearchParams(location.search);
if (query.has('vue')) {
  curEditor.value = 'vue';
}
if (query.has('flems')) {
  curEditor.value = 'flems';
}
if (query.has('sand-react-js')) {
  curEditor.value = 'sand-react-js';
}
</script>

<template>
  <template v-if="curEditor === 'vue'">
    <VueEditor class="h-[100%]"></VueEditor>
  </template>
  <template v-if="curEditor === 'flems'">
    <FlemsEditor class="h-[100%]"></FlemsEditor>
  </template>
  <template v-if="curEditor === 'sand-react-js'">
    <SandPack></SandPack>
  </template>
</template>

<style>
@import '@/assets/style/common.scss';
</style>
