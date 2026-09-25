import client from './client'
import { isMock, delay, maybeError } from '../../mocks/helpers'
import { mockLogin } from '../../mocks/fixtures'

export const authApi = {
  login: async (username: string, password: string) => {
    if (isMock()) {
      await delay(400)
      if (maybeError(0.05)) throw { message: 'Invalid credentials' }
      return mockLogin(username)
    }
    const { data } = await client.post('/auth/login', { username, password })
    return {
      user: { id: username, name: username, role: data.role },
      token: data.access_token,
    }
  },
  me: async () => {
    if (isMock()) {
      await delay(200)
      return { user: { id: '1', name: 'Inspector Arjun', role: 'admin' } }
    }
    const { data } = await client.get('/auth/me')
    return { user: { id: data.id, name: data.username, role: data.role } }
  },
}