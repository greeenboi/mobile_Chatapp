import { useState, useEffect } from 'react'
import Chat from './Chat'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Image } from 'react-native'
import { Button, Input } from 'react-native-elements'
import { Session } from '@supabase/supabase-js'

import * as ImagePicker from 'expo-image-picker';

export default function Profile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    setLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    

    if (!result.canceled) {
      setImage(result.assets[0].uri);

      const fileName = `${username}_image.jpg`

      try {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, result.assets[0].base64, {
            upsert: true,
            contentType: 'image/jpeg',
          });
        if (uploadError) {
          console.error('Error uploading image: ', uploadError);
          Alert.alert('Error uploading image: ', uploadError.message);
        } else {
          const publicUrl = supabase.storage.from('avatars').getPublicUrl(fileName);
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
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
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
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
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




  return (
    
    <View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input label="Email" value={session?.user?.email} style={styles.input} disabled />
        </View>
        <View style={styles.verticallySpaced}>
            <Input label="Username" value={username || ''} style={styles.input} onChangeText={(text) => setUsername(text)} />
        </View>
        <View style={styles.verticallySpaced}>
            <Input label="Website" value={website || ''} style={styles.input} onChangeText={(text) => setWebsite(text)} />
        </View>        

        <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
            title={loading ? 'Loading ...' : 'Update'}
            onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
            disabled={loading}
            buttonStyle={styles.button} 
            containerStyle={styles.button}
            disabledStyle={styles.disabledbutton}
        />
        </View>

        <View style={styles.verticallySpaced}>
            <Button title="Sign Out " onPress={() => supabase.auth.signOut()} buttonStyle={styles.button} containerStyle={styles.button} disabledStyle={styles.disabledbutton}/>
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button title="change profile picture" onPress={pickImage} buttonStyle={styles.button} containerStyle={styles.button} disabledStyle={styles.disabledbutton}/>

            {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        </View>
    </View>
    
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
  mt20: {
    marginTop: 20,
  },
  input:{
    color: 'white',
  },
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