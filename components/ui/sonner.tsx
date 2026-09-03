"use client";

import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        className:
          "!rounded-none !border-border !bg-background !text-foreground !shadow-none",
      }}
    />
  );
}

export { Toaster };
