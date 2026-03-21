import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, BarChart3, Settings, Search, Bell, User,
  Zap, Menu, X, Download, Filter, TrendingUp, TrendingDown, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: FileText, label: "Claims", to: "/upload" },
  { icon: BarChart3, label: "Analytics", to: "/analytics" },
  { icon: Settings, label: "Settings", to: "/dashboard" },
];

const tooltipStyle = {
  background: "hsl(220,18%,8%)",
  border: "1px solid hsl(220,16%,16%)",
  borderRadius: 8,
};
const axisTickStyle = { fontSize: 11, fill: "hsl(215,20%,55%)" };

// --- Data ---
const monthlyClaimsData = [
  { month: "Jan", auto: 42, home: 28, health: 55, travel: 18 },
  { month: "Feb", auto: 38, home: 35, health: 60, travel: 22 },
  { month: "Mar", auto: 55, home: 40, health: 48, travel: 30 },
  { month: "Apr", auto: 60, home: 32, health: 65, travel: 25 },
  { month: "May", auto: 48, home: 45, health: 70, travel: 28 },
  { month: "Jun", auto: 65, home: 38, health: 58, travel: 35 },
  { month: "Jul", auto: 72, home: 42, health: 62, travel: 40 },
  { month: "Aug", auto: 58, home: 50, health: 75, travel: 32 },
  { month: "Sep", auto: 45, home: 55, health: 68, travel: 28 },
  { month: "Oct", auto: 52, home: 48, health: 72, travel: 22 },
  { month: "Nov", auto: 68, home: 38, health: 80, travel: 18 },
  { month: "Dec", auto: 75, home: 30, health: 85, travel: 15 },
];

const processingTimeData = [
  { month: "Jan", avg: 15.2, target: 12 },
  { month: "Feb", avg: 14.8, target: 12 },
  { month: "Mar", avg: 13.5, target: 12 },
  { month: "Apr", avg: 13.1, target: 12 },
  { month: "May", avg: 12.8, target: 12 },
  { month: "Jun", avg: 12.3, target: 12 },
  { month: "Jul", avg: 11.9, target: 12 },
  { month: "Aug", avg: 12.1, target: 12 },
  { month: "Sep", avg: 11.5, target: 12 },
  { month: "Oct", avg: 11.2, target: 12 },
  { month: "Nov", avg: 10.8, target: 12 },
  { month: "Dec", avg: 10.5, target: 12 },
];

const payoutsByRegion = [
  { region: "North", payout: 1850000 },
  { region: "South", payout: 1420000 },
  { region: "East", payout: 2100000 },
  { region: "West", payout: 1680000 },
  { region: "Central", payout: 980000 },
];

const fraudMetrics = [
  { metric: "Image Tampering", score: 85 },
  { metric: "Duplicate Claims", score: 72 },
  { metric: "Anomaly Detection", score: 90 },
  { metric: "Document Forgery", score: 68 },
  { metric: "Behavioral Analysis", score: 78 },
  { metric: "Cross-Reference", score: 82 },
];

const statusDistribution = [
  { name: "Approved", value: 540, color: "hsl(150, 70%, 45%)" },
  { name: "In Review", value: 380, color: "hsl(38, 92%, 55%)" },
  { name: "Open", value: 245, color: "hsl(210, 100%, 60%)" },
  { name: "Denied", value: 119, color: "hsl(0, 72%, 55%)" },
];

const topAdjusters = [
  { name: "Sarah Chen", resolved: 142, avgDays: 8.2, satisfaction: 96 },
  { name: "Marcus Webb", resolved: 128, avgDays: 9.1, satisfaction: 94 },
  { name: "Priya Sharma", resolved: 115, avgDays: 7.8, satisfaction: 97 },
  { name: "Alex Rivera", resolved: 108, avgDays: 10.3, satisfaction: 91 },
  { name: "Kim Nguyen", resolved: 102, avgDays: 9.5, satisfaction: 93 },
];

const Analytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState("12m");
  const [category, setCategory] = useState("all");
  const location = useLocation();

  const handleDownloadReport = () => {
    // Build CSV content from analytics data
    const lines: string[] = [];
    lines.push("ClaimFlow AI — Full Analytics Report");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Period: ${timePeriod === "3m" ? "Last 3 Months" : timePeriod === "6m" ? "Last 6 Months" : "Last 12 Months"}`);
    lines.push(`Category: ${category === "all" ? "All Categories" : category}`);
    lines.push("");

    lines.push("--- Monthly Claims Volume ---");
    lines.push("Month,Auto,Home,Health,Travel");
    monthlyClaimsData.forEach((d) => lines.push(`${d.month},${d.auto},${d.home},${d.health},${d.travel}`));
    lines.push("");

    lines.push("--- Processing Time (days) ---");
    lines.push("Month,Average,Target");
    processingTimeData.forEach((d) => lines.push(`${d.month},${d.avg},${d.target}`));
    lines.push("");

    lines.push("--- Payouts by Region ---");
    lines.push("Region,Payout ($)");
    payoutsByRegion.forEach((d) => lines.push(`${d.region},${d.payout}`));
    lines.push("");

    lines.push("--- Status Distribution ---");
    lines.push("Status,Count");
    statusDistribution.forEach((d) => lines.push(`${d.name},${d.value}`));
    lines.push("");

    lines.push("--- Top Adjusters ---");
    lines.push("Name,Resolved,Avg Days,Satisfaction %");
    topAdjusters.forEach((d) => lines.push(`${d.name},${d.resolved},${d.avgDays},${d.satisfaction}`));

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claimflow-analytics-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully");
  };

  const totalClaims = statusDistribution.reduce((s, d) => s + d.value, 0);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
                location.pathname === item.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
        <header className="h-16 border-b border-border flex items-center gap-4 px-4 md:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search analytics..." className="pl-9 bg-secondary border-border rounded-xl" />
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

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display">Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">Detailed insights across all claim categories</p>
            </div>
            <Button onClick={handleDownloadReport} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 glow-blue">
              <Download className="h-4 w-4" />
              Download Full Report
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filters:
            </div>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[160px] bg-secondary border-border rounded-xl h-9 text-sm">
                <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="12m">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[150px] bg-secondary border-border rounded-xl h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Claims", value: totalClaims.toLocaleString(), change: "+12.4%", up: true },
              { label: "Approval Rate", value: `${((540 / totalClaims) * 100).toFixed(1)}%`, change: "+2.1%", up: true },
              { label: "Avg Resolution", value: "10.5 days", change: "-1.8d", up: false },
              { label: "Fraud Flagged", value: "4.2%", change: "-0.3%", up: false },
            ].map((kpi) => (
              <div key={kpi.label} className="glass p-4">
                <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
                <div className="text-2xl font-bold font-display">{kpi.value}</div>
                <div className={`flex items-center gap-1 text-xs mt-1 ${kpi.up ? "text-success" : "text-cyan"}`}>
                  {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.change}
                </div>
              </div>
            ))}
          </div>

          {/* Row 1: Area chart + Pie */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="glass p-5 lg:col-span-2">
              <h3 className="font-display font-semibold mb-4">Claims Volume by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyClaimsData}>
                  <defs>
                    <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(210,100%,60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(210,100%,60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(270,80%,65%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(270,80%,65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,16%)" />
                  <XAxis dataKey="month" tick={axisTickStyle} />
                  <YAxis tick={axisTickStyle} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="auto" name="Auto" stroke="hsl(210,100%,60%)" fill="url(#colorAuto)" strokeWidth={2} />
                  <Area type="monotone" dataKey="health" name="Health" stroke="hsl(270,80%,65%)" fill="url(#colorHealth)" strokeWidth={2} />
                  <Area type="monotone" dataKey="home" name="Home" stroke="hsl(185,90%,55%)" fill="transparent" strokeWidth={2} />
                  <Area type="monotone" dataKey="travel" name="Travel" stroke="hsl(150,70%,45%)" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass p-5">
              <h3 className="font-display font-semibold mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
                    {statusDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {statusDistribution.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Processing time + Regional payouts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass p-5">
              <h3 className="font-display font-semibold mb-4">Processing Time Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={processingTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,16%)" />
                  <XAxis dataKey="month" tick={axisTickStyle} />
                  <YAxis tick={axisTickStyle} domain={[8, 18]} unit=" d" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v} days`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="avg" name="Avg Time" stroke="hsl(210,100%,60%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(210,100%,60%)" }} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="hsl(0,72%,55%)" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass p-5">
              <h3 className="font-display font-semibold mb-4">Payouts by Region</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={payoutsByRegion} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,16%)" />
                  <XAxis type="number" tick={axisTickStyle} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                  <YAxis type="category" dataKey="region" tick={axisTickStyle} width={60} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${(v / 1000000).toFixed(2)}M`} />
                  <Bar dataKey="payout" radius={[0, 6, 6, 0]} barSize={24}>
                    {payoutsByRegion.map((_, i) => (
                      <Cell key={i} fill={["hsl(210,100%,60%)", "hsl(185,90%,55%)", "hsl(270,80%,65%)", "hsl(150,70%,45%)", "hsl(38,92%,55%)"][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: Radar chart + Top adjusters */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass p-5">
              <h3 className="font-display font-semibold mb-4">Fraud Detection Performance</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={fraudMetrics} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(220,16%,20%)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(210,100%,60%)" fill="hsl(210,100%,60%)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass p-5">
              <h3 className="font-display font-semibold mb-4">Top Claims Adjusters</h3>
              <div className="space-y-3">
                {topAdjusters.map((adj, i) => (
                  <div key={adj.name} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{adj.name}</div>
                      <div className="text-xs text-muted-foreground">{adj.resolved} resolved · {adj.avgDays}d avg</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-success">{adj.satisfaction}%</div>
                      <div className="text-xs text-muted-foreground">satisfaction</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
