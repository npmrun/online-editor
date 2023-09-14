<script setup lang="ts">
import { onMounted, ref, unref, watch, toRaw } from 'vue';
import Flems from 'flems/dist/flems.js';
import { useVModel } from '@vueuse/core';
import { utoa, atou } from '@/utils';

const filelist = ref([
  {
    name: '.html',
    content: '',
  },
  {
    name: '.ts',
    content: '',
  },
  {
    name: '.scss',
    content: ' ',
  },
]);

if (location.hash) {
  try {
    filelist.value = JSON.parse(atou(location.hash.slice(1)));
  } catch (e) {
    console.error(e);
  }
}

watch(
  () => filelist.value,
  (obj) => {
    history.replaceState({}, '', '#' + utoa(JSON.stringify(toRaw(obj))));
  },
  {
    deep: true,
  }
);

const flemsEditor = ref<HTMLElement>();
onMounted(() => {
  if (flemsEditor.value) {
    const flems = Flems(
      flemsEditor.value,
      {
        files: JSON.parse(JSON.stringify(unref(filelist))),
      },
      '/runtime.html'
    );
    flems.onchange((model) => {
      filelist.value = model.files.map((v) => {
        return {
          name: v.name,
          content: v.content,
        };
      });
    });
  }
});
</script>

<template>
  <div ref="flemsEditor"></div>
</template>
