"use client";

import Header from "../../components/Header";
import { RegisterForm } from "@/components/RegisterForm";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex flex-1 justify-center items-center p-10 max-sm:p-5">
        <RegisterForm />
      </main>
      <Footer />
    </div>
  );
}
