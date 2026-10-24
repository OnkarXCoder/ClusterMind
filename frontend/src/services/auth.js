import api, { isBackendReachable } from "./api";

const TOKEN_KEY = "clustermind_token";
const USER_KEY = "clustermind_user";
const USERS_KEY = "clustermind_users";

const sleep = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

export const setCurrentUser = (user) => {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return null;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  const users = getUsers();
  const index = users.findIndex((u) => String(u.id || u._id) === String(user.id || user._id));
  if (index >= 0) {
    users[index] = { ...users[index], ...user, updatedAt: new Date().toISOString() };
    saveUsers(users);
  }
  return user;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = getCurrentUser();
  return Boolean(token && user?.role);
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const hasRemoteAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return Boolean(token && !token.startsWith("fake-jwt-"));
};

export const clearInvalidSession = (response) => {
  if (response?.status === 401) {
    logout();
  }
  return response;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("marketing_api_key");
  localStorage.removeItem("shopsmart_token");
  localStorage.removeItem("shopsmart_role");
  localStorage.removeItem("shopsmart_user");
};

const DEFAULT_USERS = [
  {
    id: "user_demo",
    fullName: "Rahul Sharma",
    email: "demo@clustermind.com",
    phone: "9876543210",
    password: "demo123",
    profileImage: "",
    address: [],
    role: "customer",
    loyaltyPoints: 250,
    createdAt: new Date("2026-01-01").toISOString(),
    updatedAt: new Date("2026-01-01").toISOString(),
  },
];

const getUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    for (const demo of DEFAULT_USERS) {
      if (!users.some((u) => u.email.toLowerCase() === demo.email.toLowerCase())) {
        users.push(demo);
      }
    }
    return users;
  } catch {
    return DEFAULT_USERS;
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const localLogin = ({ email, password }) =>
  new Promise((resolve, reject) => {
    sleep().then(() => {
      const id = (email || "").toLowerCase();
      const user = getUsers().find(
        (u) =>
          u.password === password &&
          (u.email.toLowerCase() === id || String(u.phone) === String(email))
      );
      if (!user) {
        reject({ contact: "Invalid mobile number or password" });
        return;
      }
      const token = "fake-jwt-" + Date.now();
      localStorage.removeItem("marketing_api_key");
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      resolve(user);
    });
  });

const localRegister = (data) =>
  new Promise((resolve, reject) => {
    sleep().then(() => {
      const users = getUsers();
      if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        reject({ email: "Email already registered" });
        return;
      }
      const user = {
        id: "user_" + Date.now(),
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        profileImage: "",
        address: [],
        role: "customer",
        loyaltyPoints: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(user);
      saveUsers(users);
      resolve(user);
    });
  });

export const fakeLogin = async ({ email, identifier, password }) => {
  const id = identifier || email;
  if (await isBackendReachable()) {
    try {
      const res = await api.post("/auth/login", { identifier: id, password });
      const { token, user, apiKey } = res.data;
      localStorage.setItem(TOKEN_KEY, token);
      if (apiKey) {
        localStorage.setItem("marketing_api_key", apiKey);
      } else {
        localStorage.removeItem("marketing_api_key");
      }
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          id: user.id,
          fullName: user.name,
          email: user.email || (email?.includes("@") ? email : ""),
          phone: user.contact,
          role: user.role || "customer",
        })
      );
      return user;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? "Invalid email or password" : null);
      const status = err?.response?.status;
      if (status === 401 || status === 404) {
        throw { contact: message };
      }
    }
  }
  return localLogin({ email: id, password });
};

export const fakeRegister = async (data) => {
  if (await isBackendReachable()) {
    try {
      const res = await api.post("/auth/register", {
        name: data.fullName,
        email: data.email,
        contact: data.phone,
        password: data.password,
      });
      const { user } = res.data;
      return user;
    } catch (err) {
      const message = err?.response?.data?.message;
      if (message) {
        throw { email: message, phone: message };
      }
    }
  }
  return localRegister(data);
};

export const fakeSendOtp = async (email) => {
  if (await isBackendReachable()) {
    try {
      const res = await api.post("/auth/forgot-password/send-otp", { email });
      // In non-production the backend echoes the OTP back for local testing.
      return res.data?.devOtp || "sent";
    } catch (err) {
      const message = err?.response?.data?.message;
      if (message) throw { email: message };
    }
  }
  return new Promise((resolve, reject) => {
    sleep().then(() => {
      if (!getUsers().some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        reject({ email: "No account found with this email" });
        return;
      }
      resolve("123456");
    });
  });
};

export const fakeVerifyOtp = async (email, otp) => {
  if (await isBackendReachable()) {
    try {
      const res = await api.post("/auth/forgot-password/verify-otp", { email, otp });
      return res.data?.resetToken || null;
    } catch (err) {
      const message = err?.response?.data?.message;
      if (message) throw { otp: message };
    }
  }
  return new Promise((resolve, reject) => {
    sleep().then(() => {
      if (otp === "123456") resolve(null);
      else reject({ otp: "Invalid OTP" });
    });
  });
};

export const fakeResetPassword = async (email, password, resetToken) => {
  if (await isBackendReachable()) {
    try {
      await api.post("/auth/forgot-password/reset", { resetToken, password });
      return true;
    } catch (err) {
      const message = err?.response?.data?.message;
      if (message) throw { password: message };
    }
  }
  return new Promise((resolve) => {
    sleep().then(() => {
      const users = getUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        user.password = password;
        user.updatedAt = new Date().toISOString();
        saveUsers(users);
      }
      resolve(true);
    });
  });
};
