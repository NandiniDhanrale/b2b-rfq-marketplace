"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SupplierSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);

    const query = params.toString();
    router.push(query ? `/supplier/rfqs?${query}` : "/supplier/rfqs");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
      <Input
        label="Search"
        name="search"
        placeholder="Product, service, or description"
        defaultValue={searchParams.get("search") ?? ""}
      />
      <Input
        label="Delivery location"
        name="location"
        placeholder="e.g. Pune"
        defaultValue={searchParams.get("location") ?? ""}
      />
      <div className="flex items-end">
        <Button type="submit" className="w-full sm:w-auto">Search</Button>
      </div>
    </form>
  );
}
