<script lang="ts" setup>
import { watchEffect, onMounted, watch, shallowRef, toRaw, unref } from 'vue';
import Inner from './Inner.vue';
import { utoa, atou } from '@/utils';
import {
  useSandpack,
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview,
} from 'sandpack-vue3';

let rawFiles = {
  '/App.js': {
    code: `export default function App() {
  return <h1>Hello world</h1>
}
`,
  },
  '/index.js': {
    code: `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
  },
  '/package.json': {
    code: `{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-scripts": "^5.0.0"
  },
  "main": "/index.js",
  "devDependencies": {}
}`,
  },
  '/public/index.html': {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  },
  '/styles.css': {
    code: `body {
  font-family: sans-serif;
  -webkit-font-smoothing: auto;
  -moz-font-smoothing: auto;
  -moz-osx-font-smoothing: grayscale;
  font-smoothing: auto;
  text-rendering: optimizeLegibility;
  font-smooth: always;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

h1 {
  font-size: 1.5rem;
}`,
  },
};

const filelist = shallowRef(rawFiles);

if (location.hash) {
  try {
    rawFiles = JSON.parse(atou(location.hash.slice(1)));
    filelist.value = rawFiles
  } catch (e) {
    console.error(e);
  }
}

watch(
  () => filelist.value,
  (obj) => {
    setTimeout(()=>{history.replaceState({}, '', '#' + utoa(JSON.stringify(toRaw(obj))));})
  },
  {
    deep: true,
  }
);

function handleChange(code) {
  filelist.value = code
}
</script>

<template>
  <div class="wrapper">
    <SandpackProvider :files="rawFiles" template="react">
      <SandpackLayout>
        <SandpackFileExplorer />
        <SandpackCodeEditor closableTabs />
        <SandpackPreview />
        <Inner @change="handleChange"></Inner>
      </SandpackLayout>
    </SandpackProvider>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  height: 100%;
  :deep(.sp-wrapper) {
    height: 100%;
  }
  :deep(.sp-layout) {
    height: 100%;
  }
  :deep(.sp-layout > *) {
    height: 100%;
  }
}
</style>
