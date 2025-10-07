import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { verifyOtpApi, resendOtpApi } from "@/services/auth";

const initialState = { email: "", otp: "" };

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || "";
  const [formData, setFormData] = useState({ ...initialState, email: emailFromState });
  const { mutateAsync: verifyMutate, isPending: isVerifying } = useMutation({ mutationFn: verifyOtpApi });
  const { mutateAsync: resendMutate, isPending: isResending } = useMutation({ mutationFn: resendOtpApi });

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const data = await verifyMutate(formData);
      if (data?.success) {
        alert(data?.message);
        navigate("/auth/login");
      } else {
        alert(data?.message || "Verification failed");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Verification failed");
    }
  }

  async function onResend() {
    if (!formData.email) {
      alert("Email required to resend OTP");
      return;
    }
    try {
      const data = await resendMutate({ email: formData.email });
      if (data?.success) {
        alert(data?.message);
      } else {
        alert(data?.message || "Failed to resend OTP");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to resend OTP");
    }
  }

  return (
    <div className="flex items-center justify-center w-full bg-gray-100">
      <div className="w-full max-w-lg bg-gray-100 p-6 ">
        <h2 className="text-center text-3xl font-bold">Verify your email</h2>
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
              placeholder="Enter 6-digit code"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button type="submit" className="w-full mt-1 bg-[#d0a77e] text-white py-2 rounded-md hover:bg-[#b68c5c] transition">{isVerifying ? "Verifying..." : "Verify"}</button>
        </form>
        <button onClick={onResend} className="w-full mt-3 bg-gray-800 text-white py-2 rounded-md hover:bg-black transition">{isResending ? "Resending..." : "Resend OTP"}</button>
      </div>
    </div>
  );
}

export default VerifyOtp;
