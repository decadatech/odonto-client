import Link from 'next/link'
import { Loader2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

export default function SignIn() {
  // Server Action
  const handleLogin: React.FormEventHandler<HTMLFormElement> = async (e) => {
    'use server'

    console.log('handleLogin', e)
  }

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
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ola@examplo.com"
                      autoComplete="off"
                      required
                    />
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

                    <Input id="password" type="password" required />
                  </div>

                  <Button type="submit" className="w-full" disabled>
                    <Loader2 className="animate-spin" />
                    Entrar
                  </Button>

                  {/* <Button variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Entrar com Google
                  </Button> */}
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
