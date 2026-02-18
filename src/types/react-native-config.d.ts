declare module 'react-native-config' {
  export interface NativeConfig {
    API_URL?: string;
    OPENAI_API_KEY?: string;
    ONESIGNAL_APP_ID?: string;
    APP_VERSION?: string;
    APP_ENV?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
