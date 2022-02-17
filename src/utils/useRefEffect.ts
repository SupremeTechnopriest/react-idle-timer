import { useRef, useEffect } from 'react'

export function useRefEffect<T> (prop: any) {
  const ref = useRef<T>(prop)
  useEffect(() => {
    ref.current = prop
  }, [prop])
  return ref
}
