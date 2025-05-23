<template>
    <div class="wrapper">
        <div class="left" :style="{ width: leftWidth + '%' }">
            <div class="mode-switcher">
                <button
                    @click="curMode = 'editor'"
                    class="mode-button"
                    :class="{ active: curMode === 'editor' }"
                >
                    编辑器
                </button>
                <button
                    @click="curMode = 'importmap'"
                    class="mode-button"
                    :class="{ active: curMode === 'importmap' }"
                >
                    Import Map
                </button>
            </div>
            <Codemirror
                v-model:value="curText"
                :options="cmOptions"
                border
                ref="cmRef"
                class="code-editor"
            >
            </Codemirror>
        </div>
        <div class="resizer" @mousedown="startResize"></div>
        <div class="right" :style="{ width: 100 - leftWidth + '%' }">
            <div class="button-group">
                <button class="action-button run-button" @click="run">
                    运行
                </button>
                <button class="action-button reset-button" @click="reset">
                    重置
                </button>
                <button
                    class="action-button reset-button"
                    :class="{ copied: hasCopied }"
                    @click="copy"
                >
                    复制网址
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
import {
    ref,
    onMounted,
    watch,
    onUnmounted,
    watchEffect,
    nextTick,
    computed,
} from "vue";
import "codemirror/mode/javascript/javascript.js";
import Codemirror from "codemirror-editor-vue3";
import type { CmComponentRef } from "codemirror-editor-vue3";
import type { EditorConfiguration } from "codemirror";
import { useThrottleFn } from "@vueuse/core";

const cmRef = ref<CmComponentRef>();
const cmOptions: EditorConfiguration = {
    mode: "text/javascript",
};

// 添加复制状态和代码是否修改的标记
const hasCopied = ref(false);
const isCodeModified = ref(false);

onUnmounted(() => {
    cmRef.value?.destroy();
});

const output = ref();
const outputList = ref<any[]>([]);
const run = useThrottleFn(
    () => {
        const iframe = document.createElement("iframe");
        iframe.srcdoc = "<!DOCTYPE html>";
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
                        old.call(target, ...arguments);
                        // console.log(...arguments)
                    };
                },
            });
            // @ts-ignore
            contentWindow.onerror = (message, source, lineno, colno, error) => {
                outputList.value.push("错误:" + message);
                return true;
            };
            const importmap = contentDocument.createElement("script");
            importmap.type = "importmap";
            importmap.innerText = importmapRef.value;
            contentDocument.body.appendChild(importmap);
            const js = contentDocument.createElement("script");
            js.setAttribute("async", "");
            const code = `${text.value}`.toString();
            // 需要用到new Function时可以替换到代码中的特殊字符导致异常
            // .replaceAll("\n", "\\n")
            // .replaceAll("`", "\\`")
            // .replaceAll(/\$/g, "\\$");
            js.type = "module";
            const url = URL.createObjectURL(
                new Blob([code], {
                    type: "application/javascript",
                })
            );
            // try{(async()=>{
            //     await new Function(\`${code}\`)();
            // })().catch(e=>console.log(e))}catch(e){console.log(e);}
            js.src = url;
            js.onload = () => {
                URL.revokeObjectURL(url);
                iframe.remove();
            };
            js.onerror = (e) => {
                outputList.value.push(e.target.src + "异常");
                iframe.remove();
            };
            contentDocument.body.appendChild(js);
        };
        output.value?.appendChild(iframe);
    },
    150,
    true
);

const oldText = atou(location.hash.slice(1));
let kk: any = {};
if (oldText) {
    kk = JSON.parse(oldText);
}
const text = ref(kk.code ?? "");
const importmapRef = ref(
    kk.importmap ??
        `{
    "imports": {

    }
}`
);

const curMode = ref("editor"); // importmap
const curText = computed({
    set(value) {
        if (curMode.value === "editor") {
            text.value = value;
        }
        if (curMode.value === "importmap") {
            importmapRef.value = value;
        }
    },
    get() {
        return curMode.value === "editor" ? text.value : importmapRef.value;
    },
});

watch(
    () => [text.value, importmapRef.value],
    () => {
        const str = JSON.stringify({
            code: text.value,
            importmap: importmapRef.value,
        });
        history.replaceState({}, "", `?code#` + utoa(str));
        isCodeModified.value = str !== oldText;
        hasCopied.value = false;
        run();
    },
    {
        immediate: true,
    }
);

