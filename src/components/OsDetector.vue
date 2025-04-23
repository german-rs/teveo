<template>
  <div class="os-detector">
    <h2>Información del Sistema Operativo</h2>
    <p>
      Tu sistema operativo es: <strong>{{ osInfo }}</strong>
    </p>
    <p class="version" v-if="osVersion">
      Versión: <strong>{{ osVersion }}</strong>
    </p>
  </div>
</template>

<script>
export default {
  name: 'OsDetector',
  data() {
    return {
      osInfo: '',
      osVersion: '',
    }
  },
  mounted() {
    this.detectOperatingSystem()
  },
  methods: {
    async detectOperatingSystem() {
      try {
        // Intentar usar primero el nuevo API userAgentData
        if (navigator.userAgentData) {
          const uaData = navigator.userAgentData
          if (uaData.platform) {
            // Obtener información más detallada
            const highEntropyData = await navigator.userAgentData.getHighEntropyValues([
              'platformVersion',
            ])

            switch (uaData.platform.toLowerCase()) {
              case 'windows':
                this.osInfo = 'Windows'
                if (highEntropyData.platformVersion) {
                  this.osVersion = highEntropyData.platformVersion
                }
                break
              case 'macos':
                this.osInfo = 'macOS'
                if (highEntropyData.platformVersion) {
                  this.osVersion = highEntropyData.platformVersion
                }
                break
              case 'linux':
                this.osInfo = 'Linux'
                break
              case 'android':
                this.osInfo = 'Android'
                if (highEntropyData.platformVersion) {
                  this.osVersion = highEntropyData.platformVersion
                }
                break
              case 'ios':
                this.osInfo = 'iOS'
                if (highEntropyData.platformVersion) {
                  this.osVersion = highEntropyData.platformVersion
                }
                break
              default:
                this.fallbackDetection()
            }
            return
          }
        }

        this.fallbackDetection()
      } catch (error) {
        this.fallbackDetection()
      }
    },
    fallbackDetection() {
      const userAgent = navigator.userAgent

      if (userAgent.indexOf('Win') !== -1) {
        this.detectWindowsVersion(userAgent)
      } else if (userAgent.indexOf('Mac') !== -1) {
        this.osInfo = 'macOS'
        const macOSVersion = userAgent.match(/Mac OS X ([0-9_]+)/i)
        if (macOSVersion) {
          this.osVersion = macOSVersion[1].replace(/_/g, '.')
        }
      } else if (userAgent.indexOf('Linux') !== -1) {
        if (userAgent.indexOf('Android') !== -1) {
          this.osInfo = 'Android'
          const androidVersion = userAgent.match(/Android\s([0-9.]+)/i)
          if (androidVersion) {
            this.osVersion = androidVersion[1]
          }
        } else {
          this.osInfo = 'Linux'
        }
      } else if (/iPhone|iPad|iPod/.test(userAgent)) {
        this.osInfo = 'iOS'
        const iOSVersion = userAgent.match(/OS\s([0-9_]+)/i)
        if (iOSVersion) {
          this.osVersion = iOSVersion[1].replace(/_/g, '.')
        }
      } else {
        this.osInfo = 'Sistema Operativo Desconocido'
      }
    },
    detectWindowsVersion(userAgent) {
      if (userAgent.indexOf('Windows NT 10.0') !== -1) {
        this.osInfo = 'Windows 10/11'
      } else if (userAgent.indexOf('Windows NT 6.3') !== -1) {
        this.osInfo = 'Windows 8.1'
      } else if (userAgent.indexOf('Windows NT 6.2') !== -1) {
        this.osInfo = 'Windows 8'
      } else if (userAgent.indexOf('Windows NT 6.1') !== -1) {
        this.osInfo = 'Windows 7'
      } else {
        this.osInfo = 'Windows'
      }
    },
  },
}
</script>

<style scoped>
.os-detector {
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

p {
  color: #34495e;
  margin: 10px 0;
}

strong {
  color: #42b983;
  font-weight: 600;
}

.version {
  font-size: 0.9em;
  color: #666;
}
</style>
