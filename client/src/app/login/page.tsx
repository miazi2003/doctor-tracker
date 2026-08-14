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
      <main className="dark grid min-h-screen bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.045),transparent_28%),#070908] text-neutral-100 lg:grid-cols-[minmax(22rem,0.9fr)_minmax(32rem,1.1fr)]">
      <section className="hidden border-r border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.06),transparent_30%),#0a0c0b] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
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
          <div className="mb-10 flex items-center gap-3 text-sm font-semibold text-neutral-100 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-white">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            Doctor Tracker
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-500">Admin portal</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Welcome back
            </h2>
            <p className="mt-3 leading-6 text-neutral-400">
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
