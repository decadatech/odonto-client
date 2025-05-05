import { http, HttpResponse, delay } from 'msw'
import { faker } from '@faker-js/faker'

const MOCK_PATIENTS = Array.from({ length: 75 }, () => ({
  id: faker.string.uuid(),
  nome: faker.person.fullName(),
  cpf: faker.string.numeric(11),
  telefone: `11${faker.string.numeric(9)}`,
  prontuario: faker.string.numeric(11),
  email: faker.internet.email(),
}))

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
    }
  ),

  // TODO: simulate api errors
  http.get(`${process.env.NEXT_PUBLIC_API_URL}/patients`, async ({ request }) => {
    await delay(1000)

    const url = new URL(request.url)

    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '15')
    const sortBy = url.searchParams.get('sort_by')
    const sortOrder = url.searchParams.get('sort_order')

    const filteredPatients = MOCK_PATIENTS.filter(patient => 
      patient.nome.toLowerCase().includes(search?.toLowerCase() || '')
    )

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex)

    if (sortBy && sortOrder) {
      paginatedPatients.sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a]
        const bValue = b[sortBy as keyof typeof b]

        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue)
        } else {
          return bValue.localeCompare(aValue) 
        }
      })
    }

    return HttpResponse.json({
      data: paginatedPatients,
      pagination: {
        total: filteredPatients.length,
        page,
        items_per_page: limit,
      }
    })
  }),
]
