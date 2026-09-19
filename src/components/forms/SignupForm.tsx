"use client";

import { useState, useTransition } from "react";
import { signupAction } from "@/lib/actions/auth";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { getErrorMessage } from "@/lib/errors";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await signupAction(formData);

        const email = String(formData.get("email"));
        const password = String(formData.get("password"));
        const role = String(formData.get("role"));

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Account created but login failed. Please log in manually.");
          return;
        }

        window.location.href = role === "BUYER" ? "/buyer/rfqs" : "/supplier/rfqs";
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <Input label="Name" name="name" required autoComplete="name" />
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input label="Password" name="password" type="password" required autoComplete="new-password" />
      <Input label="Confirm password" name="confirmPassword" type="password" required autoComplete="new-password" />
      <Select
        label="Role"
        name="role"
        required
        defaultValue=""
        options={[
          { value: "", label: "Select your role" },
          { value: "BUYER", label: "Buyer" },
          { value: "SUPPLIER", label: "Supplier" },
        ]}
      />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating account..." : "Sign up"}
      </Button>
    </form>
  );
}
