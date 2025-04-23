import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OsDetector from './OsDetector.vue'

describe('OsDetector', () => {
  beforeEach(() => {
    // Limpiar todas las simulaciones antes de cada prueba
    vi.clearAllMocks()
  })

  // Helper function para simular diferentes User Agents
  function setUserAgent(userAgent) {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: userAgent,
      configurable: true,
    })
  }

  // Helper function para simular userAgentData
  function mockUserAgentData(platform, version = '10.0.0') {
    Object.defineProperty(window.navigator, 'userAgentData', {
      value: {
        platform: platform,
        getHighEntropyValues: () => Promise.resolve({ platformVersion: version }),
      },
      configurable: true,
    })
  }

  // Pruebas usando el nuevo API userAgentData
  it('detecta Windows usando userAgentData', async () => {
    mockUserAgentData('Windows', '10.0.0')
    const wrapper = mount(OsDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Windows')
    expect(wrapper.text()).toContain('10.0.0')
  })

  it('detecta macOS usando userAgentData', async () => {
    mockUserAgentData('macOS', '12.0.0')
    const wrapper = mount(OsDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('macOS')
    expect(wrapper.text()).toContain('12.0.0')
  })

  // Pruebas usando el fallback (userAgent)
  it('detecta Windows 10/11 usando fallback', async () => {
    delete window.navigator.userAgentData
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    const wrapper = mount(OsDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Windows 10/11')
  })

  it('detecta macOS usando fallback', async () => {
    delete window.navigator.userAgentData
    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
    const wrapper = mount(OsDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('macOS')
    expect(wrapper.text()).toContain('10.15.7')
  })

  it('detecta Linux usando fallback', async () => {
    delete window.navigator.userAgentData
    setUserAgent('Mozilla/5.0 (X11; Linux x86_64)')
    const wrapper = mount(OsDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Linux')
  })

  it('detecta Android usando fallback', async () => {
    delete window.navigator.userAgentData
    setUserAgent('Mozilla/5.0 (Linux; Android 11; Pixel 5)')
    const wrapper = mount(OsDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Android')
    expect(wrapper.text()).toContain('11')
  })

  it('detecta iOS usando fallback', async () => {
    delete window.navigator.userAgentData
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)')
    const wrapper = mount(OsDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('iOS')
    expect(wrapper.text()).toContain('14.6')
  })

  it('muestra "Sistema Operativo Desconocido" para user agents no reconocidos', async () => {
    delete window.navigator.userAgentData
    setUserAgent('Sistema No Reconocido')
    const wrapper = mount(OsDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Sistema Operativo Desconocido')
  })

  // Pruebas de estructura
  it('renderiza el título correctamente', () => {
    const wrapper = mount(OsDetector)
    expect(wrapper.find('h2').text()).toBe('Información del Sistema Operativo')
  })

  it('tiene la estructura correcta', () => {
    const wrapper = mount(OsDetector)
    expect(wrapper.find('.os-detector').exists()).toBe(true)
    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
