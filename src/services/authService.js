import { supabase } from '../lib/supabase'
import { apiClient } from './apiClient'

/**
 * Register a new user with email/password.
 * Creates a Supabase Auth user and inserts a profile row.
 */
export async function registerUser(fullName, email, password) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (authError) throw authError

  const user = authData.user
  if (!user) throw new Error('Registration failed. Please try again.')

  // 2. Fetch the newly created profile via Spring Boot API (trigger already created it)
  const profile = await apiClient.get(`/api/profiles/${user.id}`)

  // No error handling needed; profile fetch will throw if fails

  return { authData, profile }
}

/**
 * Sign in an existing user.
 */
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
