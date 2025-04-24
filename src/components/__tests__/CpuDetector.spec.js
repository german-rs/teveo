import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CpuDetector from './CpuDetector.vue'

describe('CpuDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock de performance.now()
    vi.spyOn(performance, 'now').mockImplementation(() => 1000)

    // Mock básico de navigator
    Object.defineProperty(window.navigator, 'hardwareConcurrency', {
      value: 8,
      configurable: true,
    })
  })

  // Helper para simular userAgentData
  function mockUserAgentData(architecture = 'x86', bitness = '64') {
    Object.defineProperty(window.navigator, 'userAgentData', {
      value: {
        getHighEntropyValues: () =>
          Promise.resolve({
            architecture,
            bitness,
            platform: 'Windows',
          }),
      },
      configurable: true,
    })
  }

  it('muestra el número correcto de núcleos', () => {
    const wrapper = mount(CpuDetector)
    expect(wrapper.text()).toContain('8')
  })

  it('muestra la arquitectura cuando está disponible', async () => {
    mockUserAgentData('x86', '64')
    const wrapper = mount(CpuDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('x86')
  })

  it('muestra el mensaje de advertencia cuando la información no está disponible', async () => {
    delete window.navigator.userAgentData
    const wrapper = mount(CpuDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.warning').exists()).toBe(true)
  })

  it('muestra la barra de rendimiento cuando está soportado', async () => {
    const wrapper = mount(CpuDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.performance-meter').exists()).toBe(true)
  })

  it('renderiza el título correctamente', () => {
    const wrapper = mount(CpuDetector)
    expect(wrapper.find('h2').text()).toBe('Información de la CPU')
  })

  it('maneja errores en la detección de CPU correctamente', async () => {
    // Simular un error en la detección
    Object.defineProperty(window.navigator, 'hardwareConcurrency', {
      get: () => {
        throw new Error('Hardware info not available')
      },
    })

    const wrapper = mount(CpuDetector)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.warning').exists()).toBe(true)
  })

  it('calcula el porcentaje de rendimiento correctamente', async () => {
    const wrapper = mount(CpuDetector)
    await wrapper.vm.measurePerformance()
    expect(wrapper.vm.performancePercent).toBeLessThanOrEqual(100)
    expect(wrapper.vm.performancePercent).toBeGreaterThanOrEqual(0)
  })

  it('tiene la estructura correcta del componente', () => {
    const wrapper = mount(CpuDetector)
    expect(wrapper.find('.cpu-detector').exists()).toBe(true)
    expect(wrapper.find('.cpu-info').exists()).toBe(true)
    expect(wrapper.findAll('.info-item').length).toBeGreaterThan(0)
  })
})
