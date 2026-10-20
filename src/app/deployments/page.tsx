import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { CustomerWorkerConsole } from "@/components/deployments/customer-worker-console";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer Worker Deployments | Lakehouse Architect",
  description: "Deploy and manage isolated customer Workers using Cloudflare Workers for Platforms.",
  robots: { index: false, follow: false },
};

export default async function DeploymentsPage() {
  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
  if (!clerkConfigured) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">
            Workers for Platforms
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
            Isolated customer deployments
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Configure Clerk keys and the Cloudflare Worker settings in the deployment environment
            to enable customer deployments.
          </p>
        </header>
      </div>
    );
  }

  const { userId } = await auth();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">
          Workers for Platforms
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          Isolated customer deployments
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
          Publish an ES module as its own Cloudflare Worker. Your signed-in account can only
          deploy, list, or remove its own workers.
        </p>
        <a
          className="mt-3 inline-flex text-sm text-blue-500 hover:underline"
          href="https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Workers for Platforms documentation
        </a>
      </header>

      {userId ? (
        <CustomerWorkerConsole />
      ) : (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Sign in to manage deployments</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Each account gets a separate namespace of worker names. Your code runs on Cloudflare,
            not in this application.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <SignInButton mode="modal">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--surface-2)]">
                Create account
              </button>
            </SignUpButton>
          </div>
        </section>
      )}
    </div>
  );
}
