<template>
    <div class="wrapper">
        <div class="left">
            <Codemirror
                v-model:value="text"
                :options="cmOptions"
                border
                ref="cmRef"
                style="width: 100%; height: 100%"
            >
            </Codemirror>
        </div>
        <div class="right">
            <button @click="run">运行</button>
            <div ref="output">
                <div v-for="item in outputList">> {{ item }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { utoa, atou } from "@/utils";
import { ref, onMounted, watch, onUnmounted } from "vue";
import "codemirror/mode/javascript/javascript.js";
import Codemirror from "codemirror-editor-vue3";
import type { CmComponentRef } from "codemirror-editor-vue3";
import type { Editor, EditorConfiguration } from "codemirror";

const cmRef = ref<CmComponentRef>();
const cmOptions: EditorConfiguration = {
  mode: "text/javascript",
};


onUnmounted(() => {
  cmRef.value?.destroy();
})

const output = ref();
const outputList = ref([]);
function run() {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.srcdoc = "";
    iframe.onload = () => {
        outputList.value = [];
        iframe.contentWindow.console = new Proxy(iframe.contentWindow.console, {
            get(target, p, receiver) {
                let old = target[p];
                return function () {
                    outputList.value.push(...arguments);
                    old(...arguments);
                };
            },
        });
        const js = document.createElement("script");
        js.innerHTML = text.value;
        iframe.contentDocument.body.appendChild(js);
        js.onload = () => {
            js.remove();
        };
        iframe.remove();
    };
    output.value.appendChild(iframe);
}
const text = ref("");
watch(
    () => text.value,
    () => {
        history.replaceState({}, "", `?code#` + utoa(text.value));
    }
);
onMounted(() => {
    text.value = atou(location.hash.slice(1));
    run();
});
</script>

<style lang="scss" scoped>
.wrapper {
    flex: 1;
    height: 0;
    display: flex;
    overflow: hidden;
    .left {
        width: 50%;
        flex-shrink: 0;
        border: 1px solid #ccc;
        textarea {
            width: 100%;
            height: 100% !important;
        }
    }
    .right {
        width: 50%;
        flex-shrink: 0;
        overflow: auto;
    }
}
</style>
