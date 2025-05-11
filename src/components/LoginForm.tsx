"use client";

import { useState } from "react";
import Link from "next/link";

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[500px] h-auto p-6 flex-col items-center gap-5 rounded-lg border-[0.75px] border-[#676773] bg-white max-sm:w-full"
    >
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-black font-geist text-3xl font-bold">
          Log in to your account
        </h1>
        <p className="text-[#676773] font-inter text-base">
          Enter your email and password to access your account
        </p>
      </div>

      <div className="flex flex-col w-full gap-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-black font-geist text-sm font-bold"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="h-[41px] w-full rounded-lg border-[0.75px] border-[#676773] bg-[#F8FAFC] px-3"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-black font-geist text-sm font-bold"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="h-[41px] w-full rounded-lg border-[0.75px] border-[#676773] bg-[#F8FAFC] px-3"
            required
          />
          <div className="flex justify-between items-center w-full py-2.5">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 border border-black"
              />
              <label
                htmlFor="rememberMe"
                className="text-black font-geist text-xs"
              >
                Remember-Me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-[#EA580C] font-geist text-xs"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="h-[34px] w-full rounded bg-[#EA580C] text-white font-inter text-base font-bold"
      >
        Login
      </button>

      <p className="text-center text-sm font-geist">
        Don't have an account yet?{" "}
        <Link
          href="/register"
          className="text-[#EA580C] underline cursor-pointer"
        >
          Register now.
        </Link>
      </p>
    </form>
  );
}
