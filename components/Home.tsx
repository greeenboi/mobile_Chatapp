import { useEffect, useState } from 'react'
import Chat from './Chat'
import Profile from './Profile'
import ChatInput from './ChatInput'

import { StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-elements'
import { Image } from 'expo-image'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ScrollView } from 'react-native';
import { supabase } from '../lib/supabase'

export default function Home({pushToken}: {pushToken: string}) {
  const [ isProfile, setIsProfile ] = useState(true)
  const [ channelName, setChannelName ] = useState('')

  const session = useContext(AuthContext);

  useEffect(() => {
    const fetchChannelName = async () => {
      try {
        let { data: profiles, error } = await supabase
          .from('profiles')
          .select('channel')
          .eq('id', session.user.id);
    
        if (error) throw error;
    
        if (profiles && profiles.length > 0) {
          setChannelName(profiles[0].channel);
        }
      } catch (error) {
        console.error('Error fetching channel name: ', error);
      }
    };
    console.log('session.user.id: ', session.user.id);
    console.log('channelName: ', channelName);
    fetchChannelName();
  },[])

  const Profilebutton = () => {
   return (
    <Image source= {require('../assets/follow.svg')} style={{width: 20, height: 20}} />
   )
  }
  const Chatbutton = () => {
   return (
    <Image source= {require('../assets/chat.svg')} style={{width: 20, height: 20}} />
   )
  }

  return (
    <>
      <View style={styles.buttonContainer}>
        <Text style={styles.text}>{isProfile ? channelName : "" }</Text>
        <Button title={isProfile ? <Profilebutton/> : <Chatbutton/> } onPress={() => setIsProfile(!isProfile)} buttonStyle={styles.button}  disabledStyle={styles.disabledbutton} />
      </View>
      
        {isProfile ? 
          <ScrollView showsVerticalScrollIndicator={true} >
            <Chat key={session.user.id} pushToken={pushToken} /> 
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
    borderRadius: 50,
    marginTop: 40,
    width: 'auto',
    height: 'auto',
  },
  buttonContainer:{  
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0, 0.5)',
    padding: 2,
  },
  disabledbutton:{
    backgroundColor: 'rgba(90, 120, 250, 0.9)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 18,
  },
  text:{
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    // alignSelf: 'center',
    paddingLeft: 20,
    marginVertical: 10,
  },
   
})