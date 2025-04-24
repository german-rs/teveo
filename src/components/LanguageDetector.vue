<template>
  <div class="language-detector">
    <h2>Información de Idioma</h2>

    <div class="language-info">
      <!-- Idioma principal -->
      <div class="info-card primary-language">
        <span class="label">Idioma Principal</span>
        <strong>{{ primaryLanguage.name }}</strong>
        <span class="language-code">{{ primaryLanguage.code }}</span>
      </div>

      <!-- Todos los idiomas -->
      <div class="info-card all-languages">
        <span class="label">Idiomas Preferidos</span>
        <div class="language-list">
          <div
            v-for="(lang, index) in preferredLanguages"
            :key="index"
            class="language-item"
            :class="{ active: index === 0 }"
          >
            <strong>{{ lang.name }}</strong>
            <span class="language-code">{{ lang.code }}</span>
            <span v-if="lang.region" class="region"> ({{ lang.region }}) </span>
          </div>
        </div>
      </div>

      <!-- Configuración del Sistema -->
      <div class="info-card system-info">
        <span class="label">Configuración del Sistema</span>
        <div class="system-details">
          <div class="detail-item">
            <span>Formato de Fecha:</span>
            <strong>{{ dateFormat }}</strong>
          </div>
          <div class="detail-item">
            <span>Formato de Hora:</span>
            <strong>{{ timeFormat }}</strong>
          </div>
          <div class="detail-item">
            <span>Formato Numérico:</span>
            <strong>{{ numberFormat }}</strong>
          </div>
        </div>
      </div>

      <!-- Ejemplos de Formato -->
      <div class="info-card format-examples">
        <span class="label">Ejemplos de Formato Local</span>
        <div class="examples">
          <div class="example-item">
            <span>Fecha:</span>
            <strong>{{ localizedDate }}</strong>
          </div>
          <div class="example-item">
            <span>Hora:</span>
            <strong>{{ localizedTime }}</strong>
          </div>
          <div class="example-item">
            <span>Número:</span>
            <strong>{{ localizedNumber }}</strong>
          </div>
          <div class="example-item">
            <span>Moneda:</span>
            <strong>{{ localizedCurrency }}</strong>
          </div>
        </div>
      </div>

      <!-- Información RTL/LTR -->
      <div class="info-card direction-info">
        <span class="label">Dirección del Texto</span>
        <div class="direction-indicator">
          <span class="direction-icon" :class="textDirection">
            {{ textDirection === 'rtl' ? '←' : '→' }}
          </span>
          <strong>{{ textDirectionName }}</strong>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="refreshLanguageInfo" class="refresh-button">Actualizar información</button>
      <button @click="toggleDetails" class="toggle-button">
        {{ showDetails ? 'Ocultar detalles' : 'Mostrar más detalles' }}
      </button>
    </div>

    <!-- Detalles adicionales -->
    <div v-if="showDetails" class="additional-details">
      <h3>Información Detallada</h3>
      <div class="details-grid">
        <div class="detail-card" v-for="(value, key) in additionalInfo" :key="key">
          <span class="detail-label">{{ key }}</span>
          <strong class="detail-value">{{ value }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LanguageDetector',
  data() {
    return {
      primaryLanguage: {
        code: '',
        name: '',
        region: '',
      },
      preferredLanguages: [],
      showDetails: false,
      additionalInfo: {},
      textDirection: 'ltr',
      dateFormat: '',
      timeFormat: '',
      numberFormat: '',
    }
  },
  computed: {
    textDirectionName() {
      return this.textDirection === 'rtl'
        ? 'De derecha a izquierda (RTL)'
        : 'De izquierda a derecha (LTR)'
    },
    localizedDate() {
      return new Date().toLocaleDateString(this.primaryLanguage.code, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
    localizedTime() {
      return new Date().toLocaleTimeString(this.primaryLanguage.code, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    },
    localizedNumber() {
      return (1234567.89).toLocaleString(this.primaryLanguage.code)
    },
    localizedCurrency() {
      return (1234.56).toLocaleString(this.primaryLanguage.code, {
        style: 'currency',
        currency: this.getCurrencyCode(),
      })
    },
  },
  methods: {
    refreshLanguageInfo() {
      this.detectLanguages()
      this.detectFormats()
      this.detectTextDirection()
      this.updateAdditionalInfo()
    },
    detectLanguages() {
      // Obtener idiomas del navegador
      const languages = navigator.languages || [navigator.language]

      this.preferredLanguages = languages.map((lang) => {
        const [languageCode, regionCode] = lang.split('-')
        return {
          code: lang,
          name: new Intl.DisplayNames([lang], { type: 'language' }).of(languageCode),
          region: regionCode
            ? new Intl.DisplayNames([lang], { type: 'region' }).of(regionCode)
            : '',
        }
      })

      // Establecer idioma principal
      this.primaryLanguage = this.preferredLanguages[0] || {
        code: 'en',
        name: 'English',
        region: '',
      }
    },
    detectFormats() {
      const locale = this.primaryLanguage.code

      // Detectar formato de fecha
      const dateFormatter = new Intl.DateTimeFormat(locale)
      this.dateFormat = dateFormatter.resolvedOptions().locale

      // Detectar formato numérico
      const numberFormatter = new Intl.NumberFormat(locale)
      this.numberFormat = numberFormatter.resolvedOptions().locale

      // Detectar formato de hora
      const timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: 'numeric',
      })
      this.timeFormat = timeFormatter.resolvedOptions().locale
    },
    detectTextDirection() {
      // Detectar dirección del texto basado en el idioma
      const rtlLanguages = ['ar', 'he', 'fa', 'ur']
      const primaryLangCode = this.primaryLanguage.code.split('-')[0]
      this.textDirection = rtlLanguages.includes(primaryLangCode) ? 'rtl' : 'ltr'
    },
    updateAdditionalInfo() {
      const locale = this.primaryLanguage.code
      const dtf = new Intl.DateTimeFormat(locale)
      const nf = new Intl.NumberFormat(locale)

      this.additionalInfo = {
        Calendario: dtf.resolvedOptions().calendar,
        Numeración: nf.resolvedOptions().numberingSystem,
        'Zona Horaria': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'Hour Cycle': dtf.resolvedOptions().hour12 ? '12h' : '24h',
        'Separador Decimal': nf.format(1.1).charAt(1),
        'Separador de Miles': nf.format(1000).charAt(1),
      }
    },
    getCurrencyCode() {
      // Obtener código de moneda basado en la región
      const regionMapping = {
        ES: 'EUR',
        US: 'USD',
        GB: 'GBP',
        JP: 'JPY',
        MX: 'MXN',
        // Agregar más mappings según necesidad
      }

      const region = this.primaryLanguage.code.split('-')[1]
      return regionMapping[region] || 'USD'
    },
    toggleDetails() {
      this.showDetails = !this.showDetails
    },
  },
  mounted() {
    this.refreshLanguageInfo()
  },
}
</script>

<style scoped>
.language-detector {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px;
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 20px auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

h3 {
  color: #2c3e50;
  margin: 20px 0;
  font-size: 1.2em;
}

.language-info {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.info-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.primary-language {
  background: linear-gradient(135deg, #42b983 0%, #3fb27f 100%);
  color: white;
}

.primary-language .label,
.primary-language strong,
.primary-language .language-code {
  color: white;
}

.label {
  display: block;
  color: #666;
  font-size: 0.9em;
  margin-bottom: 8px;
}

strong {
  display: block;
  color: #2c3e50;
  font-size: 1.1em;
  margin-bottom: 4px;
}

.language-code {
  color: #666;
  font-size: 0.8em;
  font-family: monospace;
}

.language-list {
  max-height: 200px;
  overflow-y: auto;
}

.language-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.language-item:last-child {
  border-bottom: none;
}

.language-item.active {
  background-color: #f8f9fa;
  border-left: 3px solid #42b983;
}

.region {
  color: #666;
  font-size: 0.8em;
  margin-left: 5px;
}

.system-details,
.examples {
  display: grid;
  gap: 10px;
}

.detail-item,
.example-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.direction-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.direction-icon {
  font-size: 1.5em;
  padding: 5px 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.direction-icon.rtl {
  transform: scaleX(-1);
}

.actions {
  display: flex;
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
}

.refresh-button {
  background-color: #42b983;
  color: white;
}

.toggle-button {
  background-color: #6c757d;
  color: white;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.additional-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.details-grid {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.detail-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.detail-label {
  display: block;
  color: #666;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.detail-value {
  color: #2c3e50;
  font-size: 1em;
}

@media (max-width: 600px) {
  .language-detector {
    margin: 10px;
    padding: 15px;
  }

  .language-info {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  button {
    width: 100%;
  }

  .detail-item,
  .example-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
