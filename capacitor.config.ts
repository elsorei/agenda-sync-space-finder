
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5f397158505548d3b1e60d118c19d2f9',
  appName: 'agenda-sync-space-finder',
  webDir: 'dist',
  server: {
    url: 'https://5f397158-5055-48d3-b1e6-0d118c19d2f9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
