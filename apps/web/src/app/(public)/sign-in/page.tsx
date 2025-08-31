'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from "sonner"
import { Loader2 } from 'lucide-react'

import { signIn } from '@/app/actions/auth'
import type { SignInFormState } from '@/app/lib/definitions/auth'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

export default function SignIn() {
  const [state, action, pending] = useActionState<SignInFormState, FormData>(signIn, undefined)

  useEffect(() => {
    if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">Bem-vindo de volta</CardTitle>

              <CardDescription className='text-center'>
                Faça login com seu e-mail com sua conta Google
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form action={action}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="text"
                      placeholder="ola@examplo.com"
                      autoComplete="off"
                      defaultValue={state?.values?.email}
                      tabIndex={1}
                    />
                    {state?.errors?.email && (
                      <p className="text-sm text-destructive">{state.errors.email[0]}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Senha</Label>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Esqueceu sua senha?
                      </Link>
                    </div>

                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      defaultValue={state?.values?.password}
                      tabIndex={2}
                    />
                    {state?.errors?.password && (
                      <p className="text-sm text-destructive">{state.errors.password[0]}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={pending} tabIndex={3}>
                    {pending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm">
                  Não tem uma conta?{" "}
                  <Link href="#" className="underline underline-offset-4">
                    Cadastre-se
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
