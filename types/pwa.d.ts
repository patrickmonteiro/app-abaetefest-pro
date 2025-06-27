// types/pwa.d.ts
export {}

declare global {
  interface Window {
    __pwaInstallPrompt: any
    triggerPWAInstall: () => Promise<{outcome: string, error?: any}>
    checkPWAStatus: () => void
  }

  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>
    prompt(): Promise<void>
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}