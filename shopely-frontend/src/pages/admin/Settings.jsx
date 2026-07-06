import { useState } from "react";
import { Settings, Bell, Shield, Globe, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    storeName: "My Ecommerce Store",
    supportEmail: "support@store.com",
    currency: "INR",
    shippingFree: "999",
    shippingCost: "50",
    orderNotify: true,
    reviewNotify: true,
    userNotify: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSave(e) {
    e.preventDefault();
    // In real app: save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const Section = ({ icon: Icon, title, children }) => (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
          <Icon size={16} className="text-orange-600" />
        </div>
        <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, name, type = "text", ...props }) => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-stone-700">{label}</label>
      <input type={type} name={name} value={form[name]} onChange={handleChange}
        className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
        {...props} />
    </div>
  );

  const Toggle = ({ label, name, desc }) => (
    <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-stone-800">{label}</p>
        {desc && <p className="text-xs text-stone-400">{desc}</p>}
      </div>
      <div className={`relative h-6 w-10 rounded-full transition-colors ${form[name] ? "bg-orange-600" : "bg-stone-200"}`}
        onClick={() => setForm(prev => ({ ...prev, [name]: !prev[name] }))}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${form[name] ? "translate-x-5" : "translate-x-1"}`} />
      </div>
    </label>
  );

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Settings</h1>
        <p className="text-sm text-stone-500">Store configuration manage karein</p>
      </div>

      <Section icon={Globe} title="Store Information">
        <div className="space-y-4">
          <Field label="Store Name" name="storeName" placeholder="Your Store Name" />
          <Field label="Support Email" name="supportEmail" type="email" placeholder="support@store.com" />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-700">Currency</label>
            <select name="currency" value={form.currency} onChange={handleChange}
              className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500">
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
            </select>
          </div>
        </div>
      </Section>

      <Section icon={Settings} title="Shipping Settings">
        <div className="space-y-4">
          <Field label="Free Shipping Above (₹)" name="shippingFree" type="number" />
          <Field label="Default Shipping Cost (₹)" name="shippingCost" type="number" />
        </div>
      </Section>

      <Section icon={Bell} title="Notifications">
        <div className="divide-y divide-stone-50">
          <Toggle name="orderNotify" label="New Order Alerts" desc="Naya order aane par notify karein" />
          <Toggle name="reviewNotify" label="New Review Alerts" desc="Naya review aane par notify karein" />
          <Toggle name="userNotify" label="New User Signup" desc="Naya user register hone par notify karein" />
        </div>
      </Section>

      <button type="submit"
        className="flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition-colors">
        {saved ? <Check size={16} /> : <Save size={16} />}
        {saved ? "Saved!" : "Save Settings"}
      </button>
    </form>
  );
}
