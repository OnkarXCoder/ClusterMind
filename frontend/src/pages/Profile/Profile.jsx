import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser } from "../../services/auth";
import {
  Mail, Phone, Calendar, Crown, Gift, MapPin, BadgeCheck, Pencil, User as UserIcon,
  Trash2,  Star, StarOff, X, Save, CheckCircle2
} from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import defaultProfile from "../../assets/users/profile.jpg";
import "./Profile.css";
import api from "../../services/api";

const emptyAddr = {
  fullName: "", phone: "", houseFlat: "", street: "", area: "", city: "", state: "", pinCode: "", addressType: "Home", isDefault: false
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAddr);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) navigate("/login");
    else setUser(u);
  }, [navigate]);

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "";

  

  const validate = () => {
    if (!form.fullName.trim()) return "Full Name is required.";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) return "Phone Number must be 10 digits.";
    if (!form.houseFlat.trim()) return "House/Flat Number is required.";
    if (!form.street.trim()) return "Street Name is required.";
    if (!form.area.trim()) return "Area is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State is required.";
    if (!form.pinCode.trim() || !/^\d{6}$/.test(form.pinCode.trim())) return "PIN Code must be 6 digits.";
    if (!["Home","Office"].includes(form.addressType)) return "Address Type is required.";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    const v = validate();
    if (v) { setErr(v); return; }
    try {
      const payload = { action: editing ? "edit" : "add", addressId: editing?._id, address: form, makeDefault: form.isDefault };
      const { data } = await api.post("/users/me/addresses", payload);
      setCurrentUser(data.user);
      setUser(data.user);
      setMsg("Address saved successfully.");
      setShowForm(false); setEditing(null); setForm(emptyAddr);
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to save address.");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const { data } = await api.delete("/users/me/addresses", { data: { action: "delete", addressId: id } });
      setCurrentUser(data.user); setUser(data.user);
    } catch (err) { console.error(err); }  };  const setDefault = async (id) => {
    try {
      const { data } = await api.patch("/users/me/addresses", { action: "setDefault", addressId: id });
      setCurrentUser(data.user); setUser(data.user);
    } catch (err) { console.error(err); }  };

  const startAdd = () => { setEditing(null); setForm(emptyAddr); setShowForm(true); setErr(""); setMsg(""); };
  const startEdit = (a) => { setEditing(a); setForm({ ...a, pinCode: a.pinCode || a.pincode, phone: a.phone, houseFlat: a.houseFlat, street: a.street, area: a.area, addressType: a.addressType || "Home", isDefault: a.isDefault || false }); setShowForm(true); setErr(""); setMsg(""); };

  const addresses = user?.addresses || [];

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="profile-page-main">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
        <div className="profile-page">
          <div className="pp-title"><h1>My Profile</h1><p>Manage your personal information</p></div>
          {msg && <div className="pp-msg"><CheckCircle2 size={16}/> {msg}</div>}
          <div className="pp-grid">
            <div className="pp-card pp-summary">
              <div className="pp-avatar-wrap">
                <img src={user?.profileImage || defaultProfile} alt={user?.fullName} />
                <button className="pp-camera"><Pencil size={14}/></button>
              </div>
              <h2>{user?.fullName}</h2>
              <p className="pp-email">{user?.email}</p>
              <span className="pp-member"><Crown size={15}/> Premium Member</span>
              <div className="pp-points"><Gift size={20}/><div><strong>{user?.loyaltyPoints || 2450}</strong><span>Loyalty Points</span></div></div>
              <button className="pp-redeem" onClick={() => navigate("/")}>Redeem Rewards</button>
            </div>

            <div className="pp-card pp-details">
              <h2>Personal Information</h2>
              <div className="pp-row"><span className="pp-icon"><UserIcon size={18}/></span><div><small>Full Name</small><strong>{user?.fullName}</strong></div></div>
              <div className="pp-row"><span className="pp-icon"><Mail size={18}/></span><div><small>Email Address</small><strong>{user?.email}</strong></div></div>
              <div className="pp-row"><span className="pp-icon"><Phone size={18}/></span><div><small>Phone Number</small><strong>{user?.phone || user?.contact || "+91 98765 43210"}</strong></div></div>
              <div className="pp-row"><span className="pp-icon"><Calendar size={18}/></span><div><small>Member Since</small><strong>{memberSince}</strong></div></div>
              <div className="pp-row"><span className="pp-icon"><BadgeCheck size={18}/></span><div><small>Account Status</small><strong className="pp-active">Active · {user?.role}</strong></div></div>
            </div>

            <div className="pp-card pp-addresses">
              <div className="pp-addr-head">
                <h2>Saved Addresses</h2>
                <button className="pp-add-sm" onClick={startAdd}>+ Add New Address</button>
              </div>
              {showForm && (
                <form className="pp-addr-form" onSubmit={submit}>
                  <div className="pp-form-head"><h3>{editing?"Edit Address":"Add New Address"}</h3><button type="button" className="pp-x" onClick={()=>{setShowForm(false);setEditing(null);}}><X size={16}/></button></div>
                  {err && <div className="pp-err">{err}</div>}
                  <div className="pp-form-row">
                    <input placeholder="Full Name" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} required/>
                    <input placeholder="Phone Number" maxLength="10" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value.replace(/\D/g,'')})} required/>
                  </div>
                  <div className="pp-form-row">
                    <input placeholder="House/Flat Number" value={form.houseFlat} onChange={e=>setForm({...form,houseFlat:e.target.value})} required/>
                    <input placeholder="Street Name" value={form.street} onChange={e=>setForm({...form,street:e.target.value})} required/>
                  </div>
                  <div className="pp-form-row">
                    <input placeholder="Area" value={form.area} onChange={e=>setForm({...form,area:e.target.value})} required/>
                    <input placeholder="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} required/>
                  </div>
                  <div className="pp-form-row">
                    <input placeholder="State" value={form.state} onChange={e=>setForm({...form,state:e.target.value})} required/>
                    <input placeholder="PIN Code" maxLength="6" value={form.pinCode} onChange={e=>setForm({...form,pinCode:e.target.value.replace(/\D/g,'')})} required/>
                  </div>
                  <div className="pp-form-row">
                    <select value={form.addressType} onChange={e=>setForm({...form,addressType:e.target.value})}>
                      <option>Home</option><option>Office</option>
                    </select>
                    <label className="pp-check"><input type="checkbox" checked={form.isDefault} onChange={e=>setForm({...form,isDefault:e.target.checked})}/> Set as Default</label>
                  </div>
                  <button className="pp-save" type="submit"><Save size={16}/> Save Address</button>
                </form>
              )}

              {addresses.length ? addresses.map((a,i)=>(
                <div className="pp-address" key={a._id||i}>
                  <div className="pp-addr-left"><span className="pp-icon"><MapPin size={18}/></span>
                    <div>
                      <div className="pp-addr-title">
                        <strong>{a.fullName || user?.fullName}</strong>
                        <span className="pp-type">{a.addressType || "Home"}</span>
                        {a.isDefault && <span className="pp-default"><Star size={12}/> Default</span>}
                      </div>
                      <p>{[a.houseFlat,a.street,a.area].filter(Boolean).join(', ')}</p>
                      <p>{[a.city,a.state,a.pinCode||a.pincode].filter(Boolean).join(' - ')}</p>
                      <p className="phone"><Phone size={14}/> {a.phone || user?.contact}</p>
                    </div>
                  </div>
                  <div className="pp-addr-actions">
                    {!a.isDefault && <button onClick={()=>setDefault(a._id)}><StarOff size={14}/> Make Default</button>}
                    <button onClick={()=>startEdit(a)}><Pencil size={14}/> Edit</button>
                    <button className="danger" onClick={()=>del(a._id)}><Trash2 size={14}/> Delete</button>
                  </div>
                </div>
              )) : (!showForm && <div className="pp-empty"><MapPin size={40} color="#9CA3AF"/><p>No saved addresses yet</p></div>)}

              {!showForm && <button className="pp-add-btn" onClick={startAdd}>+ Add New Address</button>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


