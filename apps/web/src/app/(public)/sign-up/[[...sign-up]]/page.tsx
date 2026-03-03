import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <SignUp signInUrl="/sign-in" forceRedirectUrl="/" />
    </div>
  )
}
