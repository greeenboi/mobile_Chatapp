import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Home from './components/Home'
import Chat from './components/Chat'
import { StyleSheet, View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { AuthContext } from './context/AuthContext';
import { ImageBackground } from 'react-native';


export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <AuthContext.Provider value={session}>
      <ImageBackground source={require('./assets/Background.jpg')} style={styles.container}>
        {session && session.user ? <Home /> : <Auth />}
      </ImageBackground>
    </AuthContext.Provider >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
});