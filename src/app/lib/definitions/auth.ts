import { z } from 'zod'
 
export const SignInFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }).trim(),
  password: z.string().min(1, { message: 'Por favor, insira a sua senha.' }).trim(),
})
 
export type SignInFormState =
  | {
      errors?: {
        email?: string[]
        password?: string[]
      }
      values?: {
        email: string
        password: string
      }
      message?: string
    }
  | undefined
