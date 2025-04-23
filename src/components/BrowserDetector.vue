<template>
  <div class="browser-detector">
    <h2>Información del Navegador</h2>
    <p>
      Estas usando: <strong>{{ browserName }}</strong>
    </p>
  </div>
</template>

<script>
export default {
  name: 'BrowserDetector',
  data() {
    return {
      browserName: '',
    }
  },
  mounted() {
    this.detectBrowser()
  },
  methods: {
    detectBrowser() {
      const userAgent = navigator.userAgent

      if (userAgent.match(/chrome|Chromium|crios/i)) {
        this.browserName = 'Google Chrome'
      } else if (userAgent.match(/firefox|fxios/i)) {
        this.browserName = 'Mozilla Firefox'
      } else if (userAgent.match(/safari/i)) {
        this.browserName = 'Safari'
      } else if (userAgent.match(/opr\//i)) {
        this.browserName = 'Opera'
      } else if (userAgent.match(/edg/i)) {
        this.browserName = 'Microsoft Edge'
      } else {
        this.browserName = 'Navegador desconocido'
      }
    },
  },
}
</script>

<style scoped>
.browser-detector {
  padding: 20px;
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
}
h2 {
  color: #2c3e50;
}
p {
  color: #34495e;
}
strong {
  color: #42b983;
}
</style>
