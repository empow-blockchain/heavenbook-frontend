const withCSS = require('@zeit/next-css')
const withSass = require('@zeit/next-sass')
const withImages = require('next-images')
const withFonts = require('next-fonts');
const withPlugins = require('next-compose-plugins');

const nextConfig = {
    webpack: function (config) {
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|png|jpg|gif)$/,
      use: {
      loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]'
        }
      }
    })
    return config
    }
  }

module.exports = withPlugins([withCSS, withSass, withImages, withFonts], nextConfig)