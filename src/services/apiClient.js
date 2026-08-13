import { supabase } from '../lib/supabase'

// Base URL from environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/*$/, '') // remove trailing slash
if (!BASE_URL) {
  throw new Error('❌ VITE_API_BASE_URL is not defined. Please set it in your .env file.')
}

/**
 * Retrieves the current JWT access token from Supabase Auth.
 * Returns null if no session is present.
 */
async function getAccessToken() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Failed to get Supabase session:', error)
    return null
  }
  return session?.access_token || null
}

/**
 * Core request helper.
 * method: HTTP method string
 * path: endpoint path starting with '/' (will be appended to BASE_URL)
 * body: optional payload for POST/PUT
 */
async function request(method, path, body = null) {
  const token = await getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const options = {
    method,
    headers,
  }
  if (body !== null) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, options)

  // 204 No Content – return null
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  let responseData = null
  if (contentType.includes('application/json')) {
    responseData = await response.json()
  } else {
    responseData = await response.text()
  }

  if (!response.ok) {
    const errorMessage = responseData && responseData.message ? responseData.message : response.statusText
    const err = new Error(errorMessage)
    err.status = response.status
    err.body = responseData
    throw err
  }

  return responseData
}

export const apiClient = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}
