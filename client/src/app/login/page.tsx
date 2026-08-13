import type { Metadata } from "next"
import { ShieldCheck } from "lucide-react"

import { LoginForm } from "@/features/auth/login-form"
import { LoginAccess } from "@/features/auth/login-access"

export const metadata: Metadata = {
  title: "Admin sign in | Doctor Tracker",
  description: "Sign in to the Doctor Tracker administration portal.",
}

export default function LoginPage() {
  return (
    <LoginAccess>
      <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(22rem,0.9fr)_minmax(32rem,1.1fr)]">
      <section className="hidden bg-neutral-950 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="flex items-center gap-3 text-sm font-semibold tracking-wide">
          <span className="flex size-9 items-center justify-center rounded-lg border border-white/15 bg-white/8">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          Doctor Tracker
        </div>

        <div className="max-w-md pb-8">
          <p className="mb-5 text-xs font-semibold tracking-[0.18em] text-neutral-400 uppercase">
            Administration
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.035em] text-balance xl:text-5xl">
            A focused workspace for better care coordination.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-neutral-400">
            Securely manage doctor information from one clear, dependable place.
          </p>
        </div>

        <p className="text-xs text-neutral-500">Authorized administrators only</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[26rem]">
          <div className="mb-10 flex items-center gap-3 text-sm font-semibold text-neutral-950 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-neutral-950 text-white">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            Doctor Tracker
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-500">Admin portal</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-4xl">
              Welcome back
            </h2>
            <p className="mt-3 leading-6 text-neutral-600">
              Enter your administrator credentials to continue.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-xs leading-5 text-neutral-500">
            Access is restricted to approved Doctor Tracker administrators.
          </p>
        </div>
      </section>
      </main>
    </LoginAccess>
  )
}
