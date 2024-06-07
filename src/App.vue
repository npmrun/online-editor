<script setup lang="ts">
import FlemsEditor from '@/components/flems-editor/index.vue';
import VueEditor from '@/components/VueEditor/VueEditor.vue';
import Vue2Editor from '@/components/Vue2Editor/Vue2Editor.vue';
import SandPack from '@/components/SandPack/SandPack.vue';
import codeplayer from '@/components/codeplayer/index.vue';
import MdEditor from '@/components/MdEditor/MdEditor.vue'
import { utoa, atou } from '@/utils';
import { ref, watchEffect, toRaw, watch, nextTick, onMounted } from 'vue';
import { watchDeep } from '@vueuse/core';
import { v4 as uuidv4 } from 'uuid';

const curEditor = ref('flems');
window.uuid 

const query = new URLSearchParams(location.search);
if (query.has('uuid')) {
  window.uuid = query.get('uuid')
}else {
  window.uuid = uuidv4()
}
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
if (query.has('player')) {
  curEditor.value = 'player';
}
const key = ref(0)
if (query.has('md')) {
  curEditor.value = 'md';
  key.value++
}

let isInIframe = ref(false)
if (window.frames.length != parent.frames.length) {
  isInIframe.value = true
} 

const text = ref("")
let init = true
if (location.hash && query.has('md')) {
    try {
        const data = atou(location.hash.slice(1))
        nextTick(() => {
          text.value = data
        })
    } catch (e) {
        console.error(e)
    }
}

function throttle(fn, delay) {
  let timer = null
  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args)
        timer = null // 在 delay 时间后可以再次执行
      }, delay)
    }
  }
}
const updateR = throttle(()=>window.ChromeUpdateBookmarkUrl().then((res)=>{
  console.log(res)
  if(!res) {
    alert("更新收藏的网址失败，请注意可能造成数据丢失")
  }
  if(res.code === 2) {
    alert(res.message)
  }
  if(res.code === 3) {
    alert(res.message)
  }
}), 500)
watchEffect(() => {
  if(window.ChromeUpdateBookmarkUrl) {
    updateR();
  }
  history.replaceState({}, '', `?md&uuid=${window.uuid}#` + utoa(text.value))
})
function handleChangeCode(a: string) {
  if(!window.ChromeUpdateBookmarkUrl && !init) {
    alert("尚检测到插件ID，无法更新收藏的网址，请注意可能造成数据丢失")
  }
  init = false
  text.value = a
}
</script>

<template>
  <div style="height: 100%;display: flex;flex-direction: column;" :class="isInIframe ? 'in-iframe' : ''">
    <div class="header">
      <a href="/" class="mr-5">flem</a>
      <a href="/?vue" class="mr-5">vue3 sfc</a>
      <a href="/?vue27" class="mr-5">vue2.7 sfc</a>
      <a href="/?vue26#eNo9T9FuwyAM/BXLT5u0gtJKe4hYtf0HL6x4K1MgCJxsUpR/n0naIgQ+22ffLfiRs5onwh5NvZSQ+WwT/eWxMHj6ctPAsNgE4B27p+ctBCjEU0l7oZ1Yv3vojqcdr+2TR67Rj6ECmGIeHJMgAOPDvAUSXrvzsrQpsK5GC7rlQ8oTw3yIo6fhzaJ0WNzZeqcb/RiKLxhiE36ILqufOiYxtUm0t0K12N9FWxTXDVu8Mufaa33xSWiyKcxFJWKdctTS9X5Ur6o7ycbKDSuqUX2W8bdSEYLFu19c/wFNam6P" class="mr-5">vue2.6 sfc</a>
      <a href="/?sand-react-js" class="mr-5">sand-react-js</a>
      <a href="/?player" class="mr-5">codeplayer</a>
      <a href="/?md">markdown</a>
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
    <template v-if="curEditor === 'player'">
      <codeplayer></codeplayer>
    </template>
    <template v-if="curEditor === 'md'">
      <MdEditor style="height:100%" :value="text" @change="(v: string) => handleChangeCode(v)"></MdEditor>
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

.CodeMirror.cm-s-default{
  height: 100%;
}

.bytemd{
  height: 100%;
}
</style>
