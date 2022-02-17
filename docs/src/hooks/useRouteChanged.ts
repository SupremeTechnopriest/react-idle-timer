import { useEffect } from 'react'
import { useRouter } from 'next/router'

export const useRouteChanged = (fn: (url: string) => void) => {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      fn(url)
      console.log('App is changing to: ', url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events, fn])
}
