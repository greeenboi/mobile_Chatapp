import { useState, useEffect } from 'react'
import Chat from './Chat'
import Profile from './Profile'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Image } from 'react-native'
import { Button, Input } from 'react-native-elements'
import { Session } from '@supabase/supabase-js'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Home() {
  const [ isProfile, setIsProfile ] = useState(false)
  const session = useContext(AuthContext);

  return (
    <View >
      <Button title={isProfile ? 'Go to Profile' : 'Go to Chat'} onPress={() => setIsProfile(!isProfile)} buttonStyle={styles.button} containerStyle={styles.button} disabledStyle={styles.disabledbutton} />
      {isProfile ? <Chat key={session.user.id} session={session} /> : <Profile key={session.user.id} session={session} />}
    </View>
  )
}

const styles = StyleSheet.create({
  button:{
    backgroundColor: 'rgba(90, 120, 250, 0.3)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 24,
    
  },
  disabledbutton:{
    backgroundColor: 'rgba(90, 120, 250, 0.9)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 18,
  }  
})