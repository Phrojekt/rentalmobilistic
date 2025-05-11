"use client";

import { useState } from "react";
import Link from "next/link";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
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
      className="flex w-[500px] h-auto p-6 flex-col items-center gap-5 rounded-lg border-[0.75px] border-[#676773] bg-white max-sm:w-full"
    >
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-black font-geist text-3xl font-bold">
          Create a Account
        </h1>
        <p className="text-[#676773] font-inter text-base">
          Fill in the fields below to register on the platform
        </p>
      </div>

      <div className="flex flex-col w-full gap-2">
        {[
          {
            label: "Full name",
            type: "text",
            name: "fullName",
            value: formData.fullName,
          },
          {
            label: "Email",
            type: "email",
            name: "email",
            value: formData.email,
          },
          {
            label: "Password",
            type: "password",
            name: "password",
            value: formData.password,
          },
          {
            label: "Confirm Password",
            type: "password",
            name: "confirmPassword",
            value: formData.confirmPassword,
          },
        ].map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
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
              className="h-[41px] w-full rounded-lg border-[0.75px] border-[#676773] bg-[#F8FAFC] px-3"
              required
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="h-[34px] w-full rounded bg-[#EA580C] text-white font-inter text-base font-bold"
      >
        Register
      </button>

      <p className="text-center text-sm font-geist">
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

      <p className="text-center text-sm font-geist">
        Already have an account?{" "}
        <Link href="/login" className="text-[#EA580C] underline cursor-pointer">
          Log in
        </Link>
      </p>
    </form>
  );
}
