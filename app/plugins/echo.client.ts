import Echo from "laravel-echo"
import Pusher from "pusher-js"

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  const reverbKey = config.public.reverbAppKey as string
  if (!reverbKey) return

  // Configure Pusher for the Reverb connector
  if (import.meta.client) {
    // @ts-expect-error - Echo expects window.Pusher to be set by the broadcaster
    window.Pusher = Pusher
  }

  const reverbHost = (config.public.reverbHost as string) || window.location.hostname
  const reverbPort = parseInt(config.public.reverbPort as string, 10) || 6001
  const reverbScheme = (config.public.reverbScheme as string) || "http"
  const useTLS = reverbScheme === "https"

  const baseUrl = config.public.baseUrl as string
  const suffixUrl = config.public.suffixUrl as string

  const echo = new Echo({
    broadcaster: "reverb",
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: useTLS,
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${baseUrl}${suffixUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${auth.token ?? ""}`,
      },
    },
  })

  return {
    provide: {
      echo,
    },
  }
})
