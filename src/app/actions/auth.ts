"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SignInFormSchema, type SignInFormState } from "../lib/definitions/auth"

import { AUTH_TOKEN_NAME } from "@/constants/AUTH_TOKEN_NAME"

export async function signIn(
  _state: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const validatedFields = SignInFormSchema.safeParse({
    email,
    password,
  })
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: {
        email,
        password: "", // Don't return password for security
      }
    }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: validatedFields.data.email,
      password: validatedFields.data.password
    })
  })

  if (!response.ok) {
    return {
      message: "Credenciais inválidas. Por favor, tente novamente.",
      values: {
        email,
        password: ""
      }
    }
  }

  const { token } = await response.json()

  const cookieStore = await cookies()
  
  const ONE_HOUR = 60 * 60

  cookieStore.set(AUTH_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_HOUR
  })

  redirect("/")
}

export async function logout() {
  const cookieStore = await cookies()
  
  cookieStore.delete(AUTH_TOKEN_NAME)

  redirect('/sign-in')
}
