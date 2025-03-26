"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";

// Define the FormType type
type FormType = "sign-up" | "sign-in";

// Define the schema dynamically based on the form type
const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3, "Name must be at least 3 characters") : z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(3, "Password must be at least 3 characters"),
  });
};

// Define the props type for the component
interface AuthFormProps {
  type: FormType;
}

const AuthForm = ({ type }: AuthFormProps) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);

  // Initialize the form with react-hook-form and zod
  const form = useForm<z.infer<ReturnType<typeof authFormSchema>>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Handle form submission
  function onSubmit(values: z.infer<ReturnType<typeof authFormSchema>>) {
    try {
      if (type === "sign-up") {
        toast.success("Account created successfully. Please Sign-in.");
        router.push("/sign-in");
      } else {
        toast.success("Sign-in successful");
        router.push("/");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(`There was an error: ${error.message || error}`);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} priority />
          <h2 className="text-primary-100">Prepwise</h2>
        </div>
        <h3>Practice Job Interview with AI</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter Your Password"
              type="password"
            />
            <Button className="btn" type="submit">
              {isSignIn ? "Sign in" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link href={!isSignIn ? "/sign-in" : "/sign-up"} className="font-bold text-user-primary ml-1">
            {!isSignIn ? "Sign-In" : "Sign-Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;