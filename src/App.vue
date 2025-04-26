<script setup lang="ts">
import { utoa, atou } from '@/utils';
import { ref, watchEffect, toRaw, watch, nextTick, onMounted, defineAsyncComponent } from 'vue';
import { watchDeep } from '@vueuse/core';
import { v4 as uuidv4 } from 'uuid';

const FlemsEditor = defineAsyncComponent(() =>
  import('@/components/flems-editor/index.vue')
);
const VueEditor = defineAsyncComponent(() =>
  import('@/components/VueEditor/VueEditor.vue')
);
const Vue2Editor = defineAsyncComponent(() =>
  import('@/components/Vue2Editor/Vue2Editor.vue')
);
const SandPack = defineAsyncComponent(() =>
  import('@/components/SandPack/SandPack.vue')
);
const codeplayer = defineAsyncComponent(() =>
  import('@/components/codeplayer/index.vue')
);
const MdEditor = defineAsyncComponent(() =>
  import('@/components/MdEditor/MdEditor.vue')
);
const RCode = defineAsyncComponent(() =>
  import('@/components/Code/Code.vue')
);

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
if (query.has('code')) {
  curEditor.value = 'code';
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
const result = ref("")
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
if(query.has('md')) {
  onMounted(() => {
    if(!window.ChromeUpdateBookmarkUrl) {
        alert("尚检测到插件ID，无法更新收藏的网址，请注意可能造成数据丢失")
    }
  })
  window.addEventListener('beforeunload',
    function (e) {
        console.log(result.value)
        if (result.value !== '' || !window.ChromeUpdateBookmarkUrl) {
          e.preventDefault();
          e.returnValue = '';
        }
  });
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
    result.value = "更新收藏的网址失败，请注意可能造成数据丢失"
  }
  if(res.code === 1) {
    result.value = res.message
  } else if(res.code === 2) {
    result.value = res.message
  } else if(res.code === 3) {
    result.value = res.message
  } else {
    result.value = ""
  }
}), 500)
watchEffect(() => {
  if(!query.has('md')) return
  if(window.ChromeUpdateBookmarkUrl) {
    updateR();
  }
  history.replaceState({}, '', `?md&uuid=${window.uuid}#` + utoa(text.value))
})
function handleChangeCode(a: string) {
  if(!query.has('md')) return
  text.value = a
}

const showImage = ref(false)
function handleGetImage(e){
  e.preventDefault()
  showImage.value = !showImage.value
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
      <a href="/?md" class="mr-5">markdown</a>
      <a href="/?code" class="mr-5">code</a>
      <a @click="handleGetImage">picsum.photos</a>
    </div>
    <div v-if="showImage">
    <a href="https://picsum.photos/" target="_blank">https://picsum.photos/</a>
    <img src="https://picsum.photos/45">
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
    <template v-if="curEditor === 'code'">
      <RCode></RCode>
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
