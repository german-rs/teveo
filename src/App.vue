<script>
import BrowserDetector from './components/BrowserDetector.vue'
import OsDetector from './components/OsDetector.vue'
import TimeZoneDetector from './components/TimeZoneDetector.vue'

export default {
  name: 'App',
  components: {
    BrowserDetector,
    OsDetector,
    TimeZoneDetector,
  },
}
</script>

<template>
  <header class="header">
    <h1>Te Veo 👁</h1>
  </header>
  <div id="app">
    <BrowserDetector />
    <OsDetector />
    <TimeZoneDetector />
  </div>
</template>

<style scoped>
.header {
  text-align: center;
  font-family: Arial, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 15px;
  padding: 0.5em;
}
</style>
