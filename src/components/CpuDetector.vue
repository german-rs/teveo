<template>
  <div class="cpu-detector">
    <h2>Información de la CPU</h2>
    <div class="cpu-info">
      <p class="info-item">
        <span class="label">Núcleos lógicos:</span>
        <strong>{{ cores }}</strong>
      </p>

      <p class="info-item" v-if="architecture">
        <span class="label">Arquitectura:</span>
        <strong>{{ architecture }}</strong>
      </p>

      <p class="info-item" v-if="bitness">
        <span class="label">Bits:</span>
        <strong>{{ bitness }}</strong>
      </p>

      <div class="performance-info" v-if="isPerformanceSupported">
        <h3>Rendimiento</h3>
        <div class="performance-meter">
          <div class="performance-bar" :style="{ width: performancePercent + '%' }">
            {{ performancePercent }}%
          </div>
        </div>
      </div>

      <p v-if="!isHardwareInfoAvailable" class="warning">
        La información detallada del hardware no está disponible en este navegador
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CpuDetector',
  data() {
    return {
      cores: 0,
      architecture: '',
      bitness: '',
      performanceScore: 0,
      isPerformanceSupported: false,
      isHardwareInfoAvailable: true,
    }
  },
  computed: {
    performancePercent() {
      return Math.round(this.performanceScore * 100)
    },
  },
  mounted() {
    this.detectCPUInfo()
    this.measurePerformance()
  },
  methods: {
    async detectCPUInfo() {
      try {
        // Obtener número de núcleos lógicos
        this.cores = navigator.hardwareConcurrency || 'No disponible'

        // Intentar obtener información adicional si está disponible
        if ('userAgentData' in navigator) {
          const uaData = await navigator.userAgentData.getHighEntropyValues([
            'architecture',
            'bitness',
            'platform',
          ])

          this.architecture = uaData.architecture || 'No disponible'
          this.bitness = uaData.bitness ? `${uaData.bitness} bits` : 'No disponible'
        } else {
          this.isHardwareInfoAvailable = false
        }
      } catch (error) {
        console.error('Error al detectar información de CPU:', error)
        this.isHardwareInfoAvailable = false
      }
    },
    async measurePerformance() {
      try {
        const start = performance.now()

        // Realizar una operación intensiva para medir rendimiento
        await this.performBenchmark()

        const end = performance.now()
        const duration = end - start

        // Normalizar el score (valor más bajo es mejor)
        this.performanceScore = Math.min(1, 1000 / duration)
        this.isPerformanceSupported = true
      } catch (error) {
        console.error('Error al medir rendimiento:', error)
        this.isPerformanceSupported = false
      }
    },
    performBenchmark() {
      return new Promise((resolve) => {
        let result = 0
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i)
        }
        resolve(result)
      })
    },
  },
}
</script>

<style scoped>
.cpu-detector {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

h3 {
  color: #2c3e50;
  margin: 15px 0;
  font-size: 1.1em;
}

.cpu-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.label {
  color: #666;
  font-weight: 500;
}

strong {
  color: #42b983;
  font-weight: 600;
}

.warning {
  color: #dc3545;
  text-align: center;
  font-style: italic;
  margin-top: 10px;
}

.performance-info {
  margin-top: 20px;
}

.performance-meter {
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  height: 25px;
}

.performance-bar {
  background-color: #42b983;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9em;
  transition: width 0.5s ease-in-out;
  min-width: 30px;
}
</style>
