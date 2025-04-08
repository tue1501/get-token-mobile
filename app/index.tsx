import React, { useEffect, useState, createContext, useContext } from 'react';
import { View, Text, Button, StyleSheet, Platform, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { registerRootComponent } from 'expo';

// Context để chia sẻ thông tin về notification
export const NotificationContext = createContext<{
  token: string | null;
  notifications: any[];
}>({
  token: null,
  notifications: [], // Lưu tất cả thông báo
});

const App = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);  // Lưu tất cả các thông báo nhận được

  // Lấy Expo Push Token và xử lý thông báo
  useEffect(() => {
    const register = async () => {
      // Kiểm tra thiết bị thật
      if (!Device.isDevice) {
        console.log('Đây là mô phỏng, cần thiết bị thật để lấy token');
        return;
      }

      // Yêu cầu quyền thông báo
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Không có quyền thông báo');
        return;
      }

      // Lấy Expo Push Token
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

    // Lắng nghe thông báo nhận được
    const sub = Notifications.addNotificationReceivedListener(n => {
      console.log('📩 Nhận thông báo:', n);
      setNotifications(prevNotifications => [...prevNotifications, n]);  // Thêm thông báo mới vào mảng
    });

    return () => sub.remove();
  }, []);

  return (
    <NotificationContext.Provider value={{ token: expoPushToken, notifications }}>
      <UI />
    </NotificationContext.Provider>
  );
};

const UI = () => {
  const { token, notifications } = useContext(NotificationContext);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📲 Expo Notification Viewer</Text>
      <Text style={styles.label}>Expo Push Token:</Text>
      <Text style={styles.token}>{token || '🔄 Đang lấy token...'}</Text>

      <Text style={styles.label}>Thông báo đã nhận:</Text>

      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <View key={index} style={styles.notificationBox}>
            <Text style={styles.text}>📨 {notification.request.content.title}</Text>
            <Text style={styles.text}>📋 {notification.request.content.body}</Text>
            <Text style={styles.text}>⏰ {new Date(notification.request.date).toLocaleString()}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.text}>🚫 Không có thông báo nào</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  token: { fontSize: 14, color: '#333', marginTop: 5 },
  notificationBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    marginBottom: 10,
  },
  text: { fontSize: 14, color: '#333' },
});

// Đăng ký ứng dụng để Expo có thể chạy được
registerRootComponent(App);

export default App;
