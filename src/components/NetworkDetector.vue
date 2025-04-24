<template>
  <div class="network-detector">
    <h2>Información de Red</h2>

    <div class="network-status">
      <div class="connection-indicator" :class="connectionStatus">
        <div class="status-icon"></div>
        <span>{{ connectionStatusText }}</span>
      </div>
    </div>

    <div class="network-info" v-if="isOnline">
      <div class="info-grid">
        <div class="info-card">
          <span class="label">Tipo de Conexión</span>
          <strong :class="{ warning: !isConnectionFast }">
            {{ connectionType }}
          </strong>
          <div class="type-icon" :class="connectionTypeClass"></div>
        </div>

        <div class="info-card">
          <span class="label">Velocidad</span>
          <strong>{{ effectiveType }}</strong>
          <small v-if="downlink">{{ downlink }} Mbps</small>
        </div>

        <div class="info-card">
          <span class="label">RTT</span>
          <strong>{{ rtt }}ms</strong>
          <div class="latency-indicator" :class="latencyLevel"></div>
        </div>

        <div class="info-card">
          <span class="label">Modo de Datos</span>
          <strong>{{ saveData ? 'Ahorro activo' : 'Normal' }}</strong>
        </div>
      </div>

      <div class="speed-test" v-if="showSpeedTest">
        <h3>Prueba de Velocidad</h3>
        <div class="speed-metrics">
          <div class="metric">
            <span class="label">Descarga</span>
            <strong>{{ downloadSpeed }} Mbps</strong>
            <div class="speed-bar">
              <div
                class="speed-indicator"
                :style="{ width: `${Math.min(100, downloadSpeed)}%` }"
                :class="getSpeedClass(downloadSpeed)"
              ></div>
            </div>
          </div>
          <div class="metric">
            <span class="label">Latencia</span>
            <strong>{{ currentLatency }}ms</strong>
            <div class="speed-bar">
              <div
                class="speed-indicator"
                :style="{ width: `${Math.min(100, 100 - currentLatency / 2)}%` }"
                :class="getLatencyClass(currentLatency)"
              ></div>
            </div>
          </div>
        </div>
        <button @click="runSpeedTest" :disabled="isTestingSpeed" class="speed-test-button">
          {{ isTestingSpeed ? 'Probando...' : 'Realizar prueba de velocidad' }}
        </button>
      </div>

      <div class="connection-quality">
        <h3>Calidad de Conexión</h3>
        <div class="quality-indicator">
          <div class="quality-bar" :class="connectionQualityClass">
            {{ connectionQualityText }}
          </div>
        </div>
        <p class="quality-description">{{ connectionQualityDescription }}</p>
      </div>

      <div class="network-stats">
        <div class="stat-grid">
          <div class="stat-card">
            <span class="label">Paquetes Enviados</span>
            <strong>{{ packetsSent }}</strong>
          </div>
          <div class="stat-card">
            <span class="label">Paquetes Perdidos</span>
            <strong>{{ packetsLost }}</strong>
          </div>
          <div class="stat-card">
            <span class="label">Tiempo Online</span>
            <strong>{{ uptime }}</strong>
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="checkConnection" class="refresh-button">Actualizar estado</button>
        <button @click="toggleSpeedTest" class="toggle-button">
          {{ showSpeedTest ? 'Ocultar prueba' : 'Mostrar prueba' }}
        </button>
        <button
          v-if="canRequestWakelock"
          @click="toggleWakelock"
          :class="{ active: isWakelockActive }"
          class="wakelock-button"
        >
          Mantener activo
        </button>
      </div>
    </div>

    <div v-else class="offline-message">
      <div class="offline-icon"></div>
      <p>Sin conexión a Internet</p>
      <button @click="checkConnection" class="retry-button">Reintentar conexión</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NetworkDetector',
  data() {
    return {
      isOnline: navigator.onLine,
      connectionInfo: null,
      downlink: 0,
      rtt: 0,
      effectiveType: '',
      saveData: false,
      connectionType: 'Desconocido',
      downloadSpeed: 0,
      currentLatency: 0,
      isTestingSpeed: false,
      showSpeedTest: false,
      packetsSent: 0,
      packetsLost: 0,
      connectionStartTime: Date.now(),
      wakelockSentinel: null,
      canRequestWakelock: 'wakeLock' in navigator,
      isWakelockActive: false,
      pingInterval: null,
      lastPingTime: 0,
    }
  },
  computed: {
    connectionStatus() {
      return {
        connected: this.isOnline,
        disconnected: !this.isOnline,
      }
    },
    connectionStatusText() {
      return this.isOnline ? 'Conectado' : 'Desconectado'
    },
    connectionTypeClass() {
      const type = this.connectionType.toLowerCase()
      return {
        wifi: type.includes('wifi'),
        cellular: type.includes('cellular'),
        ethernet: type.includes('ethernet'),
        unknown: type === 'desconocido',
      }
    },
    isConnectionFast() {
      return this.downlink >= 1 && this.rtt <= 100
    },
    latencyLevel() {
      if (this.rtt <= 50) return 'excellent'
      if (this.rtt <= 100) return 'good'
      if (this.rtt <= 200) return 'moderate'
      return 'poor'
    },
    connectionQualityClass() {
      if (!this.isOnline) return 'poor'
      if (this.isConnectionFast && this.latencyLevel === 'excellent') return 'excellent'
      if (this.isConnectionFast && this.latencyLevel === 'good') return 'good'
      return 'moderate'
    },
    connectionQualityText() {
      switch (this.connectionQualityClass) {
        case 'excellent':
          return 'Excelente'
        case 'good':
          return 'Buena'
        case 'moderate':
          return 'Moderada'
        default:
          return 'Deficiente'
      }
    },
    connectionQualityDescription() {
      switch (this.connectionQualityClass) {
        case 'excellent':
          return 'La conexión es óptima para cualquier tipo de actividad en línea'
        case 'good':
          return 'La conexión es adecuada para la mayoría de las actividades'
        case 'moderate':
          return 'La conexión puede presentar algunas limitaciones'
        default:
          return 'La conexión presenta problemas significativos'
      }
    },
    uptime() {
      const diff = Date.now() - this.connectionStartTime
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      return `${hours}h ${minutes}m`
    },
  },
  methods: {
    async checkConnection() {
      this.updateConnectionInfo()
      await this.measureLatency()
    },
    updateConnectionInfo() {
      // Verificar información de la conexión usando Network Information API
      if ('connection' in navigator) {
        const conn = navigator.connection
        this.connectionInfo = conn
        this.downlink = conn.downlink
        this.rtt = conn.rtt
        this.effectiveType = conn.effectiveType
        this.saveData = conn.saveData
        this.connectionType = conn.type.charAt(0).toUpperCase() + conn.type.slice(1)
      } else {
        // Fallback para navegadores que no soportan Network Information API
        this.connectionType = this.isOnline ? 'Disponible' : 'No disponible'
        this.effectiveType = 'No disponible'
      }
    },
    async measureLatency() {
      const start = performance.now()
      try {
        await fetch('https://www.google.com/favicon.ico', {
          mode: 'no-cors',
          cache: 'no-cache',
        })
        const end = performance.now()
        this.currentLatency = Math.round(end - start)
        this.packetsSent++
      } catch {
        this.packetsLost++
      }
    },
    async runSpeedTest() {
      this.isTestingSpeed = true
      try {
        const testFile = 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js'
        const start = performance.now()
        const response = await fetch(testFile)
        const blob = await response.blob()
        const end = performance.now()

        const duration = (end - start) / 1000 // segundos
        const fileSize = blob.size / (1024 * 1024) // MB
        this.downloadSpeed = Math.round((fileSize / duration) * 100) / 100
      } catch (error) {
        console.error('Error en prueba de velocidad:', error)
        this.downloadSpeed = 0
      } finally {
        this.isTestingSpeed = false
      }
    },
    getSpeedClass(speed) {
      if (speed >= 10) return 'excellent'
      if (speed >= 5) return 'good'
      if (speed >= 2) return 'moderate'
      return 'poor'
    },
    getLatencyClass(latency) {
      if (latency <= 50) return 'excellent'
      if (latency <= 100) return 'good'
      if (latency <= 200) return 'moderate'
      return 'poor'
    },
    toggleSpeedTest() {
      this.showSpeedTest = !this.showSpeedTest
    },
    async toggleWakelock() {
      try {
        if (this.wakelockSentinel) {
          await this.wakelockSentinel.release()
          this.wakelockSentinel = null
          this.isWakelockActive = false
        } else {
          this.wakelockSentinel = await navigator.wakeLock.request('screen')
          this.isWakelockActive = true
        }
      } catch (err) {
        console.error('Error al gestionar wakelock:', err)
      }
    },
    startPingInterval() {
      this.pingInterval = setInterval(() => {
        if (this.isOnline) {
          this.measureLatency()
        }
      }, 30000) // Ping cada 30 segundos
    },
    handleOnline() {
      this.isOnline = true
      this.connectionStartTime = Date.now()
      this.checkConnection()
    },
    handleOffline() {
      this.isOnline = false
    },
  },
  mounted() {
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', this.updateConnectionInfo)
    }

    this.checkConnection()
    this.startPingInterval()
  },
  beforeUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)

    if ('connection' in navigator) {
      navigator.connection.removeEventListener('change', this.updateConnectionInfo)
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }

    if (this.wakelockSentinel) {
      this.wakelockSentinel.release()
    }
  },
}
</script>

