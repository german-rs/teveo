import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GeoLocation from './GeoLocation.vue'

describe('GeoLocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock de la API de geolocalización
    global.navigator.geolocation = mockGeolocation
  })

  const mockPosition = {
    coords: {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 50,
      altitude: 100,
      speed: 0,
    },
    timestamp: new Date('2025-04-24T19:38:20').getTime(),
  }

  it('muestra el estado de carga inicialmente', () => {
    const wrapper = mount(GeoLocation)
    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('muestra la ubicación cuando está disponible', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => success(mockPosition))

    const wrapper = mount(GeoLocation)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.location-info').exists()).toBe(true)
    expect(wrapper.text()).toContain('40.7128')
    expect(wrapper.text()).toContain('-74.0060')
  })

  it('muestra error cuando falla la geolocalización', async () => {
    const error = { code: 1, message: 'User denied geolocation' }
    mockGeolocation.getCurrentPosition.mockImplementation((success, fail) => fail(error))

    const wrapper = mount(GeoLocation)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Acceso a la ubicación denegado')
  })

  it('formatea las coordenadas correctamente', () => {
    const wrapper = mount(GeoLocation)

    expect(wrapper.vm.formatCoordinate(40.7128, 'lat')).toBe('40.712800° N')
    expect(wrapper.vm.formatCoordinate(-74.006, 'lon')).toBe('74.006000° W')
  })

  it('genera la URL de Google Maps correctamente', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => success(mockPosition))

    const wrapper = mount(GeoLocation)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.mapUrl).toBe('https://www.google.com/maps?q=40.7128,-74.006')
  })

  it('inicia y detiene el seguimiento correctamente', async () => {
    const wrapper = mount(GeoLocation)

    await wrapper.find('.start-button').trigger('click')
    expect(mockGeolocation.watchPosition).toHaveBeenCalled()
    expect(wrapper.vm.watching).toBe(true)

    await wrapper.find('.stop-button').trigger('click')
    expect(mockGeolocation.clearWatch).toHaveBeenCalled()
    expect(wrapper.vm.watching).toBe(false)
  })

  it('actualiza la ubicación cuando se solicita', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => success(mockPosition))

    const wrapper = mount(GeoLocation)
    await wrapper.vm.$nextTick()

    await wrapper.find('.update-button').trigger('click')
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2)
  })

  it('limpia el watch al desmontar el componente', () => {
    const wrapper = mount(GeoLocation)
    wrapper.vm.watchId = 123
    wrapper.vm.watching = true

    wrapper.unmount()
    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123)
  })
})
