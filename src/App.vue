<script>
import BrowserDetector from './components/BrowserDetector.vue'

export default {
  name: 'App',
  components: {
    BrowserDetector,
  },
}
</script>

<template>
  <header class="header">
    <h1>Te Veo 👁</h1>
  </header>
  <div id="app">
    <BrowserDetector />
  </div>
</template>

<style scoped>
.header {
  text-align: center;
}
</style>