<style scoped>
.network-detector {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  font-family: Arial, sans-serif;
  max-width: 800px;
}

h2,
h3 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
}

.network-status {
  text-align: center;
  margin-bottom: 20px;
}

.connection-indicator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.connected .status-icon {
  background-color: #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
}

.disconnected .status-icon {
  background-color: #dc3545;
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.5);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.info-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
}

.type-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background-size: contain;
  background-repeat: no-repeat;
}

.type-icon.wifi {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%2342b983" d="M12 21l1.45-1.45L12 18.1l-1.45 1.45L12 21zm2.35-3.36l2.3-2.3-2.3-2.3-1.45 1.45 0.85 0.85-0.85 0.85 1.45 1.45zm-4.7 0l1.45-1.45-0.85-0.85 0.85-0.85-1.45-1.45-2.3 2.3 2.3 2.3z"/></svg>');
}

.type-icon.cellular {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%2342b983" d="M2 22h20V2L2 22zm18-2h-3V9.83l3-3V20z"/></svg>');
}

.label {
  color: #666;
  font-size: 0.9em;
}

strong {
  color: #42b983;
  font-size: 1.1em;
}

strong.warning {
  color: #ffc107;
}

small {
  color: #999;
  font-size: 0.8em;
}

.latency-indicator {
  height: 4px;
  border-radius: 2px;
  margin-top: 5px;
}

