"use client";

import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoAddress } from "@/lib/catalog";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-4xl">Settings</h1>
      <div className="mt-8">
        <AccountNav />
      </div>
      <form
        className="mt-10 max-w-lg space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          toast.success("Saved locally — account is a preview.");
        }}
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" className="mt-2" defaultValue={demoAddress.name} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" className="mt-2" defaultValue={demoAddress.phone} />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" className="mt-2" defaultValue={demoAddress.line1} />
        </div>
        <p className="text-sm text-muted-foreground">Payment methods will appear here when checkout is connected.</p>
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" className="ml-2">
          Log out
        </Button>
      </form>
    </div>
  );
}
