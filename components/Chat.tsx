import { Text, Alert,  StyleSheet, View } from 'react-native'
import React, {useEffect, useState, useRef} from 'react'
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase'
import { ScrollView } from 'react-native';
import { Image } from 'expo-image'
import NullMessage from './NullMessage';

async function sendPushNotification(expoPushToken, content , sender) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: sender,
    body: content,
    data: { someData: 'message' },
  };
  // console.log(message);
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Server responded with status ${response.status}: ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    Alert.alert(error);
  }
}


export default function Chat({pushToken}: {pushToken: string})  {
  const session = useContext(AuthContext);
  const [username, setUsername] = useState('')
  const scrollViewRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
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

  const handleInserts = (payload) => {
    // console.log('Change received!', payload)
    // scrollRef.current?.scrollToEnd({ animated: true });
    setMessages(messages => [...messages, payload.new]);
    // console.log(payload.new.username);
    // console.log(username);
    if (payload.new.username !== username) {
    // console.log('Sending push notification...');
    (async () => {       
      // console.log(pushToken)
      await sendPushNotification(pushToken, payload.new.content, payload.new.username);
    })();
    } // Immediately invoke the async function
    console.log(payload.new);
  }

  
  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
      console.log('scrolling to end');
    }, 100); // adjust the delay as needed
  }, [messages]);

  

    return (
      <View style={styles.container}>
        <ScrollView 
          style={[styles.chatContainer, styles.mb20]} 
          ref={scrollViewRef} 
          // onScroll={event => {
          //   console.log('onScroll event handler called');
          //   const currentScrollPosition = event.nativeEvent.contentOffset.y;
          //   console.log('Current scroll position:', currentScrollPosition);
          // }}
          // scrollEventThrottle={8}
        >
          {messages.length === 0 ? (
            <NullMessage /> // Render your component when messages is empty
          ) : (
            messages.map((message, index) => (
              <View
              key={index}
              style={[styles.messageBox]}
              >
                <Image
                  
                  style={message.username === username ? styles.hidden : styles.image}
                  source={message.Avatar_uri || require('../assets/placeholder.png') }
                />
                <View 
                  
                  style={[
                    styles.verticallySpaced, 
                    message.username === username ? styles.sentMSG : styles.receivedMSG, 
                    styles.mb20
                  ]}
                  >
                  
                  <Text style={message.username === username ? styles.usersent : styles.userreceive}>
                    {message.username}
                  </Text> 
                  <Text style={styles.text}>{message.content}</Text>    
                  <Text style={styles.time}>
                    {
                      isToday(new Date(message.created_at)) 
                      ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })  
                      : new Date(message.created_at).toLocaleDateString()
                    }
                  </Text>   
                </View>
                <Image
                  
                  style={message.username === username ? styles.image : styles.hidden}
                  source={message.Avatar_uri || require('../assets/placeholder.png') }
                />
              </View>
            ))
          )}
          
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
  messageBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    // gap: ,
    alignItems: 'center',
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
  image:{
    width: 50,
    height: 50,
    borderRadius: 50,
    // alignSelf: 'flex-end',
    marginBottom: 5,
  },
  hidden:{
    display: 'none',
  },
  sentMSG: {
    backgroundColor: 'rgba(90,120,90,0.8)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    padding:8,
    display: 'flex',
    width: '80%',
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
    width: '80%',
    flexDirection: 'column',
    justifyContent: 'center',
    
  },
  usersent:{
    fontSize: 10,
    color: 'rgb(150,150,150)',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  
  userreceive:{
    fontSize: 10,
    color: 'rgb(150,150,150)',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
 
})