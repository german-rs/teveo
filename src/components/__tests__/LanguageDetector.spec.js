import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageDetector from './LanguageDetector.vue'

describe('LanguageDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock de navigator.languages
    Object.defineProperty(window.navigator, 'languages', {
      value: ['es-ES', 'en-US', 'fr-FR'],
      configurable: true,
    })

    // Mock de navigator.language
    Object.defineProperty(window.navigator, 'language', {
      value: 'es-ES',
      configurable: true,
    })

    // Mock de Intl.DisplayNames
    global.Intl.DisplayNames = class {
      constructor() {}
      of(code) {
        const names = {
          es: 'Español',
          en: 'English',
          fr: 'Français',
          ES: 'España',
          US: 'Estados Unidos',
          FR: 'Francia',
        }
        return names[code] || code
      }
    }
  })

  it('detecta el idioma principal correctamente', () => {
    const wrapper = mount(LanguageDetector)
    expect(wrapper.vm.primaryLanguage.code).toBe('es-ES')
    expect(wrapper.vm.primaryLanguage.name).toBe('Español')
  })

  it('muestra la lista de idiomas preferidos', () => {
    const wrapper = mount(LanguageDetector)
    expect(wrapper.vm.preferredLanguages).toHaveLength(3)
    expect(wrapper.vm.preferredLanguages[0].code).toBe('es-ES')
  })

  it('formatea fechas según la localización', () => {
    const wrapper = mount(LanguageDetector)
    expect(wrapper.vm.localizedDate).toBeTruthy()
    expect(typeof wrapper.vm.localizedDate).toBe('string')
  })

  it('formatea números según la localización', () => {
    const wrapper = mount(LanguageDetector)
    expect(wrapper.vm.localizedNumber).toBeTruthy()
    expect(typeof wrapper.vm.localizedNumber).toBe('string')
  })

  it('detecta la dirección del texto correctamente', () => {
    const wrapper = mount(LanguageDetector)
    expect(wrapper.vm.textDirection).toBe('ltr')
    expect(wrapper.vm.textDirectionName).toContain('izquierda a derecha')
  })

  it('actualiza la información al hacer clic en el botón de actualizar', async () => {
    const wrapper = mount(LanguageDetector)
    const refreshSpy = vi.spyOn(wrapper.vm, 'refreshLanguageInfo')

    await wrapper.find('.refresh-button').trigger('click')
    expect(refreshSpy).toHaveBeenCalled()
  })

  it('muestra y oculta detalles adicionales', async () => {
    const wrapper = mount(LanguageDetector)
    expect(wrapper.find('.additional-details').exists()).toBe(false)

    await wrapper.find('.toggle-button').trigger('click')
    expect(wrapper.find('.additional-details').exists()).toBe(true)

    await wrapper.find('.toggle-button').trigger('click')
    expect(wrapper.find('.additional-details').exists()).toBe(false)
  })

  it('maneja correctamente el formato de moneda', () => {
    const wrapper = mount(LanguageDetector)
    expect(wrapper.vm.localizedCurrency).toBeTruthy()
    expect(typeof wrapper.vm.localizedCurrency).toBe('string')
  })

  it('tiene la estructura correcta del componente', () => {
    const wrapper = mount(LanguageDetector)
    expect(wrapper.find('.language-detector').exists()).toBe(true)
    expect(wrapper.find('.language-info').exists()).toBe(true)
    expect(wrapper.find('.primary-language').exists()).toBe(true)
  })
})
