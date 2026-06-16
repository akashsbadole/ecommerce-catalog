import { SignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <SignedIn>
          {/* If already signed in, redirect to dashboard */}
          {redirect("/admin/dashboard")}
        </SignedIn>
        <SignedOut>
          <SignIn
            routing="hash"
            fallbackRedirectUrl="/admin/dashboard"
            signUpUrl="/register"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
                footerActionLink: 'text-emerald-600 hover:text-emerald-700'
              }
            }}
          />
        </SignedOut>
      </div>
    </div>
  );
}
