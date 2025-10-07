import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi } from "@/services/auth";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { mutateAsync: forgotMutate, isPending } = useMutation({ mutationFn: forgotPasswordApi });

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const data = await forgotMutate({ email });
      if (data?.success) {
        alert(data?.message);
        navigate("/auth/reset-password", { state: { email } });
      } else {
        alert(data?.message || "Request failed");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Request failed");
    }
  }

  return (
    <div className="flex items-center justify-center w-full bg-gray-100">
      <div className="w-full max-w-lg bg-gray-100 p-6 ">
        <h2 className="text-center text-3xl font-bold">Forgot Password</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4 mt-4">
            <label className="block text-1xl font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="youremail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button type="submit" className="w-full mt-1 bg-[#d0a77e] text-white py-2 rounded-md hover:bg-[#b68c5c] transition">{isPending ? "Sending..." : "Send Reset OTP"}</button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
