import { Text, Alert,  StyleSheet, View } from 'react-native'
import React, {useEffect, useState, useRef} from 'react'
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase'
import { ScrollView } from 'react-native';
// import { Image } from 'react-native';
import NullMessage from './NullMessage';
import { Button } from 'react-native-elements';

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}


export default function Chat({pushToken}: {pushToken: string})  {
  const session = useContext(AuthContext);
  
  const [username, setUsername] = useState('')
  const scrollRef = useRef<ScrollView>();
  
  const [channel, setChannel] = useState('');
  const [messages, setMessages] = useState([]);


 
  
  
  useEffect(() => {
    if (session) {
      (async () => {
        await getProfile();
        if (channel){
          fetchInitialMessages();
        }
      })();
    }

    const subscription = supabase
      .channel('messages') 
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleInserts)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    }
  }, [session, channel]);

  const handleInserts = (payload) => {
    // console.log('Change received!', payload)
    scrollRef.current?.scrollToEnd({ animated: true });
    setMessages(messages => [...messages, payload.new]);
    console.log(payload.new);
  }

  async function fetchInitialMessages() {
    // Alert.alert(channel)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel', channel)
      .order('created_at', { ascending: true })
      .range(0, 49)
    
    if (error) {
      console.error(error);
      return;
    }
    else if(!error){
      // console.log('Data:', data);
      // console.log('Error:', error);
      setMessages(data );
      // console.log(messages);
    }
    // console.log(data);
  }
  async function getProfile() {
    try {
      
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url, channel`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        return new Promise<void>((resolve, reject) => {
          setUsername(data.username);
          setChannel(data.channel);
          // Alert.alert(data.channel);
          
          resolve();
        });
      }
      
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } 
  }

  
  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }


    return (
      <View style={styles.container}>
        <ScrollView style={[styles.chatContainer, styles.mb20]} ref={scrollRef} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {messages.length === 0 ? (
            <NullMessage /> // Render your component when messages is empty
          ) : (
            messages.map((message, index) => (
              <View 
                key={index} 
                style={[
                  styles.verticallySpaced, 
                  message.username === username ? styles.sentMSG : styles.receivedMSG, 
                  styles.mb20
                ]}
              >
                {/* <Image 
                  source={{ uri: message.Avatar_uri }} 
                  style={{ width: 50, height: 50, borderColor: 'white', borderWidth: 1, borderRadius: 50, }} 
                  
                /> */}
                <Text style={message.username === username ? styles.usersent : styles.userreceive}>
                  {message.username}
                </Text> 
                <Text style={styles.text}>{message.content}</Text>    
                <Text style={styles.time}>
                  {
                    isToday(new Date(message.created_at)) 
                      ? new Date(message.created_at).toLocaleTimeString() 
                      : new Date(message.created_at).toLocaleDateString()
                  }
                </Text>   
              </View>
            ))
          )}
          <Button
            title="Press to Send Notification"
            onPress={async () => {
              await sendPushNotification(pushToken);
            }}
          />
        </ScrollView>
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
  time: {
    color: 'gray',
    fontSize: 12,
  },
  text:{
    color: 'white',
    fontSize: 22,
  },
  chatContainer: {
    backgroundColor: 'rgba(0,0,0, 0.3)',
    padding: 12,
    borderRadius: 18,
    height: '100%',
    width: '100%',
    
  },
  sentMSG: {
    backgroundColor: 'rgba(90,120,90,0.8)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    padding:8,
    borderBottomRightRadius: 0,
    borderRadius: 18,
    
  },
  receivedMSG: {
    backgroundColor: 'rgba(90,90,90,0.8)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    padding:10,
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
    marginTop: 5,
  },
  
  userreceive:{
    fontSize: 10,
    color: 'rgb(150,150,150)',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
 
})