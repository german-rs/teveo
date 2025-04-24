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

      <!-- Dirección del Texto -->
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
      primaryLanguage: { code: '', name: '', region: '' },
      preferredLanguages: [],
      showDetails: false,
      additionalInfo: {},
      textDirection: 'ltr',
    }
  },
  computed: {
    textDirectionName() {
      return this.textDirection === 'rtl'
        ? 'De derecha a izquierda (RTL)'
        : 'De izquierda a derecha (LTR)'
    },
  },
  methods: {
    refreshLanguageInfo() {
      this.detectLanguages()
      this.detectTextDirection()
      this.updateAdditionalInfo()
    },
    detectLanguages() {
      const languages = navigator.languages || [navigator.language]
      this.preferredLanguages = languages.map((lang) => {
        const [languageCode, regionCode] = lang.split('-')
        let name = languageCode
        let region = regionCode || ''

        try {
          const dnLang = new Intl.DisplayNames([lang], { type: 'language' })
          name = dnLang.of(languageCode) || languageCode
          if (regionCode) {
            const dnRegion = new Intl.DisplayNames([lang], { type: 'region' })
            region = dnRegion.of(regionCode) || regionCode
          }
        } catch (e) {
          console.warn('Intl.DisplayNames no soportado en este navegador:', e)
        }

        return { code: lang, name, region }
      })

      this.primaryLanguage = this.preferredLanguages[0] || {
        code: 'en',
        name: 'English',
        region: '',
      }
    },
    detectTextDirection() {
      const rtlLanguages = ['ar', 'he', 'fa', 'ur']
      const primaryLangCode = this.primaryLanguage.code.split('-')[0]
      this.textDirection = rtlLanguages.includes(primaryLangCode) ? 'rtl' : 'ltr'
    },
    updateAdditionalInfo() {
      const locale = this.primaryLanguage.code || 'en'
      const dtf = new Intl.DateTimeFormat(locale)
      const nf = new Intl.NumberFormat(locale)

      this.additionalInfo = {
        Calendario: dtf.resolvedOptions().calendar,
        Numeración: nf.resolvedOptions().numberingSystem,
        'Zona Horaria': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'Hour Cycle': dtf.resolvedOptions().hour12 ? '12h' : '24h',
      }
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
