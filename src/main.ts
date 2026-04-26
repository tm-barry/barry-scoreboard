import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import './style.css';
import Icon from './components/icons/Icon.vue';
import IconButton from './components/ui/IconButton.vue';
import App from './App.vue';

createApp(App)
  .use(createPinia())
  .use(router)
  .component('Icon', Icon)
  .component('IconButton', IconButton)
  .mount('#app');
