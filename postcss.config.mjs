/**
 * PostCSS: makes the breakpoints in src/styles/media.css (@custom-media)
 * available in every stylesheet and Astro component without importing them.
 */
import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';

export default {
  plugins: [postcssGlobalData({ files: ['./src/styles/media.css'] }), postcssCustomMedia()],
};
