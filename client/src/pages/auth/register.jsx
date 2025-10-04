import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { register } from "@/services/auth";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();
  const { mutateAsync: registerMutate, isPending } = useMutation({
    mutationFn: register,
  });

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const data = await registerMutate(formData);
      if (data?.success) {
        alert(data?.message);
        navigate("/auth/verify-otp", { state: { email: formData.email } });
      } else {
        alert(data?.message);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Request failed");
    }
  }

  return (
    <div className="flex items-center justify-center w-full bg-gray-100">
      <div className="w-full max-w-lg bg-gray-100 p-6">
        <h2 className="text-center text-4xl font-bold">Create new account</h2>
        <p className="text-center text-black mb-4 mt-2">
          Already have an account?
          <Link to="/auth/login" className="ml-1 text-[#d0a77e] hover:underline">
            Login
          </Link>
        </p>
        <form onSubmit={onSubmit}>
          <div className="mb-4 mt-4">
            <label className="block text-sm font-medium" htmlFor="username">
              User Name
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your user name"
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium" htmlFor="password">
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
            className="w-full mt-1 bg-[#d0a77e] text-white py-3 rounded-md hover:bg-[#b68c5c] transition"
          >
            {isPending ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthRegister;


