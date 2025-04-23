import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TimeZoneDetector from './TimeZoneDetector.vue'

describe('TimeZoneDetector', () => {
  beforeEach(() => {
    // Restaurar todos los mocks antes de cada prueba
    vi.restoreAllMocks()

    // Mock para Date
    const mockDate = new Date('2025-04-23T20:41:06Z')
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate)

    // Mock para Intl.DateTimeFormat
    global.Intl.DateTimeFormat = vi.fn(() => ({
      resolvedOptions: () => ({
        timeZone: 'America/New_York',
      }),
    }))
  })

  it('renderiza el componente correctamente', () => {
    const wrapper = mount(TimeZoneDetector)
    expect(wrapper.find('.timezone-detector').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Información de Zona Horaria')
  })

  it('detecta y muestra la zona horaria correctamente', () => {
    const wrapper = mount(TimeZoneDetector)
    expect(wrapper.text()).toContain('America/New_York')
  })

  it('muestra el offset UTC correctamente', () => {
    const wrapper = mount(TimeZoneDetector)
    expect(wrapper.vm.utcOffset).toMatch(/UTC[+-]\d{2}:\d{2}/)
  })

  it('actualiza la hora local', async () => {
    const wrapper = mount(TimeZoneDetector)
    expect(wrapper.vm.localTime).not.toBe('')
  })

  it('maneja errores cuando la detección falla', () => {
    // Simular un error en la detección
    global.Intl.DateTimeFormat = vi.fn(() => {
      throw new Error('Simulación de error')
    })

    const wrapper = mount(TimeZoneDetector)
    expect(wrapper.text()).toContain('No detectado')
  })

  it('limpia el intervalo al desmontar', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    const wrapper = mount(TimeZoneDetector)
    wrapper.unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  // Prueba para verificar la actualización del tiempo
  it('actualiza el tiempo cada segundo', async () => {
    vi.useFakeTimers()
    const wrapper = mount(TimeZoneDetector)
    const initialTime = wrapper.vm.localTime

    // Avanzar 1 segundo
    await vi.advanceTimersByTime(1000)
    expect(wrapper.vm.localTime).not.toBe(initialTime)

    vi.useRealTimers()
  })

  // Prueba de estructura del componente
  it('tiene todos los elementos necesarios', () => {
    const wrapper = mount(TimeZoneDetector)
    expect(wrapper.find('.timezone-info').exists()).toBe(true)
    expect(wrapper.findAll('p')).toHaveLength(3)
  })
})
