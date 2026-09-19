import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          B2B RFQ Marketplace
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              {session.user.role === "BUYER" ? (
                <>
                  <Link href="/buyer/rfqs" className="text-slate-700 hover:text-slate-900">
                    My RFQs
                  </Link>
                  <Link href="/buyer/rfqs/new" className="text-slate-700 hover:text-slate-900">
                    Create RFQ
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/supplier/rfqs" className="text-slate-700 hover:text-slate-900">
                    Marketplace
                  </Link>
                  <Link href="/supplier/quotations" className="text-slate-700 hover:text-slate-900">
                    My Quotations
                  </Link>
                </>
              )}
              <span className="hidden text-slate-500 sm:inline">{session.user.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <Button type="submit" variant="secondary" size="sm">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-700 hover:text-slate-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
