import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');

// window.ChromeExtensionID = undefined
// window.addEventListener("message", function (event) {
//     if (event.source != window) {
//         return;
//     }
//     if (event.data.type === "getChromeExtensionID") {
//         window.ChromeExtensionID = event.data.id
//     }
// }, false);