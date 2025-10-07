import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { resetPasswordApi } from "@/services/auth";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || "";

  const [formData, setFormData] = useState({ email: emailFromState, otp: "", newPassword: "" });

  const { mutateAsync: resetMutate, isPending } = useMutation({ mutationFn: resetPasswordApi });

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const data = await resetMutate(formData);
      if (data?.success) {
        alert(data?.message);
        navigate("/auth/login");
      } else {
        alert(data?.message || "Reset failed");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Reset failed");
    }
  }

  return (
    <div className="flex items-center justify-center w-full bg-gray-100">
      <div className="w-full max-w-lg bg-gray-100 p-6 ">
        <h2 className="text-center text-3xl font-bold">Reset Password</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4 mt-4">
            <label className="block text-1xl font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="youremail@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="mb-4">
            <label className="block text-1xl font-medium" htmlFor="otp">OTP</label>
            <input
              id="otp"
              type="text"
              placeholder="Enter reset OTP"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="mb-4">
            <label className="block text-1xl font-medium" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button type="submit" className="w-full mt-1 bg-[#d0a77e] text-white py-2 rounded-md hover:bg-[#b68c5c] transition">{isPending ? "Resetting..." : "Reset Password"}</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
