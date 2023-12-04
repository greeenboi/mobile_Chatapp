import React, { useState } from 'react'
import { Alert, StyleSheet, View, Text } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Image, Input } from 'react-native-elements'
import { ScrollView } from 'react-native';


export default function Auth() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentOtp, setSentOtp] = useState(false)
  

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ 
      email, 
      options: {        
          shouldCreateUser: false, 
      },
   })

    if (error) Alert.alert(error.message)
    else {
      Alert.alert('Check your email for the OTP!')
      setSentOtp(true)
    }
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ 
      email, 
      options: {        
          shouldCreateUser: true, 
      },
   })

    if (error) Alert.alert(error.message)
    else {
      Alert.alert('Check your email for the OTP!')
      setSentOtp(true)
    }
    setLoading(false)
  }

  async function loginWithOtp(){
    setLoading(true)    
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })
    if (error) {
        Alert.alert(error.message)
    }
    else{
      Alert.alert('Logged in!')
    }
    setLoading(false)
  }

  return (
    <View style={{ display:'flex', flexDirection:"column"}}>
    {/* <Image style={{flex:2 }} source={require('../assets/layer.png')}  resizeMode='contain'/>  */}
    
    <View style={styles.container}>
      
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope', color: 'gray'  }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          style={styles.input}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} buttonStyle={styles.button} containerStyle={styles.button} disabledStyle={styles.disabledbutton} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} buttonStyle={styles.button} containerStyle={styles.button} disabledStyle={styles.disabledbutton} />
      </View>
      
      {sentOtp ? (
        <>
          <View style={styles.verticallySpaced}>
            <Input
              label="number"
              leftIcon={{ type: 'font-awesome', name: 'key', color: 'gray' }}
              onChangeText={(e) => setOtp(e)}
              value={otp}
              secureTextEntry={false}
              placeholder="Otp"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Button title="Log In" disabled={loading} onPress={() => loginWithOtp()} buttonStyle={styles.button} containerStyle={styles.button} disabledStyle={styles.disabledbutton} />
          </View>
        </>
      ) : null}
    </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // marginTop: 40,
    padding: 12,
    backgroundColor: 'rgba(0,0,0, 0.3)',
    marginHorizontal: 12,
    borderRadius: 18,
    display: 'flex',
    flexDirection: 'column',

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