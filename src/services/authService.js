import { supabase } from '../lib/supabase'

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

  // 2. Insert profile row (RLS: only the owner can insert their own row)
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    full_name: fullName,
    email: email,
    role: 'USER',
  })

  if (profileError) {
    // Non-fatal: profile may already exist if email confirmation is disabled
    console.warn('Profile insert warning:', profileError.message)
  }

  return authData
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
