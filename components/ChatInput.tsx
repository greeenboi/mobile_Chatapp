import { View, Text } from 'react-native'
import React, {useState, useEffect} from 'react'
import { StyleSheet, Alert  } from 'react-native'
import { Button, Input} from 'react-native-elements'
import { Icon } from 'react-native-elements';
import { KeyboardAvoidingView } from 'react-native';
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function ChatInput() {
  const session = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('')
  const [id, setId] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [channel, setChannel] = useState('')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, id, avatar_url, channel`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setId(data.id)
        setAvatarUrl(data.avatar_url)
        setChannel(data.channel)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }



  const handleSubmit = async () => {
    if (!content.trim()) {
      // Content is empty or only contains whitespace
      return;
    }
    const payload = {
      content: content,
      profileId: id,
      username: username,
      avatarUri: avatarUrl,
      channel: channel,
    };

    try{
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error } = await supabase
      .from('messages')
      .insert({ 
              profile_id: payload.profileId, 
              content: payload.content, 
              username: payload.username, 
              channel: payload.channel, 
              Avatar_uri: payload.avatarUri  
            })
      .select()
      
      if (error) {
        Alert.alert(error.message)
        throw error
      }
      else {
        Alert.alert('Message Sent!')
      }

    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setContent('');
      setLoading(false)
    }
  };

  const handleTest = () => {
    Alert.alert(avatarUrl)
  }

  return (
    <View style={styles.inputContainer} >
        <Button 
        icon={
              <Icon
            name="send"
            size={15}
            color="white"
          />
        }
        disabled={loading}
        buttonStyle={styles.sendButton}
        disabledStyle={styles.disabledbutton}
        onPress={handleSubmit}
        >Hello</Button>
        <Input placeholder="Type Here..."   inputStyle={[styles.input, {marginTop:10}]} inputContainerStyle={styles.input} value={content} onChangeText={setContent}/>
    </View>
  )
}

const styles = StyleSheet.create({
    
  inputContainer:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'center',
    marginBottom: 0,
    height: 60,
    width: '100%',
    margin: 0,

    gap:0,
    backgroundColor: 'rgba(25,33,29,0.9)',
    
  },
  input:{
    color: 'white',
    width: '82%',
    height: 70,
    marginTop: 0,
    flex:3,
  },
  sendButton:{
    backgroundColor: 'rgba(90, 120, 250, 0.3)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 4,
    height: 60,
    margin: 0,
    width: 60,
    // flex:3,
},
buttonContainer:{  
    color: 'white',
    margin: 0,
    height: 60,
    backgroundColor: 'rgba(90, 120, 250, 0.8)',
    width: 60,
    flex:1,
},
disabledbutton:{
    backgroundColor: 'rgba(90, 120, 250, 0.9)',
    margin: 0,
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 18,
  }
})