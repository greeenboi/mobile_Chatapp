import { Text, Button,  StyleSheet, View } from 'react-native'
import React, {useEffect, useState} from 'react'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import Home from './Home'
export default function Chat({ session: { session: Session } })  {
  

    return (
      <View style={styles.container}>
        <Text style={{color:"#000"}}>hello</Text>
      </View>
    )

}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
})