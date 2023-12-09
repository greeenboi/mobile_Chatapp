import React from 'react'
import { Image } from 'react-native'
import { View, Text,  } from 'react-native'
import { StyleSheet } from 'react-native'
export default function NullMessage() {
  return (
    <View style={{display:'flex', flexDirection:'column', alignItems:'center', height:'auto'}}>
        <Text style={styles.text}>No messages yet</Text>
        <Image source={require('../assets/empty.png')} style={styles.image}/>
        <Text style={styles.text}>You can be the first</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    image:{
        width: 80,
        height: 80,
        marginVertical: 40,
    },
    text:{
        color: 'white',
        fontSize: 28,
        marginVertical: 40,
    }
})

