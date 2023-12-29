import 'react-native-url-polyfill/auto'
import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Home from './components/Home'

import { StyleSheet } from 'react-native'
import { AuthContext } from './context/AuthContext';
import { ImageBackground } from 'react-native';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


async function registerForPushNotificationsAsync() {
  let token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig.extra.eas.projectId,
  });
  

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Chat Messages',
      description: 'Chat messages for your conversations',
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: 'default',
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.NOTIFICATION_COMMUNICATION_INSTANT,
      },
      enableVibrate: true,
      enableLights: true,
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token.data;
}

export default function App() {

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      
      setExpoPushToken(token)
      await supabase.from('profiles').upsert({ id: session?.user.id, expo_push_token: token});

    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <AuthContext.Provider value={session} >
      <ImageBackground source={require('./assets/Background.jpg')} style={styles.container}>
      
        {session && session.user ? (
          <Home pushToken={expoPushToken} /> 
          ) : (
        <Auth />
        )}
      
      </ImageBackground>
    </AuthContext.Provider >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    backgroundColor: '#080B2C',
  },
});