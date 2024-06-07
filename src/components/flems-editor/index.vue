<script setup lang="ts">
import {
    onMounted,
    ref,
    unref,
    watch,
    toRaw,
    watchEffect,
    reactive,
    computed,
} from 'vue'
import Flems from '@noderun/flems/dist/flems.js'
import { useVModel } from '@vueuse/core'
import { utoa, atou } from '@/utils'

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
])

// {
//         name: 'mithril',
//         type: 'script',
//         url: 'https://unpkg.com/mithril'
//     }
const links = ref<any[]>([])

if (location.hash) {
    try {
        const data = JSON.parse(atou(location.hash.slice(1)))
        if (Array.isArray(data)) {
            filelist.value = data
        } else {
            filelist.value = data.filelist ?? []
            links.value = data.links ?? []
        }
    } catch (e) {
        console.error(e)
    }
}

watch(
    [() => filelist.value, () => links.value],
    () => {
        const raw = {
            filelist: toRaw(unref(filelist)),
            links: toRaw(unref(links)),
        }
        history.replaceState({}, '', '#' + utoa(JSON.stringify(raw)))
    },
    {
        deep: true,
    }
)

let isInIframe = ref(false)
if (window.frames.length != parent.frames.length) {
    isInIframe.value = true
}

const flemsEditor = ref<HTMLElement>()
let flems: any
onMounted(() => {
    if (flemsEditor.value) {
        flems = Flems(
            flemsEditor.value,
            {
                compilerURL: "/compilers",
                files: JSON.parse(JSON.stringify(unref(filelist))),
                links: JSON.parse(JSON.stringify(unref(links))),
                shareButton: false,
                middle: isInIframe.value ? 0 : 50
            },
            '/runtime.html'
        )
        flems.onchange((model) => {
            filelist.value = model.files.map((v) => {
                return {
                    name: v.name,
                    content: v.content,
                }
            })
        })
    }
})

const tempFileName = ref()
function handleAddFile() {
    let index = filelist.value.findIndex(
        (item) => item.name === tempFileName.value
    )
    if (index === -1) {
        filelist.value.push({
            name: tempFileName.value,
            content: '',
        })
        tempFileName.value = ''
        flems.set({
            files: JSON.parse(JSON.stringify(unref(filelist))),
            links: JSON.parse(JSON.stringify(unref(links))),
        })
    }
}
function handleDeleteFile(item: any, index: any) {
    const isSuccess = confirm('是否删除：' + item.name)
    isSuccess && filelist.value.splice(index, 1)
    isSuccess &&
        flems.set({
            files: JSON.parse(JSON.stringify(unref(filelist))),
            links: JSON.parse(JSON.stringify(unref(links))),
        })
}

const state = reactive({
    name: undefined,
    type: undefined,
    url: undefined,
})
function handleDeleteLink(item: any, index: any) {
    const isSuccess = confirm('是否删除：' + item.name)
    isSuccess && links.value.splice(index, 1)
    isSuccess &&
        flems.set({
            files: JSON.parse(JSON.stringify(unref(filelist))),
            links: JSON.parse(JSON.stringify(unref(links))),
        })
}
function handleAddLink() {
    if (state.url && typeof state.url === "string" && !(state.url as string).startsWith('http://') && !(state.url as string).startsWith('https://')) {
        alert("Link url's should start with http:// or https://")
        return
    }
    links.value.push(JSON.parse(JSON.stringify(toRaw(state))))
    state.name = undefined
    state.type = undefined
    state.url = undefined
    flems.set({
        files: JSON.parse(JSON.stringify(unref(filelist))),
        links: JSON.parse(JSON.stringify(unref(links))),
    })
}
function addReset() {
    links.value.push({
        name: 'reset.css',
        type: 'style',
        url: 'https://meyerweb.com/eric/tools/css/reset/reset200802.css',
    })
    flems.set({
        files: JSON.parse(JSON.stringify(unref(filelist))),
        links: JSON.parse(JSON.stringify(unref(links))),
    })
}
</script>

<template>
    <div style="display: flex; flex-direction: column">
        <div class="hide-iframe" style="display: flex">
            <div style="flex: 1; display: inline-block"></div>
            <div style="flex: 1; display: inline-block" @click="addReset">
                增加reset.css
            </div>
        </div>
        <div class="hide-iframe" style="display: flex">
            <div style="flex: 1; display: inline-block">
                文件-<button @click="handleAddFile">增加文件</button><input style="border: 1px solid #000" v-model="tempFileName"
                    placeholder="请输入文件名" type="text" />
            </div>
            <div style="flex: 1; display: inline-block">
                额外链接-<button @click="handleAddLink">增加文件</button><input style="border: 1px solid #000" v-model="state.name"
                    placeholder="请输入文件名" type="text" />-<select v-model="state.type">
                    <option value="script" name="aa">script</option>
                    <option value="style" name="aa">style</option>
                </select><input style="border: 1px solid #000" v-model="state.url" placeholder="请输入地址" type="text" />
            </div>
        </div>
        <div class="hide-iframe" style="display: flex">
            <div style="
                    flex: 1;
                    display: inline-block;
                    max-height: 80px;
                    overflow: auto;
                ">
                <div v-for="(item, index) in filelist" style="display: inline-block; margin: 0 10px"
                    @dblclick="handleDeleteFile(item, index)">
                    {{ item.name }}
                </div>
            </div>
            <div style="
                    flex: 1;
                    display: inline-block;
                    max-height: 80px;
                    overflow: auto;
                ">
                <div v-for="(item, index) in links" @dblclick="handleDeleteLink(item, index)">
                    {{ item.name }}-{{ item.type }}-{{ item.url }}
                </div>
            </div>
        </div>
        <div style="flex: 1; height: 0" ref="flemsEditor"></div>
    </div>
</template>
