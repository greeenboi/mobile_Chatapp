import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from 'react-native-elements'

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
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>
      
      {sentOtp ? (
        <>
          <View style={styles.verticallySpaced}>
            <Input
              label="number"
              leftIcon={{ type: 'font-awesome', name: 'lock' }}
              onChangeText={(e) => setOtp(e)}
              value={otp}
              secureTextEntry={false}
              placeholder="Otp"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Button title="Sign up" disabled={loading} onPress={() => loginWithOtp()} />
          </View>
        </>
      ) : null}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})