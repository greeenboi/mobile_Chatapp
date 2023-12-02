import { Text, Alert,  StyleSheet, View } from 'react-native'
import React, {useEffect, useState} from 'react'
import { Button, Input } from 'react-native-elements'
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase'
import { ScrollView } from 'react-native';

export default function Chat({ session: { session: Session } })  {
  const session = useContext(AuthContext);
  const id = session.user.id; // Replace 'email' with the property that holds the username
  const [username, setUsername] = useState('')
  
  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        // setWebsite(data.website)
        // setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      
    }
  }

    return (
      <View style={styles.container}>
        <ScrollView style={[styles.chatContainer, styles.mb20]}>
          <View style={[styles.verticallySpaced, styles.receivedMSG , styles.mb20]}>
            <Text style={styles.userreceive} >samplePerson</Text> 
            <Text style={styles.text} >ajahaha</Text>          
          </View>
          <View style={[styles.verticallySpaced, styles.receivedMSG , styles.mb20]}>
            <Text style={styles.userreceive} >samplePerson</Text> 
            <Text style={styles.text} > HMMM</Text>          
          </View>
          <View style={[styles.verticallySpaced, styles.sentMSG , styles.mb20]}>
            <Text style={styles.usersent} > {username}</Text> 
            <Text style={styles.text} > Hello</Text>          
          </View>
        </ScrollView>
        <View style={styles.verticallySpaced}>
          <Input label="Type Here..."  style={styles.input}  />
        </View>
      </View>
    )

}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderRadius: 18,
    
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    width: '100%',
  },
  mb20: {
    marginBottom: 20,
  },
  text:{
    color: 'white',
    fontSize: 22,
  },
  chatContainer: {
    backgroundColor: 'rgba(0,0,0, 0.3)',
    padding: 12,
    borderRadius: 18,
    height: '76%',
    width: '100%',
  },
  sentMSG: {
    backgroundColor: 'rgba(90,90,90,0.8)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    padding:8,
    borderBottomRightRadius: 0,
    borderRadius: 18,
  },
  receivedMSG: {
    backgroundColor: 'rgba(90,120,90,0.8)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    padding:8,
    borderBottomLeftRadius: 0,
    borderRadius: 18,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    
  },
  usersent:{
    fontSize: 10,
    color: 'rgb(150,150,150)',
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },

  userreceive:{
    fontSize: 10,
    color: 'rgb(150,150,150)',
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },

  input:{

  }
 
})