<script setup lang="ts">
import { watchEffect } from 'vue'
import { Repl, ReplStore } from 'vue2-repl'
import Monaco from '@vue/repl/monaco-editor';
import { utoa, atou } from '@/utils';

// https://github.com/Thy3634/vue2-repl
// https://segmentfault.com/a/1190000042686835#item-4

// retrieve some configuration options from the URL
const query = new URLSearchParams(location.search);

const store = new ReplStore({
  // initialize repl with previously serialized state
  serializedState: location.hash.slice(1),

  // starts on the output pane (mobile only) if the URL has a showOutput query
  showOutput: query.has('showOutput'),
  // starts on a different tab on the output pane if the URL has a outputMode query
  // and default to the "preview" tab
  outputMode: query.get('outputMode') || 'preview',

  // specify the default URL to import Vue runtime from in the sandbox
  // default is the CDN link from jsdelivr.com with version matching Vue's version
  // from peerDependency
  defaultVueRuntimeURL: import.meta.env.PROD
    ? `https://play.vuejs.org/vue.runtime.esm-browser.js`
    : `${location.origin}/src/vue-dev-proxy`,
  defaultVueServerRendererURL: import.meta.env.PROD
    ? `https://play.vuejs.org/server-renderer.esm-browser.js`
    : `${location.origin}/src/vue-server-renderer-dev-proxy`,
});
watchEffect(() => history.replaceState({}, '', store.serialize()))

// pre-set import map
// store.setImportMap({
//   imports: {
//     vue: 'https://play.vuejs.org/vue.runtime.esm-browser.js',
//     'vue/server-renderer':
//       'https://play.vuejs.org/server-renderer.esm-browser.js',
//   },
// });

// use a specific version of Vue
store.setVueVersion(query.has('vue27') ? '2.7.10' : '2.6.13');
</script>

<template>
  <Repl :store="store" :editor="Monaco" :showCompileOutput="true" />
</template>
