import { Text, Alert,  StyleSheet, View } from 'react-native'
import React, {useEffect, useState, useRef} from 'react'
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase'
import { ScrollView } from 'react-native';


export default function Chat({ session: { session: Session } })  {
  const session = useContext(AuthContext);
  const id = session.user.id; 
  const [username, setUsername] = useState('')
  const scrollRef = useRef<ScrollView>();
  
  const [channel, setChannel] = useState('');
  const [messages, setMessages] = useState([]);


  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]); 

  // useEffect(() => {
  //   fetchInitialMessages();
  //   const subscription = supabase
  //     .channel(session.channel)
  //     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Messages' }, payload => {
  //       console.log('Change received!', payload)
  //     })
  //     .subscribe();
  
      
  // }, []);
  
  useEffect(() => {
    fetchInitialMessages();

    const subscription = supabase
      .channel(channel) 
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleInserts)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleInserts = (payload) => {
    console.log('Change received!', payload)
    scrollRef.current?.scrollToEnd({ animated: true });
    setMessages(messages => [...messages, payload.new]);
  }

  async function fetchInitialMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel', channel)
      .order('created_at', { ascending: true })
      .range(0,49)
  
    if (error) {
      console.error(error);
      return;
    }
  
    setMessages(data || []);
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
        throw error
      }

      if (data) {
        setUsername(data.username)
        setChannel(data.channel)
      
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } 
  }

  



    return (
      <View style={styles.container}>
        <ScrollView style={[styles.chatContainer, styles.mb20]} ref={scrollRef} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            
            {messages.map((message, index) => (
              <View 
                key={index} 
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
              </View>
            ))}
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
  },

  userreceive:{
    fontSize: 10,
    color: 'rgb(150,150,150)',
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
 
})