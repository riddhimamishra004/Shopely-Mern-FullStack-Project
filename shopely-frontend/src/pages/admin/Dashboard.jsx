import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Users, Package,
  TrendingUp, TrendingDown, DollarSign, Star,
  ArrowRight, RefreshCw, ShoppingCart,
  AlertCircle, CheckCircle, Clock, Loader2, Radio,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

/* ---------------------------------------------------------
   Design tokens — "spice-market ledger"
   Ink header + cool paper canvas + a 4-note accent gradient
   (turmeric / chili / cardamom / indigo) used as the page's
   single signature thread instead of one flat brand color.
--------------------------------------------------------- */
const TOKENS = {
  ink: "#15161A",
  inkSoft: "#23252B",
  canvas: "#F6F7F9",
  paper: "#FFFFFF",
  line: "#E7E5E1",
  turmeric: "#E2A438",
  chili: "#C1440E",
  cardamom: "#2F7A5C",
  indigo: "#3454A6",
  ink900: "#1B1B1D",
};

const PIE_COLORS = [TOKENS.chili, TOKENS.indigo, TOKENS.cardamom, TOKENS.turmeric, "#8A5A9E", "#B0546A", "#4C8C93"];

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* Fonts + tiny keyframes, scoped once at the root */
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');

      .adash { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
      .adash-display { font-family: 'Space Grotesk', 'Inter', sans-serif; letter-spacing: -0.01em; }
      .adash-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }

      @keyframes adashRise {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .adash-rise { animation: adashRise 0.5s cubic-bezier(.16,1,.3,1) both; }

      @keyframes adashPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%      { opacity: 0.4; transform: scale(0.8); }
      }
      .adash-pulse { animation: adashPulse 1.8s ease-in-out infinite; }

      @keyframes adashShimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .adash-shimmer {
        background: linear-gradient(90deg, #EFEFEF 25%, #F7F7F7 37%, #EFEFEF 63%);
        background-size: 400% 100%;
        animation: adashShimmer 1.6s ease-in-out infinite;
      }

      .adash-card { transition: transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease, border-color .25s ease; }
      .adash-card:hover { transform: translateY(-3px); border-color: #D7D4CE; box-shadow: 0 12px 28px -12px rgba(20,18,14,0.14); }
    `}</style>
  );
}

/* Counts up from 0 to `value` once loading finishes */
function useCountUp(value, active) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!active || typeof value !== "number" || Number.isNaN(value)) return;
    const duration = 900;
    const start = performance.now();
    const from = 0;

    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, active]);

  return display;
}

function Sparkline({ points, color }) {
  if (!points?.length) return null;
  const w = 88, h = 28;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const step = w / (points.length - 1 || 1);
  const d = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(h - ((v - min) / range) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}

function StatCard({ icon: Icon, label, numericValue, displayValue, change, changeType, accent, loading, spark, delay = 0 }) {
  const positive = changeType === "up";
  const animated = useCountUp(numericValue, !loading);
  const shown = displayValue ?? (typeof numericValue === "number" ? animated.toLocaleString("en-IN") : "—");

  return (
    <div
      className="adash-card adash-rise rounded-2xl border bg-white p-5"
      style={{ borderColor: TOKENS.line, animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${accent}1A` }}
        >
          <Icon size={19} style={{ color: accent }} strokeWidth={2.2} />
        </div>
        {change !== undefined && (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
            style={{
              background: positive ? `${TOKENS.cardamom}14` : `${TOKENS.chili}14`,
              color: positive ? TOKENS.cardamom : TOKENS.chili,
            }}
          >
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          {loading ? (
            <div className="adash-shimmer h-7 w-20 rounded" />
          ) : (
            <p className="adash-display adash-mono text-2xl font-semibold" style={{ color: TOKENS.ink900 }}>
              {shown}
            </p>
          )}
          <p className="mt-1 text-[13px] text-stone-500">{label}</p>
        </div>
        {!loading && spark && <Sparkline points={spark} color={accent} />}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  const map = {
    delivered:  { bg: `${TOKENS.cardamom}14`, fg: TOKENS.cardamom, icon: <CheckCircle size={11} /> },
    processing: { bg: `${TOKENS.indigo}14`,   fg: TOKENS.indigo,   icon: <Clock size={11} /> },
    shipped:    { bg: `${TOKENS.turmeric}22`, fg: "#8A5F17",       icon: <Package size={11} /> },
    pending:    { bg: `${TOKENS.turmeric}22`, fg: "#8A5F17",       icon: <AlertCircle size={11} /> },
    cancelled:  { bg: `${TOKENS.chili}14`,    fg: TOKENS.chili,    icon: null },
  };
  const s2 = map[s] || { bg: "#F1F0EE", fg: "#78716c", icon: null };
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize"
      style={{ background: s2.bg, color: s2.fg }}
    >
      {s2.icon}
      {s || "unknown"}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg" style={{ borderColor: TOKENS.line }}>
      <p className="mb-1.5 text-xs font-semibold text-stone-700">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="adash-mono text-xs" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" && entry.value > 1000
            ? `₹${entry.value.toLocaleString("en-IN")}`
            : entry.value?.toLocaleString?.() ?? entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [period, setPeriod] = useState("year");

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { headers: authHeaders() });
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(); }, []);

  const monthlyRevenue = data?.monthlyRevenue || [];
  const filteredRevenue = period === "year"
    ? monthlyRevenue
    : period === "half"
    ? monthlyRevenue.slice(6)
    : monthlyRevenue.slice(9);

  const revenueSpark = monthlyRevenue.map((m) => m.revenue || 0).slice(-8);
  const stats = data?.stats || {};
  const categoryBreakdown = (data?.categoryBreakdown || []).map((c, i) => ({
    ...c,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <div className="adash min-h-screen" style={{ background: TOKENS.canvas }}>
      <GlobalStyle />

      {/* signature gradient thread */}
      <div
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${TOKENS.turmeric}, ${TOKENS.chili}, ${TOKENS.cardamom}, ${TOKENS.indigo})` }}
      />

      {/* Top bar */}
      <header className="sticky top-0 z-30" style={{ background: TOKENS.ink }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: `linear-gradient(135deg, ${TOKENS.turmeric}, ${TOKENS.chili})` }}
            >
              <LayoutDashboard size={17} className="text-white" strokeWidth={2.4} />
            </div>
            <div>
              <h1 className="adash-display text-[15px] font-semibold leading-tight text-white">Admin Dashboard</h1>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/50">
                <Radio size={9} className="adash-pulse" style={{ color: TOKENS.cardamom }} />
                Live · Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90 transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Welcome */}
        <div
          className="rounded-2xl border px-5 py-4"
          style={{ borderColor: TOKENS.line, background: `linear-gradient(120deg, ${TOKENS.turmeric}12, ${TOKENS.chili}0A)` }}
        >
          <p className="text-sm text-stone-700">
            Welcome back, <span className="font-semibold" style={{ color: TOKENS.ink900 }}>{user?.name || "Admin"}</span>
            <span className="mx-1.5 text-stone-400">·</span>
            Here's your store's live performance.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            loading={loading} icon={DollarSign} label="Total Revenue" accent={TOKENS.turmeric} delay={0}
            displayValue={stats.totalRevenue !== undefined ? `₹${(stats.totalRevenue / 100000).toFixed(1)}L` : "—"}
            numericValue={stats.totalRevenue}
            spark={revenueSpark}
          />
          <StatCard
            loading={loading} icon={ShoppingCart} label="Total Orders" accent={TOKENS.indigo} delay={60}
            numericValue={stats.totalOrders}
          />
          <StatCard
            loading={loading} icon={Users} label="Total Users" accent={TOKENS.cardamom} delay={120}
            numericValue={stats.totalUsers}
          />
          <StatCard
            loading={loading} icon={Package} label="Pending Orders" accent={TOKENS.chili} delay={180}
            numericValue={stats.pendingOrders}
          />
        </div>

        {/* Revenue Chart + Category Pie */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="adash-card rounded-2xl border bg-white p-5 lg:col-span-2" style={{ borderColor: TOKENS.line }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="adash-display text-sm font-semibold" style={{ color: TOKENS.ink900 }}>Monthly Revenue</h2>
                <p className="text-xs text-stone-500">Real orders data for {new Date().getFullYear()}</p>
              </div>
              <div className="flex rounded-lg border p-0.5" style={{ borderColor: TOKENS.line }}>
                {[["year","12M"],["half","6M"],["quarter","3M"]].map(([v,l]) => (
                  <button
                    key={v}
                    onClick={() => setPeriod(v)}
                    className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                    style={period === v
                      ? { background: TOKENS.ink, color: "#fff" }
                      : { color: "#78716c" }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="adash-shimmer h-60 rounded-xl" />
            ) : filteredRevenue.length === 0 ? (
              <div className="flex h-60 items-center justify-center text-xs text-stone-400">No revenue data for this period</div>
            ) : (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TOKENS.chili} stopOpacity={0.22} />
                        <stop offset="95%" stopColor={TOKENS.chili} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEECE8" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} width={44}
                      tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={28}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, color: "#78716c" }}
                    />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke={TOKENS.chili} strokeWidth={2.5}
                      fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: TOKENS.chili, stroke: "#fff", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Pie */}
          <div className="adash-card rounded-2xl border bg-white p-5" style={{ borderColor: TOKENS.line }}>
            <h2 className="adash-display mb-1 text-sm font-semibold" style={{ color: TOKENS.ink900 }}>Products by Category</h2>
            <p className="mb-3 text-xs text-stone-500">Current inventory breakdown</p>
            {loading ? (
              <div className="adash-shimmer h-48 rounded-xl" />
            ) : categoryBreakdown.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8">No data</p>
            ) : (
              <>
                <div style={{ width: "100%", height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        paddingAngle={3} dataKey="value" stroke="#fff" strokeWidth={2}>
                        {categoryBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v + " products", n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {categoryBreakdown.slice(0, 5).map((c) => (
                    <li key={c.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                        <span className="text-stone-600 capitalize">{c.name}</span>
                      </span>
                      <span className="adash-mono font-semibold" style={{ color: TOKENS.ink900 }}>{c.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Recent Orders + Top Products */}
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="adash-card rounded-2xl border bg-white lg:col-span-3" style={{ borderColor: TOKENS.line }}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: TOKENS.line }}>
              <h2 className="adash-display text-sm font-semibold" style={{ color: TOKENS.ink900 }}>Recent Orders</h2>
              <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-medium" style={{ color: TOKENS.chili }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2 p-5">
                {[0,1,2,3].map(i => <div key={i} className="adash-shimmer h-12 rounded-lg" />)}
              </div>
            ) : !data?.recentOrders?.length ? (
              <p className="text-center text-sm text-stone-400 py-10">No orders yet</p>
            ) : (
              <div className="divide-y" style={{ borderColor: TOKENS.line }}>
                {data.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-stone-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="adash-mono text-xs font-semibold" style={{ color: TOKENS.chili }}>
                          #{order._id?.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs text-stone-400">
                          {new Date(order.time).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="truncate text-sm font-medium text-stone-800">{order.customer}</p>
                      <p className="truncate text-xs text-stone-500">{order.product}</p>
                    </div>
                    <div className="text-right">
                      <p className="adash-mono text-sm font-semibold" style={{ color: TOKENS.ink900 }}>
                        ₹{order.amount?.toLocaleString("en-IN")}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="adash-card rounded-2xl border bg-white lg:col-span-2" style={{ borderColor: TOKENS.line }}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: TOKENS.line }}>
              <h2 className="adash-display text-sm font-semibold" style={{ color: TOKENS.ink900 }}>Top Products</h2>
              <Link to="/admin/products" className="flex items-center gap-1 text-xs font-medium" style={{ color: TOKENS.chili }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2 p-5">
                {[0,1,2,3].map(i => <div key={i} className="adash-shimmer h-12 rounded-lg" />)}
              </div>
            ) : !data?.topProducts?.length ? (
              <p className="text-center text-sm text-stone-400 py-10">No sales data yet</p>
            ) : (
              <div className="divide-y" style={{ borderColor: TOKENS.line }}>
                {data.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className="adash-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: `${PIE_COLORS[i % PIE_COLORS.length]}18`, color: PIE_COLORS[i % PIE_COLORS.length] }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-stone-800">{p.name}</p>
                      <span className="text-xs text-stone-400">{p.sales} sold</span>
                    </div>
                    <p className="adash-mono shrink-0 text-xs font-semibold" style={{ color: TOKENS.ink900 }}>
                      ₹{(p.revenue / 1000).toFixed(1)}k
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Manage Products", to: "/admin/products", icon: ShoppingBag, accent: TOKENS.turmeric },
            { label: "All Orders",      to: "/admin/orders",   icon: Package,     accent: TOKENS.indigo },
            { label: "Users",           to: "/admin/users",    icon: Users,       accent: TOKENS.cardamom },
            { label: "Reviews",         to: "/admin/reviews",  icon: Star,        accent: TOKENS.chili },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="adash-card flex items-center gap-2.5 rounded-2xl border bg-white p-4"
              style={{ borderColor: TOKENS.line }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${item.accent}1A` }}>
                <item.icon size={17} style={{ color: item.accent }} strokeWidth={2.2} />
              </div>
              <span className="text-sm font-medium text-stone-700">{item.label}</span>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}