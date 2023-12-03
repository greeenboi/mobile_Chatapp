import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import { Button, Input } from 'react-native-elements'
import { Icon } from 'react-native-elements';
import { KeyboardAvoidingView } from 'react-native';


export default function ChatInput() {
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
        buttonStyle={styles.sendButton}
        disabledStyle={styles.disabledbutton}
        >Hello</Button>
        <Input label="Type Here..."  inputStyle={styles.input} inputContainerStyle={styles.input} />
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
    height: 50,
    margin: 0,
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