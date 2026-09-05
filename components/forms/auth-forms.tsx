"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerLogin, customerRegister } from "@/lib/auth/customer-actions";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Use at least 6 characters"),
});

export function LoginForm() {
  const [visible, setVisible] = React.useState(false);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to track orders and check out faster.">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          const result = await customerLogin(values.email, values.password);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Signed in");
          const next =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("next")
              : null;
          router.push(next || "/account");
          router.refresh();
        })}
      >
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={form.formState.errors.email?.message}
          register={form.register}
        />
        <PasswordField
          error={form.formState.errors.password?.message}
          register={form.register}
          visible={visible}
          setVisible={setVisible}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="underline-offset-4 hover:underline">
            Forgot password
          </Link>
          {" · "}
          <Link href="/register" className="underline-offset-4 hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}

const registerSchema = loginSchema.extend({
  name: z.string().min(1, "Enter your name"),
  phone: z.string().min(10, "Enter a valid phone").optional().or(z.literal("")),
});

export function RegisterForm() {
  const [visible, setVisible] = React.useState(false);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", phone: "" },
    mode: "onBlur",
  });

  return (
    <AuthFrame title="Create an account" subtitle="Save addresses, track orders, and checkout securely.">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          const result = await customerRegister({
            name: values.name,
            email: values.email,
            password: values.password,
            phone: values.phone || undefined,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Account created");
          router.push("/account");
          router.refresh();
        })}
      >
        <Field id="name" label="Name" autoComplete="name" error={form.formState.errors.name?.message} register={form.register} />
        <Field id="email" label="Email" type="email" autoComplete="email" error={form.formState.errors.email?.message} register={form.register} />
        <Field id="phone" label="Phone" type="tel" autoComplete="tel" error={form.formState.errors.phone?.message} register={form.register} />
        <PasswordField
          error={form.formState.errors.password?.message}
          register={form.register}
          visible={visible}
          setVisible={setVisible}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already a client?{" "}
          <Link href="/login" className="underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}

const emailSchema = z.object({ email: z.string().email("Enter a valid email") });

export function ForgotForm() {
  const form = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const [sent, setSent] = React.useState(false);

  if (sent) {
    return (
      <AuthFrame title="Check your inbox" subtitle="If an account exists, reset instructions will arrive shortly.">
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Return to sign in</Link>
        </Button>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Reset password" subtitle="Password reset email is not enabled yet — contact support if locked out.">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async () => {
          setSent(true);
        })}
      >
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={form.formState.errors.email?.message}
          register={form.register}
        />
        <Button type="submit" className="w-full">
          Send link
        </Button>
      </form>
    </AuthFrame>
  );
}

const resetSchema = z
  .object({
    password: z.string().min(8, "Use at least eight characters"),
    confirm: z.string().min(8),
  })
  .refine((value) => value.password === value.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export function ResetForm() {
  const [visible, setVisible] = React.useState(false);
  const form = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm: "" },
  });

  return (
    <AuthFrame title="Choose a new password" subtitle="Password reset is not connected yet.">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async () => {
          toast.message("Password reset is not available yet.");
        })}
      >
        <PasswordField
          error={form.formState.errors.password?.message}
          register={form.register}
          visible={visible}
          setVisible={setVisible}
        />
        <Field
          id="confirm"
          label="Confirm"
          type={visible ? "text" : "password"}
          error={form.formState.errors.confirm?.message}
          register={form.register}
        />
        <Button type="submit" className="w-full">
          Update password
        </Button>
      </form>
    </AuthFrame>
  );
}

function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="text-center font-serif text-4xl tracking-[0.04em]">Abeera</p>
      <h1 className="mt-10 font-serif text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  error,
  register,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  register: ReturnType<typeof useForm>["register"];
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} className="mt-2" autoComplete={autoComplete} {...register(id)} />
      {error ? (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PasswordField({
  visible,
  setVisible,
  error,
  register,
}: {
  visible: boolean;
  setVisible: (value: boolean) => void;
  error?: string;
  register: ReturnType<typeof useForm>["register"];
}) {
  return (
    <div>
      <Label htmlFor="password">Password</Label>
      <div className="relative mt-2">
        <Input
          id="password"
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          className="pr-12"
          {...register("password")}
        />
        <button
          type="button"
          className="absolute top-0 right-0 flex h-12 w-12 items-center justify-center"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
