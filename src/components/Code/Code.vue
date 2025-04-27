<template>
    <div class="wrapper">
        <div class="left">
            <Codemirror
                v-model:value="text"
                :options="cmOptions"
                border
                ref="cmRef"
                class="code-editor"
            >
            </Codemirror>
        </div>
        <div class="right">
            <div class="button-group">
                <button class="action-button run-button" @click="run">
                    运行
                </button>
                <button class="action-button reset-button" @click="reset">
                    重置
                </button>
                <button class="action-button reset-button" @click="copy">
                    复制
                </button>
            </div>
            <div ref="output" class="output-container">
                <div
                    v-for="(item, index) in outputList"
                    :key="index"
                    class="output-item"
                >
                    <span class="output-prefix">&gt;</span>
                    {{ item }}
                </div>
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
import type { EditorConfiguration } from "codemirror";
import { useThrottleFn } from "@vueuse/core";
import iframeText from "./iframe.html?raw";

const cmRef = ref<CmComponentRef>();
const cmOptions: EditorConfiguration = {
    mode: "text/javascript",
};

onUnmounted(() => {
    cmRef.value?.destroy();
});

const output = ref();
const outputList = ref<any[]>([]);
const run = useThrottleFn(() => {
    const iframe = document.createElement("iframe");
    // iframe.style.display = "none";
    // iframe.setAttribute("sandbox", "allow-scripts");
    // iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    // iframe.src = "about:blank";
    iframe.srcdoc = "";
    iframe.onload = () => {
        if (!iframe.contentWindow) return;
        const contentWindow = iframe.contentWindow as any;
        const contentDocument = iframe.contentDocument as any;
        outputList.value = [];
        contentWindow.console = new Proxy(contentWindow.console, {
            get(target, p, receiver) {
                let old = Reflect.get(target, p, receiver);
                return function () {
                    outputList.value.push(...arguments);
                    old(...arguments);
                };
            },
        });
        const js = contentDocument.createElement("script");
        //with(eval){}
        const code = `${text.value}`.toString();
        console.log("" + code);

        js.innerText = `
try{new Function(\`${text.value
            .toString()
            .replaceAll("\n", "\\n")
            // .replaceAll(/\\/g, "\\\\")
            .replaceAll("`", "\\`")
            .replaceAll(/\$/g, "\\$")}\`)()}catch(e){console.log(e);throw e}
`;
        contentDocument.body.appendChild(js);
        js.onload = () => {
            js.remove();
        };
        js.onerror = (e: any) => {
            outputList.value.push(e);
        };
        iframe.remove();
    };
    output.value.appendChild(iframe);
}, 100);
const oldText = atou(location.hash.slice(1));
const text = ref(oldText);
watch(
    () => text.value,
    () => {
        history.replaceState({}, "", `?code#` + utoa(text.value));
        run();
    }
);
function reset() {
    text.value = oldText;
    run();
}
onMounted(reset);
</script>

<style lang="scss" scoped>
.wrapper {
    flex: 1;
    height: 0;
    display: flex;
    overflow: hidden;
    background: #f5f5f5;
    gap: 16px;
    padding: 16px;

    .left {
        width: 50%;
        flex-shrink: 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background: #fff;

        :deep() {
            .codemirror-container.bordered {
                border: none;
            }
        }

        .code-editor {
            width: 100%;
            height: 100% !important;

            :deep(.CodeMirror) {
                height: 100%;
                font-family: "Consolas", "Monaco", monospace;
                font-size: 14px;
                line-height: 1.6;
                background: #fafafa;
                border: none;

                .CodeMirror-gutters {
                    border-right: 1px solid #eee;
                    background: #f5f5f5;
                }

                .CodeMirror-linenumber {
                    color: #999;
                    padding: 0 8px;
                }

                .CodeMirror-cursor {
                    border-left: 2px solid #4caf50;
                }

                .CodeMirror-selected {
                    background: #e3f2fd !important;
                }

                .CodeMirror-line {
                    padding: 0 8px;
                }
            }
        }

        textarea {
            width: 100%;
            height: 100% !important;
            font-family: "Consolas", "Monaco", monospace;
        }
    }

    .right {
        width: 50%;
        flex-shrink: 0;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;

        .button-group {
            display: flex;
            gap: 8px;
        }

        .action-button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
                opacity: 0.9;
            }

            &:active {
                transform: scale(0.98);
            }
        }

        .run-button {
            background: #4caf50;
            color: white;
        }

        .reset-button {
            background: #f0f0f0;
            color: #333;
        }

        .output-container {
            flex: 1;
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            font-family: "Consolas", "Monaco", monospace;
            min-height: 200px;

            .output-item {
                padding: 6px 0;
                color: #333;

                &:not(:last-child) {
                    border-bottom: 1px dashed #eee;
                }

                .output-prefix {
                    color: #666;
                    margin-right: 8px;
                }
            }
        }
    }
}
</style>
