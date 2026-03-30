import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

// Configures next-intl plugin to enable i18n support.
// Automatically loads configuration from ./i18n/request.ts out-of-the-box.
const withNextIntl = createNextIntlPlugin({
  experimental: {
    // Provide the path to the messages that you're using in `AppConfig`.
    // With this setup in place, you’ll see a new declaration file generated in your messages directory
    // once you run next dev, next build or next typegen.
    // This declaration file will provide the exact types for the JSON messages
    // that you’re importing and assigning to AppConfig, enabling type safety for message arguments.
    createMessagesDeclaration: './i18n/messages/en.json'
  }
});
export default withNextIntl(nextConfig);