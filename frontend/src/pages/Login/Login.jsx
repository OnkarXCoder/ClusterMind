import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Phone, LogIn } from "lucide-react";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import InputField from "../../components/InputField/InputField";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import SocialLogin from "../../components/SocialLogin/SocialLogin";
import { fakeLogin } from "../../services/auth";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!contact.trim()) err.contact = "Mobile number or username is required";
    if (!password) err.password = "Password is required";
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      const user = await fakeLogin({ identifier: contact, password });
      if (user?.role === "marketing" || user?.role === "aiml") navigate("/marketing");
      else if (user?.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (errObj) {
      setErrors(errObj);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back 👋"
      subtitle="Login to continue shopping smarter"
    >
      <form className="auth-form" onSubmit={handleSubmit}>

        <InputField
          label="Mobile Number / Username"
          type="text"
          name="contact"
          icon={Phone}
          placeholder="Mobile number (customer) or username (admin/marketing)"
          value={contact}
          onChange={(e) => {
            setContact(e.target.value);
            setErrors({ ...errors, contact: "" });
          }}
          error={errors.contact}
        />

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors({ ...errors, password: "" });
          }}
          error={errors.password}
        />

        <div className="auth-row">
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember Me
          </label>

          <Link to="/forgot-password" className="auth-link">
            Forgot Password?
          </Link>
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          <LogIn size={18} />
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

      <SocialLogin />

      <p className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="auth-link">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
