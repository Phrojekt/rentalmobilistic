"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from 'firebase/app';
import { userService } from "@/services/userService";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await userService.register(
        formData.email,
        formData.password,
        formData.fullName
      );
      router.push('/login');
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof FirebaseError && err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError('This email is already in use by another account.');
            break;
          case 'auth/invalid-email':
            setError('The provided email is invalid.');
            break;
          case 'auth/operation-not-allowed':
            setError('Registration with email and password is not enabled.');
            break;
          case 'auth/weak-password':
            setError('The password must be at least 6 characters.');
            break;
          default:
            setError(err.message || 'Error creating account. Please try again.');
        }
      } else {
        setError('Error creating account. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[500px] h-auto p-6 flex-col items-center gap-5 rounded-lg border-[0.75px] border-[#676773] bg-white max-sm:w-[99vw] max-sm:mx-auto"
    >
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-black font-geist text-3xl font-bold whitespace-nowrap max-sm:text-2xl max-sm:whitespace-nowrap">
          Create a Account
        </h1>
        <p className="text-[#676773] font-inter text-base max-sm:text-sm max-sm:whitespace-normal">
          Fill in the fields below to register on the platform
        </p>
      </div>

      {error && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col w-full gap-2">
        {[
          {
            label: "Full name",
            type: "text",
            name: "fullName",
            value: formData.fullName,
            placeholder: "Your full name",
          },
          {
            label: "Email",
            type: "email",
            name: "email",
            value: formData.email,
            placeholder: "example@email.com",
          },
          {
            label: "Password",
            type: "password",
            name: "password",
            value: formData.password,
            placeholder: "********",
          },
          {
            label: "Confirm Password",
            type: "password",
            name: "confirmPassword",
            value: formData.confirmPassword,
            placeholder: "********",
          },
        ].map((field) => (
          <div key={field.name} className="flex flex-col gap-2 max-sm:gap-1.5">
            <label
              htmlFor={field.name}
              className="text-black font-geist text-sm font-bold"
            >
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={field.value}
              onChange={handleChange}
              className="h-[41px] w-full rounded-lg border-[0.75px] border-[#676773] bg-[#F8FAFC] px-3 placeholder-[#3F3F46] text-[#222] transition-colors placeholder:text-sm"
              required
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="h-[34px] w-full hover:cursor-pointer rounded bg-[#EA580C] text-white font-inter text-base font-bold transition-colors duration-200 hover:bg-[#c94a08] focus:bg-[#c94a08] active:bg-[#a53d06]"
      >
        Register
      </button>

      <p className="text-center text-black text-sm font-geist max-sm:text-xs">
        By registering, you agree to our{" "}
        <Link href="#" className="font-bold underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="font-bold underline">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="text-center text-sm text-black font-geist max-sm:text-xs">
        Already have an account?{" "}
        <Link href="/login" className="text-[#EA580C] underline cursor-pointer">
          Log in
        </Link>
      </p>
    </form>
  );
}
