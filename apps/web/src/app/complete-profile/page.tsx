import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

import { getCurrentDomainUserAction } from "@/app/actions/users"
import { CompleteProfileForm } from "./complete-profile-form"

export default async function CompleteProfilePage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const currentDomainUser = await getCurrentDomainUserAction()

  if (currentDomainUser.exists) {
    redirect("/")
  }

  return <CompleteProfileForm displayName={user.fullName ?? ""} />
}