.latency-indicator.excellent {
  background-color: #28a745;
}

.latency-indicator.good {
  background-color: #17a2b8;
}

.latency-indicator.moderate {
  background-color: #ffc107;
}

.latency-indicator.poor {
  background-color: #dc3545;
}

.speed-test {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.speed-metrics {
  display: grid;
  gap: 15px;
  margin: 15px 0;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.speed-bar {
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.speed-indicator {
  height: 100%;
  transition: width 0.3s ease;
}

.speed-indicator.excellent {
  background-color: #28a745;
}

.speed-indicator.good {
  background-color: #17a2b8;
}

.speed-indicator.moderate {
  background-color: #ffc107;
}

.speed-indicator.poor {
  background-color: #dc3545;
}

.connection-quality {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.quality-indicator {
  margin: 15px 0;
}

.quality-bar {
  padding: 10px;
  text-align: center;
  color: white;
  border-radius: 4px;
}

.quality-bar.excellent {
  background-color: #28a745;
}

.quality-bar.good {
  background-color: #17a2b8;
}

.quality-bar.moderate {
  background-color: #ffc107;
  color: #000;
}

.quality-bar.poor {
  background-color: #dc3545;
}

.quality-description {
  text-align: center;
  color: #666;
  margin: 10px 0;
}

.network-stats {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-card {
  text-align: center;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 120px;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.refresh-button {
  background-color: #42b983;
  color: white;
}

.speed-test-button {
  background-color: #17a2b8;
  color: white;
  width: 100%;
}

.toggle-button {
  background-color: #6c757d;
  color: white;
}

.wakelock-button {
  background-color: #6c757d;
  color: white;
}

.wakelock-button.active {
  background-color: #28a745;
}

.offline-message {
  text-align: center;
  padding: 40px 20px;
}

.offline-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background-color: #dc3545;
  mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"/></svg>');
  mask-size: cover;
  -webkit-mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"/></svg>');
  -webkit-mask-size: cover;
}

.retry-button {
  background-color: #6c757d;
  color: white;
}

@media (max-width: 600px) {
  .network-detector {
    margin: 10px;
    padding: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}
</style>
