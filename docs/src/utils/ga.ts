export const pageView = (url: string) => {
  (window as any).gtag('config', process.env.GOOGLE_ANALYTICS, {
    page_path: url
  })
}

// log specific events happening.
interface IEvent {
  action: string
  params: any
}

export const event = ({ action, params }: IEvent) => {
  (window as any).gtag('event', action, params)
}
