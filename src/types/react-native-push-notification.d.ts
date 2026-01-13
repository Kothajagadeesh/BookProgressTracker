declare module 'react-native-push-notification' {
  export interface PushNotificationObject {
    id?: string;
    title?: string;
    message: string;
    userInfo?: any;
    playSound?: boolean;
    soundName?: string;
    number?: number;
    repeatType?: 'week' | 'day' | 'hour' | 'minute' | 'time';
    repeatTime?: number;
    date?: Date;
    channelId?: string;
  }

  export interface PushNotificationScheduleObject extends PushNotificationObject {
    date: Date;
    allowWhileIdle?: boolean;
  }

  export interface ReceivedNotification {
    foreground: boolean;
    userInteraction: boolean;
    message: string | object;
    data: object;
    badge: number;
    alert: object;
    sound: string;
    finish: (fetchResult: string) => void;
  }

  export enum Importance {
    DEFAULT = 3,
    HIGH = 4,
    LOW = 2,
    MIN = 1,
    NONE = 0,
    UNSPECIFIED = -1000,
  }

  export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: Importance;
    vibrate?: boolean;
  }

  export interface PushNotification {
    configure(options: {
      onRegister?: (token: { os: string; token: string }) => void;
      onNotification?: (notification: ReceivedNotification) => void;
      onAction?: (notification: any) => void;
      onRegistrationError?: (error: any) => void;
      permissions?: {
        alert?: boolean;
        badge?: boolean;
        sound?: boolean;
      };
      popInitialNotification?: boolean;
      requestPermissions?: boolean;
    }): void;

    localNotification(notification: PushNotificationObject): void;
    localNotificationSchedule(notification: PushNotificationScheduleObject): void;
    cancelLocalNotification(id: string): void;
    cancelAllLocalNotifications(): void;
    removeAllDeliveredNotifications(): void;
    getScheduledLocalNotifications(callback: (notifications: any[]) => void): void;
    createChannel(channel: ChannelObject, callback?: (created: boolean) => void): void;
    channelExists(channelId: string, callback: (exists: boolean) => void): void;
    deleteChannel(channelId: string): void;
  }

  const pushNotification: PushNotification;
  export default pushNotification;
}
