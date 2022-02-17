const path = require('path')
const { withContentlayer } = require('next-contentlayer')
const redirects = require('./next.redirect')
const { i18n } = require('./next.i18n.config')

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withContentlayer()({
  redirects,
  i18n,
  images: {
    domains: ['avatars.githubusercontent.com']
  },
  webpack (config) {
    config.resolve.alias.react = path.resolve(__dirname, 'node_modules/react')
    return config
  }
})
