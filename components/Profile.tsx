import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Picker } from '@react-native-picker/picker';
import { StyleSheet, View, Alert, Image } from 'react-native'
import { Button, Input, Text } from 'react-native-elements'
import { Session } from '@supabase/supabase-js'
import { ScrollView } from 'react-native'
import { Image as Eimage } from 'expo-image';
import { decode } from "base64-arraybuffer";
import * as ImagePicker from 'expo-image-picker';

export default function Profile({ session, channelName }: { session: Session, channelName: string }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [name, setName] = useState('')
  const [channel, setChannel] = useState( channelName)
  const [channelList, setChannelList] = useState([])
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    
    setLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      
      setImage(result.assets[0].uri);    
      
      if (!result.assets[0].base64) {
        Alert.alert("[uploadToSupabase] ArrayBuffer is null");
        return null;
      }
    
      if (!(result.assets[0].base64.length > 0)) {
        Alert.alert("[uploadToSupabase] base64 string is empty");
        return null;
      }
      
      const res = decode(result.assets[0].base64);
      try {
        const fileName = `${username}_image.jpeg`
        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, res, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'image/jpeg',
          });

        if (!data) {
          Alert.alert("[uploadToSupabase] Data is null");
          return null;
        }

        if (uploadError) {
          console.error('Error uploading image: ', uploadError);
          Alert.alert('Error uploading image: ', uploadError.message);
        } else {
          const publicUrl = supabase.storage.from('avatars').getPublicUrl(fileName);
          if (!publicUrl) {
            Alert.alert("[uploadToSupabase] publicURL is null");
            return null;
          }
          setAvatarUrl(publicUrl.data.publicUrl as string);
        }
      }
      catch (error) {
        console.error('Error uploading image: ', error);
        Alert.alert('Error uploading image: ', error.message);
      }
    }   
    setLoading(false);
    };

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, name,  avatar_url, channel`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
        setChannel(data.channel)
        setName(data.name)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    name,
    avatar_url,
    channel,
  }: {
    username: string
    website: string
    name: string
    avatar_url: string
    channel: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        channel,
        name,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function fetchUniqueChannels() {
      const { data, error } = await supabase
        .from('messages')
        .select('channel')
        
    
      if (error) {
        console.error('Error fetching unique channels: ', error);
        return;
      }
      else if(!error){
        const uniqueChannels = Array.from(new Set(data.map(item => item.channel)));

        setChannelList(uniqueChannels);
        // console.log(uniqueChannels);
        
      }
    
    }
    fetchUniqueChannels();
  }, [])




  return (
    
    <ScrollView>
        <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input label="Email" value={session?.user?.email} style={styles.input} disabled />
        </View>
        <View style={styles.verticallySpaced}>
            <Input label="Username" value={username || ''} style={styles.input} onChangeText={(text) => setUsername(text)} />
        </View>
        <View style={styles.verticallySpaced}>
            <Input label="Website" value={website || ''} style={styles.input} onChangeText={(text) => setWebsite(text)} />
        </View>        
        <View style={styles.verticallySpaced}>
            <Input label="Full Name" value={name || ''} style={styles.input} onChangeText={(text) => setName(text)} />
        </View>    
        <View style={styles.verticallySpaced}>
            <Input label="Create Channel" value={channel || '1010'} style={styles.input} onChangeText={(text) => setChannel(text)} />
        </View>    
        <View style={styles.verticallyHSpaced}>
          <Text style={{ color:'rgba(200,200,200,0.6)', fontSize:18}}>Change Channel</Text>
          <Picker
            selectedValue={channel || '1010'}
            style={styles.picker}
            onValueChange={(itemValue) => setChannel(itemValue)}
            mode="dropdown" // Android only
            prompt="Select a channel" // Android only
          >
            {channelList.map((channel, index) => (
              <Picker.Item key={index} label={channel} value={channel} style={styles.pickerinput} />
            ))}
          </Picker>
        </View>    
        
        <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
            title={loading ? 'Loading ...' : 'Update'}
            onPress={() => updateProfile({ username, website, name,  avatar_url: avatarUrl, channel})}
            disabled={loading}
            buttonStyle={styles.button} 
            containerStyle={styles.button}
            disabledStyle={styles.disabledbutton}
        />
        </View>

        <View style={styles.verticallySpaced}>
            <Button title="Sign Out " onPress={() => supabase.auth.signOut()} buttonStyle={styles.button} containerStyle={styles.button} disabledStyle={styles.disabledbutton}/>
        </View>

        {/* <View style={  styles.verticallySpaced}>
          <Eimage source={avatarUrl} style={{ width: 400, height: 400 }} />
        </View> */}

        <View style={[styles.verticallySpaced, styles.mt20, styles.imageBox]}>
            {image ? <Image source={{ uri: image }} style={{ width: 200, height: 200 }} /> : <Eimage source={avatarUrl ? {uri: avatarUrl} : require('../assets/placeholder.png')} style={{ width: 300, height: 300 , borderRadius: 20 }} />}
            <Button title="change profile picture" onPress={pickImage} buttonStyle={styles.button} containerStyle={styles.button} disabledStyle={styles.disabledbutton}/>
        </View>
    </ScrollView>
    
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    backgroundColor: 'rgba(0,0,0, 0.3)',
    marginHorizontal: 12,
    borderRadius: 18,
    color: 'white',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  verticallyHSpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  imageBox:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: '100%',
  },
  picker: {
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    fontSize: 22,
    backgroundColor:'transparent'
  },
  pickerinput: {
    color: 'black',
    fontSize: 22,
  },
  input:{
    color: 'white',
  },
  button:{
    backgroundColor: 'rgba(108, 79, 247, 0.3)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 24,
    
  },
  disabledbutton:{
    backgroundColor: 'rgba(108, 79, 247, 0.9)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 18,
  }
})