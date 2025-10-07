import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/auth";
import { setAuthToken } from "@/services/auth";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();
  const { mutateAsync: loginMutate, isPending } = useMutation({
    mutationFn: login,
  });

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const data = await loginMutate(formData);
      if (data?.success) {
        const token = data?.data?.token;
        if (token) setAuthToken(token);
        alert(data?.message);
      } else {
        const msg = data?.message;
        alert(msg);
        if (msg === "Please verify your email first") {
          navigate("/auth/verify-otp", { state: { email: formData.email } });
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Request failed";
      alert(msg);
    }
  }

  return (

    <div className="flex items-center justify-center w-full bg-gray-100">
      <div className="w-full max-w-lg bg-gray-100 p-6 ">
        <h2 className="text-center text-4xl font-bold">Welcome Back</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4 mt-4">
            <label className="block text-1xl font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="youremail@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="mb-4">
            <label className="block text-1xl font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-1 bg-[#d0a77e] text-white py-2 rounded-md hover:bg-[#b68c5c] transition"
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 flex justify-center text-sm">
          <Link to="/auth/forgot-password" className="text-[#d0a77e] hover:underline">Forgot password?</Link>
        </div>
        <p className="mt-4 text-center">
          Don't have an account?
          <Link
            to="/auth/register"
            className="ml-1 text-[#d0a77e] hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthLogin;
