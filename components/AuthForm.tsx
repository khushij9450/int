"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-grid"></div>
        <div className="auth-orbs">
          <div className="auth-orb auth-orb-1"></div>
          <div className="auth-orb auth-orb-2"></div>
          <div className="auth-orb auth-orb-3"></div>
        </div>
      </div>
      
      <div className="auth-card">
        <div className="auth-card-glow"></div>
        <div className="auth-content">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-glow-auth">
                <Image src="/logo.svg" alt="logo" height={40} width={48} />
              </div>
            </div>
            <h1 className="auth-title">
              <span className="prep-auth">PREP</span>
              <span className="wise-auth">WISE</span>
            </h1>
            <p className="auth-subtitle">AI-Powered Interview Intelligence</p>
          </div>

          <div className="auth-form-section">
            <h2 className="form-title">
              {isSignIn ? "Access Neural Network" : "Initialize New Profile"}
            </h2>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="cyber-form"
              >
                {!isSignIn && (
                  <FormField
                    control={form.control}
                    name="name"
                    label="Identity Designation"
                    placeholder="Enter your name"
                    type="text"
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  label="Neural Access Key"
                  placeholder="Enter your email address"
                  type="email"
                />

                <FormField
                  control={form.control}
                  name="password"
                  label="Security Protocol"
                  placeholder="Enter your password"
                  type="password"
                />

                <Button className="cyber-submit-btn" type="submit">
                  <div className="btn-bg-auth"></div>
                  <span className="btn-text-auth">
                    {isSignIn ? "Initialize Connection" : "Create Neural Profile"}
                  </span>
                  <div className="btn-glow-auth"></div>
                </Button>
              </form>
            </Form>

            <div className="auth-switch">
              <p className="switch-text">
                {isSignIn ? "No neural profile detected?" : "Profile already exists?"}
              </p>
              <Link
                href={!isSignIn ? "/sign-in" : "/sign-up"}
                className="switch-link"
              >
                {!isSignIn ? "Access Existing Profile" : "Create New Profile"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;