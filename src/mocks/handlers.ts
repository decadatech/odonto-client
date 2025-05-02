import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post<never, { email: string; password: string }>(
    `${process.env.NEXT_PUBLIC_API_URL}/login`,
    async ({ request }) => {
      await delay(1000)

      const { email, password } = await request.json()

      // Mock successful login
      if (email === 'test@example.com' && password === 'password') {
        return HttpResponse.json({
        token: 'mock-jwt-token',
      })
    }
    
    // Mock invalid credentials
    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized'
    })
  }),
]
