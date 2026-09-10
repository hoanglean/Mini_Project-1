import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hoanglean.miniproject',
  appName: 'Mini Project',
  webDir: 'dist', // Đảm bảo đúng thư mục sau khi build
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
    },
  },
};

export default config;