"use client";

import Header from "../../components/Header";
import { LoginForm } from "@/components/LoginForm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/cars");
    }
  }, [user, router]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex flex-1 justify-center items-center p-10 max-sm:p-5">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
