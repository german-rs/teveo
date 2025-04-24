<template>
  <div class="geo-location">
    <h2>Información de Geolocalización</h2>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Obteniendo ubicación...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="getLocation" class="retry-button">Reintentar</button>
    </div>

    <div v-else-if="location" class="location-info">
      <div class="coordinates">
        <div class="info-card">
          <span class="label">Latitud</span>
          <strong>{{ formatCoordinate(location.latitude, 'lat') }}</strong>
        </div>
        <div class="info-card">
          <span class="label">Longitud</span>
          <strong>{{ formatCoordinate(location.longitude, 'lon') }}</strong>
        </div>
      </div>

      <div class="additional-info">
        <div v-if="location.accuracy" class="info-card">
          <span class="label">Precisión</span>
          <strong>{{ Math.round(location.accuracy) }} metros</strong>
        </div>

        <div v-if="location.altitude" class="info-card">
          <span class="label">Altitud</span>
          <strong>{{ Math.round(location.altitude) }} metros</strong>
        </div>

        <div v-if="location.speed" class="info-card">
          <span class="label">Velocidad</span>
          <strong>{{ Math.round(location.speed) }} m/s</strong>
        </div>
      </div>

      <div class="timestamp">
        <span class="label">Última actualización:</span>
        <strong>{{ formatTimestamp(location.timestamp) }}</strong>
      </div>

      <div class="actions">
        <button @click="getLocation" class="update-button">Actualizar ubicación</button>
        <button v-if="watching" @click="stopWatching" class="stop-button">
          Detener seguimiento
        </button>
        <button v-else @click="startWatching" class="start-button">Iniciar seguimiento</button>
      </div>

      <div v-if="hasMapLink" class="map-link">
        <a :href="mapUrl" target="_blank" rel="noopener noreferrer"> Ver en Google Maps </a>
      </div>
    </div>

    <div v-else class="no-data">
      <p>No hay datos de ubicación disponibles</p>
      <button @click="getLocation" class="retry-button">Obtener ubicación</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GeoLocation',
  data() {
    return {
      location: null,
      error: null,
      loading: false,
      watching: false,
      watchId: null,
      options: {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    }
  },
  computed: {
    hasMapLink() {
      return this.location && this.location.latitude && this.location.longitude
    },
    mapUrl() {
      if (!this.hasMapLink) return ''
      return `https://www.google.com/maps?q=${this.location.latitude},${this.location.longitude}`
    },
  },
  methods: {
    formatCoordinate(value, type) {
      if (!value) return 'N/A'
      const direction = type === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
      return `${Math.abs(value).toFixed(6)}° ${direction}`
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp).toLocaleString()
    },
    async getLocation() {
      if (!('geolocation' in navigator)) {
        this.error = 'Tu navegador no soporta geolocalización'
        return
      }

      this.loading = true
      this.error = null

      try {
        const position = await this.getCurrentPosition()
        this.updateLocation(position)
      } catch (error) {
        this.handleError(error)
      } finally {
        this.loading = false
      }
    },
    getCurrentPosition() {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, this.options)
      })
    },
    updateLocation(position) {
      this.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      }
    },
    handleError(error) {
      switch (error.code) {
        case 1:
          this.error = 'Acceso a la ubicación denegado'
          break
        case 2:
          this.error = 'No se pudo determinar la ubicación'
          break
        case 3:
          this.error = 'Tiempo de espera agotado'
          break
        default:
          this.error = 'Error al obtener la ubicación'
      }
    },
    startWatching() {
      if (this.watching) return

      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.updateLocation(position),
        (error) => this.handleError(error),
        this.options,
      )

      this.watching = true
    },
    stopWatching() {
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId)
        this.watchId = null
        this.watching = false
      }
    },
  },
  mounted() {
    this.getLocation()
  },
  beforeUnmount() {
    this.stopWatching()
  },
}
</script>

<style scoped>
.geo-location {
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

.loading {
  text-align: center;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  color: #dc3545;
  text-align: center;
  padding: 20px;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.coordinates,
.additional-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  color: #666;
  font-size: 0.9em;
}

strong {
  color: #42b983;
  font-size: 1.1em;
}

.timestamp {
  text-align: center;
  color: #666;
  font-size: 0.9em;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.update-button {
  background-color: #42b983;
  color: white;
}

.start-button {
  background-color: #17a2b8;
  color: white;
}

.stop-button {
  background-color: #dc3545;
  color: white;
}

.retry-button {
  background-color: #6c757d;
  color: white;
}

button:hover {
  opacity: 0.9;
}

.map-link {
  text-align: center;
  margin-top: 15px;
}

.map-link a {
  color: #007bff;
  text-decoration: none;
}

.map-link a:hover {
  text-decoration: underline;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

@media (max-width: 600px) {
  .coordinates,
  .additional-info {
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
