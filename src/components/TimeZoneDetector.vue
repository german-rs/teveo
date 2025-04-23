<template>
  <div class="timezone-detector">
    <h2>Información de Zona Horaria</h2>
    <div class="timezone-info">
      <p>
        Zona Horaria: <strong>{{ timezone }}</strong>
      </p>
      <p>
        Offset UTC: <strong>{{ utcOffset }}</strong>
      </p>
      <p>
        Hora Local: <strong>{{ localTime }}</strong>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeZoneDetector',
  data() {
    return {
      timezone: '',
      utcOffset: '',
      localTime: '',
      timer: null,
    }
  },
  mounted() {
    this.detectTimeZone()
    // Actualizar la hora cada segundo
    this.timer = setInterval(this.updateLocalTime, 1000)
  },
  beforeUnmount() {
    // Limpiar el intervalo cuando el componente se desmonte
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    detectTimeZone() {
      try {
        // Obtener el nombre de la zona horaria
        this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

        // Calcular el offset UTC
        const offset = new Date().getTimezoneOffset()
        const hours = Math.abs(Math.floor(offset / 60))
        const minutes = Math.abs(offset % 60)
        const sign = offset < 0 ? '+' : '-'

        this.utcOffset = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

        // Inicializar la hora local
        this.updateLocalTime()
      } catch (error) {
        this.timezone = 'No detectado'
        this.utcOffset = 'No detectado'
      }
    },
    updateLocalTime() {
      const now = new Date()
      this.localTime = now.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    },
  },
}
</script>

<style scoped>
.timezone-detector {
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

.timezone-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

p {
  color: #34495e;
  margin: 5px 0;
}

strong {
  color: #42b983;
  font-weight: 600;
  margin-left: 5px;
}
</style>
