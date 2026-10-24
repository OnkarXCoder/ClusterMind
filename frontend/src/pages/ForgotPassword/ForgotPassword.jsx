import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, ShieldCheck, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import InputField from "../../components/InputField/InputField";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import { fakeSendOtp, fakeVerifyOtp, fakeResetPassword } from "../../services/auth";
import "./ForgotPassword.css";

const steps = ["Email", "Verify OTP", "New Password"];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const err = {};
    if (!email.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) err.email = "Enter a valid email";
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      await fakeSendOtp(email);
      setStep(1);
    } catch (errObj) {
      setErrors(errObj);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const err = {};
    if (!otp.trim()) err.otp = "OTP is required";
    else if (otp.trim().length !== 6) err.otp = "OTP must be 6 digits";
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      const token = await fakeVerifyOtp(email.trim(), otp.trim());
      setResetToken(token);
      setStep(2);
    } catch (errObj) {
      setErrors(errObj);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const err = {};
    if (!password) err.password = "New password is required";
    else if (password.length < 8) err.password = "Password must be at least 8 characters";
    if (confirm !== password) err.confirm = "Passwords do not match";
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      await fakeResetPassword(email.trim(), password, resetToken);
      setDone(true);
    } catch (errObj) {
      setErrors(errObj && typeof errObj === "object" ? errObj : {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Reset your password in a few steps"
    >
      {done ? (
        <div className="success-box">
          <div className="success-icon">
            <CheckCircle2 size={48} color="#22C55E" />
          </div>
          <h2>Password Updated Successfully</h2>
          <p>You can now login with your new password.</p>
          <button className="auth-btn" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      ) : (
        <>
          <div className="steps-bar">
            {steps.map((label, i) => (
              <div key={label} className={`step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                <div className="step-dot">
                  {i < step ? <ShieldCheck size={16} /> : i + 1}
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="step-card">
            {step === 0 && (
              <form className="auth-form" onSubmit={handleSendOtp}>
                <InputField
                  label="Email Address"
                  type="email"
                  name="email"
                  icon={Mail}
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  error={errors.email}
                />
                <button className="auth-btn" type="submit" disabled={loading}>
                  Send OTP
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {step === 1 && (
              <form className="auth-form" onSubmit={handleVerifyOtp}>
                <InputField
                  label="Enter OTP"
                  type="text"
                  name="otp"
                  icon={KeyRound}
                  placeholder="6-digit OTP sent to your email"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setErrors({ ...errors, otp: "" });
                  }}
                  error={errors.otp}
                />
                <button className="auth-btn" type="submit" disabled={loading}>
                  Verify OTP
                  <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft size={16} />
                  Change Email
                </button>
              </form>
            )}

            {step === 2 && (
              <form className="auth-form" onSubmit={handleReset}>
                <PasswordInput
                  label="New Password"
                  name="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: "" });
                  }}
                  error={errors.password}
                />

                <PasswordInput
                  label="Confirm New Password"
                  name="confirm"
                  placeholder="Re-enter new password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setErrors({ ...errors, confirm: "" });
                  }}
                  error={errors.confirm}
                />

                <button className="auth-btn" type="submit" disabled={loading}>
                  Update Password
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={16} />
                  Back to OTP
                </button>
              </form>
            )}
          </div>

          <p className="auth-footer">
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
