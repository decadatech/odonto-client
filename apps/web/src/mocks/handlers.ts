import { http, HttpResponse, delay } from 'msw'
import { faker } from '@faker-js/faker'

const MOCK_PATIENTS = Array.from({ length: 75 }, () => ({
  id: faker.string.uuid(),
  nome: faker.person.fullName(),
  rg: faker.string.numeric(9),
  telefone: `11${faker.string.numeric(9)}`,
  email: faker.internet.email(),
}))

export const handlers = [
  // TODO: simulate api errors
  http.get(`${process.env.NEXT_PUBLIC_API_URL}/pacientes`, async ({ request }) => {
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
