async function redirect () {
  return [
    {
      source: '/docs',
      destination: '/docs/getting-started/installation',
      permanent: true
    },
    {
      source: '/features',
      destination: '/docs/features/idle-detection',
      permanent: true
    },
    {
      source: '/api',
      destination: '/docs/api/use-idle-timer',
      permanent: true
    },
    {
      source: '/discord',
      destination: 'https://discord.gg/YPuxNdWA4D',
      permanent: true
    },
    {
      source: '/github',
      destination: 'https://github.com/SupremeTechnopriest/react-idle-timer',
      permanent: true
    },
    {
      source: '/npm',
      destination: 'https://npmjs.com/package/react-idle-timer',
      permanent: true
    },
    {
      source: '/sponsor',
      destination: 'https://github.com/sponsors/SupremeTechnopriest',
      permanent: true
    },
    {
      source: '/donate',
      destination: 'https://github.com/sponsors/SupremeTechnopriest',
      permanent: true
    },
    {
      source: '/changelog',
      destination: '/docs/changelog',
      permanent: true
    },
    {
      source: '/contributing',
      destination: '/docs/contributing',
      permanent: true
    },
    {
      source: '/license',
      destination: '/docs/license',
      permanent: true
    }
  ]
}

module.exports = redirect
