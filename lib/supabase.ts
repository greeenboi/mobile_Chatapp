import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ocycfgjdzmkjttxgpvc.supabase.co"
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jeWNmZ2pkem1ranR0eGdwdHZjIiwicm9sZSI6ImFub24iLCJpYXQOjE3MDEyODUxNTAsImV4cCI6MjAxNjg2MTE1MH0.qmVmF8oMpuk03A6GIDLZNP7Knm5ls6dzP66KmlgxgtY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
