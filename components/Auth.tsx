import React, { useEffect, useRef, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from 'react-native-elements'
import { Image } from 'expo-image'



export default function Auth() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentOtp, setSentOtp] = useState(false)

  const otpInputRef = useRef(null);

  useEffect(() => {
    if (sentOtp && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [sentOtp]);
  

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
    
      <View style={[styles.verticallySpaced,styles.mt20, styles.imagecontainer]}>
        <Image source={require('../assets/logo_text.svg')} style={sentOtp ? styles.smallImage : styles.largeImage}  />
      </View>
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
      <View style={[styles.verticallySpaced, styles.mt20, styles.buttonContainer]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} buttonStyle={styles.button} containerStyle={styles.buttonBox} disabledStyle={styles.disabledbutton} />
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} buttonStyle={styles.button} containerStyle={styles.buttonBox} disabledStyle={styles.disabledbutton} />
      </View>

      
      
      {sentOtp ? (
        <>
          <View style={styles.verticallySpaced}>
            <Input
              ref={otpInputRef}
              label="OTP"
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
  smallImage:{
    width: 200, 
    height: 370
  },
  largeImage:{
    width: 211, 
    height: 375
  },
  imagecontainer:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonContainer:{
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    // justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 2,
  },
  button:{
    backgroundColor: 'rgba(108, 79, 247, 0.3)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 24,
    width: '100%',
  },
  buttonBox:{
    width: '50%',
  },
  disabledbutton:{
    backgroundColor: 'rgba(108, 79, 247, 0.9)',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 18,
  }
})