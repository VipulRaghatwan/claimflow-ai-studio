import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, BarChart3, Settings, Search, Bell, User,
  TrendingUp, TrendingDown, Clock, DollarSign, ShieldAlert, Zap, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const lineData = [
  { week: "W1", claims: 65 }, { week: "W2", claims: 85 },
  { week: "W3", claims: 120 }, { week: "W4", claims: 145 },
  { week: "W5", claims: 110 },
];

const barData = [
  { category: "Auto", amount: 1800000 },
  { category: "Home", amount: 1400000 },
  { category: "Health", amount: 2100000 },
  { category: "Travel", amount: 780000 },
];

const pieData = [
  { name: "Open", value: 38, color: "hsl(210, 100%, 60%)" },
  { name: "In Review", value: 30, color: "hsl(38, 92%, 55%)" },
  { name: "Approved", value: 22, color: "hsl(150, 70%, 45%)" },
  { name: "Denied", value: 10, color: "hsl(0, 72%, 55%)" },
];

const recentClaims = [
  { id: "CLM-8841", customer: "Erik Lindström", type: "Auto", amount: "$12,400", status: "Open", updated: "2 hrs ago" },
  { id: "CLM-8840", customer: "Astrid Svensson", type: "Home", amount: "$87,250", status: "Approved", updated: "4 hrs ago" },
  { id: "CLM-8839", customer: "Omar Hassan", type: "Health", amount: "$3,200", status: "In Review", updated: "5 hrs ago" },
  { id: "CLM-8838", customer: "Lena Johansson", type: "Auto", amount: "$18,900", status: "Denied", updated: "8 hrs ago" },
  { id: "CLM-8837", customer: "Marcus Chen", type: "Travel", amount: "$2,100", status: "Open", updated: "12 hrs ago" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: FileText, label: "Claims", to: "/upload" },
  { icon: BarChart3, label: "Analytics", to: "/analytics" },
  { icon: Settings, label: "Settings", to: "/dashboard" },
];

const statusColor: Record<string, string> = {
  Open: "bg-primary/20 text-primary",
  "In Review": "bg-warning/20 text-warning",
  Approved: "bg-success/20 text-success",
  Denied: "bg-destructive/20 text-destructive",
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">ClaimFlow AI</span>
          <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                location.pathname === item.to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-background/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center gap-4 px-4 md:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search claims, customers..." className="pl-9 bg-secondary border-border rounded-xl" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
          <h1 className="text-2xl md:text-3xl font-bold font-display">Dashboard</h1>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: "Total Claims", value: "1,284", change: "+8.4%", up: true, gradient: "from-primary to-blue-400" },
              { icon: Clock, label: "Avg Processing", value: "12.3 days", change: "-1.2d", up: false, gradient: "from-accent to-purple-400" },
              { icon: DollarSign, label: "Total Payout", value: "$4.7M", change: "+12.1%", up: true, gradient: "from-cyan to-teal-400" },
              { icon: ShieldAlert, label: "Fraud Alerts", value: "37", change: "+5", up: true, gradient: "from-warning to-orange-400" },
            ].map((stat) => (
              <div key={stat.label} className="glass p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.up ? 'text-success' : 'text-cyan'}`}>
                    {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold font-display">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Line chart */}
            <div className="glass p-5 lg:col-span-1">
              <h3 className="font-display font-semibold mb-4">Claims Volume</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,16%)" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(215,20%,55%)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(215,20%,55%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(220,18%,8%)", border: "1px solid hsl(220,16%,16%)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="claims" stroke="hsl(210,100%,60%)" strokeWidth={2} dot={{ fill: "hsl(210,100%,60%)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart */}
            <div className="glass p-5 lg:col-span-1">
              <h3 className="font-display font-semibold mb-4">Payouts by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,16%)" />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: "hsl(215,20%,55%)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(215,20%,55%)" }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ background: "hsl(220,18%,8%)", border: "1px solid hsl(220,16%,16%)", borderRadius: 8 }} formatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={["hsl(210,100%,60%)", "hsl(185,90%,55%)", "hsl(270,80%,65%)", "hsl(150,70%,45%)"][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="glass p-5 lg:col-span-1">
              <h3 className="font-display font-semibold mb-4">Claim Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(220,18%,8%)", border: "1px solid hsl(220,16%,16%)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    {d.name} ({d.value}%)
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent claims table */}
          <div className="glass p-5 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Recent Claims</h3>
              <Link to="/upload">
                <Button size="sm" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  + New Claim
                </Button>
              </Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-3 font-medium">Claim ID</th>
                  <th className="text-left py-3 font-medium">Customer</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Type</th>
                  <th className="text-left py-3 font-medium">Amount</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentClaims.map((claim) => (
                  <tr key={claim.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 text-primary font-medium">{claim.id}</td>
                    <td className="py-3">{claim.customer}</td>
                    <td className="py-3 hidden sm:table-cell text-muted-foreground">{claim.type}</td>
                    <td className="py-3 font-medium">{claim.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColor[claim.status]}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3 hidden md:table-cell text-muted-foreground">{claim.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
