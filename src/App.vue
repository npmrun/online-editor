<script setup lang="ts">
import FlemsEditor from '@/components/flems-editor/index.vue';
import VueEditor from '@/components/VueEditor/VueEditor.vue';
import Vue2Editor from '@/components/Vue2Editor/Vue2Editor.vue';
import SandPack from '@/components/SandPack/SandPack.vue';

import { utoa, atou } from '@/utils';
import { ref, watchEffect, toRaw, watch } from 'vue';
import { watchDeep } from '@vueuse/core';

const curEditor = ref('flems');
const query = new URLSearchParams(location.search);
if (query.has('vue')) {
  curEditor.value = 'vue';
}
if (query.has('vue27')) {
  curEditor.value = 'vue27';
}
if (query.has('vue26')) {
  curEditor.value = 'vue26';
}
if (query.has('flems')) {
  curEditor.value = 'flems';
}
if (query.has('sand-react-js')) {
  curEditor.value = 'sand-react-js';
}

let isInIframe = ref(false)
if (window.frames.length != parent.frames.length) {
  isInIframe.value = true
} 
</script>

<template>
  <div style="height: 100%;display: flex;flex-direction: column;" :class="isInIframe ? 'in-iframe' : ''">
    <div class="header">
      <a href="/" class="mr-5">flem</a>
      <a href="/?vue" class="mr-5">vue3 sfc</a>
      <a href="/?vue27" class="mr-5">vue2.7 sfc</a>
      <a href="/?vue26#eNo9T9FuwyAM/BXLT5u0gtJKe4hYtf0HL6x4K1MgCJxsUpR/n0naIgQ+22ffLfiRs5onwh5NvZSQ+WwT/eWxMHj6ctPAsNgE4B27p+ctBCjEU0l7oZ1Yv3vojqcdr+2TR67Rj6ECmGIeHJMgAOPDvAUSXrvzsrQpsK5GC7rlQ8oTw3yIo6fhzaJ0WNzZeqcb/RiKLxhiE36ILqufOiYxtUm0t0K12N9FWxTXDVu8Mufaa33xSWiyKcxFJWKdctTS9X5Ur6o7ycbKDSuqUX2W8bdSEYLFu19c/wFNam6P" class="mr-5">vue2.6 sfc</a>
      <a href="/?sand-react-js">sand-react-js</a>
    </div>
    <template v-if="curEditor === 'vue'">
      <VueEditor class="h-[100%]"></VueEditor>
    </template>
    <template v-if="curEditor === 'vue27' || curEditor === 'vue26'">
      <Vue2Editor class="h-[100%]"></Vue2Editor>
    </template>
    <template v-if="curEditor === 'flems'">
      <FlemsEditor class="h-[100%]"></FlemsEditor>
    </template>
    <template v-if="curEditor === 'sand-react-js'">
      <SandPack></SandPack>
    </template>
  </div>
</template>

<style>
@import '@/assets/style/common.scss';

.in-iframe .header {
  display: none !important;
}
.in-iframe .hide-iframe {
  display: none !important;
}
</style>
