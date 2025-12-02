import { ref, onMounted } from 'vue'

export function useDeviceDetection() {
  const isAndroid = ref(false)
  const isIOS = ref(false)
  const isMobile = ref(false)
  const isMac = ref(false)

  onMounted(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    // Detect Android
    isAndroid.value = /android/i.test(userAgent)

    // Detect iOS
    isIOS.value = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream

    // Detect mobile
    isMobile.value = isAndroid.value || isIOS.value || /mobile/i.test(userAgent)
    
    // Detect macOS (for keyboard shortcut display)
    isMac.value = 
      ((navigator as any).userAgentData && (navigator as any).userAgentData.platform
        ? /Mac/.test((navigator as any).userAgentData.platform)
        : /Macintosh/.test(userAgent))
  })

  return {
    isAndroid,
    isIOS,
    isMobile,
    isMac
  }
}
