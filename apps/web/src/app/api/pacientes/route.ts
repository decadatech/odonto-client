import { NextRequest, NextResponse } from "next/server";
import qs from 'qs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const search = searchParams.get('search')
    const page = Number(searchParams.get('page')) || 1
    const sortOrder = searchParams.get('sort_order')
    const sortBy = searchParams.get('sort_by')

    const params = qs.stringify({
      search,
      page,
      sort_order: sortOrder,
      sort_by: sortBy,
    })

    const url = `${process.env.NEXT_PUBLIC_API_URL}/pacientes?${params}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    // TODO: handle api errors
    console.error(error)
  }
}
