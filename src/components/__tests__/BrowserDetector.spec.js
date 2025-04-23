import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BrowserDetector from '../BrowserDetector.vue'

// Referencia para restaurar después
let userAgentSpy

// Limpia el mock al terminar cada test
afterEach(() => {
  userAgentSpy?.mockRestore()
})

function mockUserAgent(ua) {
  // espiamos la propiedad con getter
  userAgentSpy = vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(ua)
}

describe('BrowserDetector', () => {
  it('detecta Google Chrome', () => {
    mockUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    )
    const wrapper = mount(BrowserDetector)
    expect(wrapper.text()).toContain('Google Chrome')
  })

  it('detecta Mozilla Firefox', () => {
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')
    const wrapper = mount(BrowserDetector)
    expect(wrapper.text()).toContain('Mozilla Firefox')
  })

  it('detecta Safari', () => {
    mockUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    )
    const wrapper = mount(BrowserDetector)
    expect(wrapper.text()).toContain('Safari')
  })

  it('detecta Microsoft Edge', () => {
    mockUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    )
    const wrapper = mount(BrowserDetector)
    expect(wrapper.text()).toContain('Microsoft Edge')
  })

  it('detecta Opera', () => {
    mockUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.277',
    )
    const wrapper = mount(BrowserDetector)
    expect(wrapper.text()).toContain('Opera')
  })

  it('muestra “Navegador desconocido” cuando no coincide', () => {
    mockUserAgent('Usuario No Reconocido')
    const wrapper = mount(BrowserDetector)
    expect(wrapper.text()).toContain('Navegador desconocido')
  })

  it('renderiza el título', () => {
    const wrapper = mount(BrowserDetector)
    expect(wrapper.find('h2').text()).toBe('Información del Navegador')
  })

  it('tiene la estructura correcta', () => {
    const wrapper = mount(BrowserDetector)
    expect(wrapper.find('.browser-detector').exists()).toBe(true)
    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
// fin
