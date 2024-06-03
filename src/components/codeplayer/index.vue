<template>
    <div style="height: 100%; display: flex; flex-direction: column">
        <div>
            <select v-model="appType">
                <option value="vue">vue</option>
                <option value="vue2">vue2</option>
                <option value="vue3">vue3</option>
                <option value="react">react</option>
                <option value="html">html</option>
                <option value="javascript">javascript</option>
                <option value="js">js</option>
                <option value="typescript">typescript</option>
                <option value="ts">ts</option>
            </select>
        </div>
        <CodePlayer
            :key="appType"
            :options="options"
            class="codeplayer-container"
        ></CodePlayer>
    </div>
</template>

<script setup lang="ts">
import CodePlayer, { CodePlayerOptions } from "codeplayer";
import { computed, ref, watch } from "vue";

const query = new URLSearchParams(location.search);

const appType = ref(query.get("m") ?? "react");
const options = computed(() => {
    return {
        appType: appType.value,
    } as CodePlayerOptions;
});
watch(appType, () => {
    if (appType.value) {
        location.href = "/?player&m="+appType.value;
    }
});
</script>

<style scoped>
.codeplayer-container {
    flex: 1;
    height: 0;
}
</style>