// 添加复制功能
async function copy() {
    const textToCopy = location.href;

    // 首先尝试使用 Clipboard API
    try {
        await navigator.clipboard.writeText(textToCopy);
        hasCopied.value = true;
        alert("代码已复制到剪贴板！");
        return;
    } catch (err) {
        console.log("Clipboard API 失败，尝试备用方法");
    }

    // 备用方法：使用临时文本区域
    try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;

        // 防止滚动
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand("copy");
            if (successful) {
                hasCopied.value = true;
                alert("代码已复制到剪贴板！");
            } else {
                throw new Error("复制失败");
            }
        } catch (err) {
            console.error("execCommand 复制失败:", err);
            alert("复制失败，请手动复制。");
        }

        document.body.removeChild(textArea);
    } catch (err) {
        console.error("备用复制方法失败:", err);
        alert("复制失败，请手动复制。");
    }
}

function reset() {
    text.value = kk.code ?? "";
    importmapRef.value =
        kk.importmap ??
        `{
    "imports": {

    }
}`;
    isCodeModified.value = false;
    hasCopied.value = false;
    run();
}

// 添加页面离开提示
onMounted(() => {
    reset();
    window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
});

function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (isCodeModified.value && !hasCopied.value) {
        const message = "您修改的代码尚未复制，确定要离开吗？";
        e.returnValue = message;
        return message;
    }
}

// 添加拖拽相关的状态
const leftWidth = ref(50); // 默认左侧宽度50%
let isResizing = false;

// 开始拖拽
function startResize(e: MouseEvent) {
    isResizing = true;
    const startX = e.clientX;
    const startWidth = leftWidth.value;

    // 添加禁止选择类
    document.body.classList.add("resizing");

    // 添加鼠标移动和松开事件监听
    function onMouseMove(e: MouseEvent) {
        if (!isResizing) return;

        const delta = e.clientX - startX;
        const containerWidth =
            document.querySelector(".wrapper")?.clientWidth || 0;
        const newWidth = startWidth + (delta / containerWidth) * 100;

        // 限制宽度在20%到80%之间
        leftWidth.value = Math.min(Math.max(newWidth, 20), 80);
    }

    function onMouseUp() {
        isResizing = false;
        // 移除禁止选择类
        document.body.classList.remove("resizing");
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

// 在组件卸载时确保清理事件监听
onUnmounted(() => {
    document.removeEventListener("mousemove", () => {});
    document.removeEventListener("mouseup", () => {});
});
</script>

<style lang="scss" scoped>
.wrapper {
    flex: 1;
    height: 0;
    display: flex;
    overflow: hidden;
    background: #f5f5f5;
    gap: 0; // 移除原有的gap，因为现在我们使用resizer
    padding: 16px;

    .left {
        height: 100%;
        transition: width 0.05s ease;
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

    .mode-switcher {
        display: flex;
        gap: 1px;
        background: #f0f0f0;
        padding: 4px;
        border-radius: 6px;
        margin-bottom: 12px;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .mode-button {
        flex: 1;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
        color: #666;
        position: relative;
        overflow: hidden;

        &:hover {
            color: #333;
            background: rgba(0, 0, 0, 0.05);
        }

        &.active {
            background: white;
            color: #2196f3;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 2px;
                background: #2196f3;
                border-radius: 2px;
            }
        }

        &:active {
            transform: scale(0.98);
        }
    }

    .resizer {
        width: 6px;
        margin: 0 8px;
        background: transparent;
        position: relative;
        cursor: col-resize;
        transition: background-color 0.2s;

        &:hover,
        &:active {
            background: #2196f3;
        }

        &::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 2px;
            height: 40px;
            background: #ccc;
            border-radius: 1px;
            transition: background-color 0.2s;
        }

        &:hover::after,
        &:active::after {
            background: #fff;
        }
    }

    .right {
        height: 100%;
        transition: width 0.05s ease;
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

            &.copied {
                background: #4caf50;
                color: white;
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

// 拖拽时禁用文本选择
:global(.resizing) {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    cursor: col-resize !important;

    * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
    }
}
</style>
