import { useState, useEffect } from 'react'
import Chat from './Chat'
import Profile from './Profile'
import ChatInput from './ChatInput'

import { StyleSheet, View, Alert, Image } from 'react-native'
import { Button, Input } from 'react-native-elements'

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ScrollView } from 'react-native';

export default function Home() {
  const [ isProfile, setIsProfile ] = useState(true)
  const session = useContext(AuthContext);

  return (
    <>
      <Button title={isProfile ? 'Go to Profile' : 'Go to Chat'} onPress={() => setIsProfile(!isProfile)} buttonStyle={styles.button}  disabledStyle={styles.disabledbutton} />
      
        {isProfile ? 
          <ScrollView showsVerticalScrollIndicator={true} >
            <Chat key={session.user.id}  /> 
          </ScrollView>
            : 
          <Profile key={session.user.id} session={session} />
        }
      {isProfile ? <ChatInput />  : null }
    </>
  )
}

const styles = StyleSheet.create({
  button:{
    backgroundColor: 'rgba(90, 120, 250, 0.3)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 24,
    marginTop: 40,
  },
  buttonContainer:{  
    color: 'white',
  },
  disabledbutton:{
    backgroundColor: 'rgba(90, 120, 250, 0.9)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 18,
  },
   
})