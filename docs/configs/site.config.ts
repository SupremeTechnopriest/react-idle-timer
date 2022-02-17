const baseUrl = 'https://github.com/SupremeTechnopriest/react-idle-timer'

export default {
  copyright: `Copyright © ${new Date().getFullYear()} Randy Lebeau. All Rights Reserved.`,
  author: {
    name: 'Randy Lebeau',
    github: 'https://github.com/supremetechnopriest',
    linkedin: 'https://linkedin.com/in/randylebeau',
    email: 'randylebeau@gmail.com'
  },
  repo: {
    url: baseUrl,
    editUrl: `${baseUrl}/edit/main/website/pages`,
    blobUrl: `${baseUrl}/blob/main`
  },
  package: {
    url: 'https://npmjs.com/package/react-idle-timer'
  },
  sponsor: {
    url: 'https://github.com/sponsors/SupremeTechnopriest'
  },
  discord: {
    url: 'https://discord.gg/YPuxNdWA4D',
    invite: 'YPuxNdWA4D'
  },
  seo: {
    title: 'IdleTimer',
    titleTemplate: 'IdleTimer - %s',
    description: 'Robust activity detection for your React applications.',
    siteUrl: 'https://idletimer.dev',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://idletimer.dev',
      title: 'IdleTimer',
      description: 'Robust activity detection for your React applications.',
      site_name: 'https://idletimer.dev',
      images: [
        {
          url: 'https://idletimer.dev/og-image.png',
          width: 1240,
          height: 480,
          alt: 'IdleTimer Logo'
        },
        {
          url: 'https://idletimer.dev/twitter-og-image.png',
          width: 1012,
          height: 506,
          alt: 'IdleTimer Logo'
        }
      ]
    }
  }
}
