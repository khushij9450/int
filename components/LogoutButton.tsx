"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    startTransition(async () => {
      try {
        await signOut();
        // The redirect in the signOut action will handle navigation
      } catch (error: any) {
        // Check if the error is a NEXT_REDIRECT error (caused by redirect in signOut)
        if (error.message === "NEXT_REDIRECT") {
          // This is expected behavior; the redirect is happening
          return;
        }
        // Handle other errors
        console.error("Logout failed:", error);
        alert("Failed to log out. Please try again.");
      }
    });
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      className="btn-primary max-sm:w-full"
    >
      {isPending ? "Logging Out..." : "Log Out"}
    </Button>
  );
}