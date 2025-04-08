import React, { createContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Context để chia sẻ thông tin về notification
export const NotificationContext = createContext({
  token: null,
  notification: null,
});

const App = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const register = async () => {
      if (!Device.isDevice) return;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const token = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(token.data);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }
    };

    register();

    const sub = Notifications.addNotificationReceivedListener(n => {
      console.log('📩 Nhận thông báo:', n);
      setNotification(n);
    });

    return () => sub.remove();
  }, []);

  return (
    <NotificationContext.Provider value={{ token: expoPushToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default App;
