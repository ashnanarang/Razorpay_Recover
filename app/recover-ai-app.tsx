"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownUp,
  AlertTriangle,
  Banknote,
  BellRing,
  Bot,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Filter,
  Gauge,
  GitBranch,
  Headphones,
  IndianRupee,
  MessageCircle,
  PanelRightOpen,
  PauseCircle,
  Phone,
  PlayCircle,
  RefreshCcw,
  Route,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";

type Method = "upi" | "card" | "netbanking" | "wallet";
type FailureReason =
  | "Insufficient funds"
  | "Incorrect OTP"
  | "UPI timeout"
  | "Bank declined"
  | "Payment abandoned"
  | "Mandate failure"
  | "Technical failure"
  | "Card declined"
  | "Card failure"
  | "45 days overdue";
type RecoveryStatus = "Queued" | "Message sent" | "Scheduled" | "Human review";
type Priority = "High" | "Medium" | "Low";
type LeakType = "Technical" | "Human" | "Technical + Human";
type AssignedAgent = "Technical Recovery Agent" | "Engagement Agent" | "Voice Recovery Agent" | "Escalation Agent";
type Mission = "technical" | "human";

interface MockOrder {
  id: string;
  entity: "order";
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: "INR";
  receipt: string;
  status: "created" | "attempted" | "paid";
  attempts: number;
  created_at: number;
  customer_id: string;
  customer_name: string;
  invoice_id: string;
  due_date: number;
}

interface MockPayment {
  id: string;
  entity: "payment";
  amount: number;
  currency: "INR";
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  order_id: string;
  method: Method;
  captured: boolean;
  email: string;
  contact: string;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  created_at: number;
}

interface QueueRecord {
  order: MockOrder;
  payment: MockPayment;
  customerName: string;
  amountDue: number;
  lastAttempt: string;
  hoursSinceAttempt: number;
  daysOverdue: number;
  failure: FailureReason;
  attempts: number;
  method: Method;
  status: RecoveryStatus;
  priorPaidInvoices: number;
  successRate: number;
  whatsappResponsive: boolean;
  ignoredReminders: number;
  preferredWindow: string;
  prefersCall: boolean;
  previousPartialPayment: boolean;
}

interface Strategy {
  recoveryScore: number;
  recoveryProbability: number;
  expectedRecoveryValue: number;
  recommendedChannel: "WhatsApp" | "SMS" | "Email" | "Call";
  recommendedTime: string;
  recommendedAction: string;
  priority: Priority;
  leakType: LeakType;
  assignedAgent: AssignedAgent;
  technicalLeakLevel: "LOW" | "MEDIUM" | "HIGH";
  humanLeakLevel: "LOW" | "MEDIUM" | "HIGH";
  technicalReasons: string[];
  humanReasons: string[];
  vulcanReasons: string[];
}

type SeedRecord = [
  string,
  number,
  string,
  number,
  number,
  FailureReason,
  number,
  Method,
  RecoveryStatus,
  number,
  number,
  boolean,
  number,
  string,
  boolean,
  boolean,
];

const seedRows: SeedRecord[] = [
  ["Aarav Sharma", 48000, "2 hrs ago", 2, 0, "UPI timeout", 2, "upi", "Queued", 8, 0.94, true, 0, "6 PM - 9 PM", false, false],
  ["Priya Mehta", 125000, "Yesterday", 28, 1, "Card declined", 3, "card", "Queued", 11, 0.9, true, 1, "11 AM - 2 PM", false, false],
  ["Rohan Kapoor", 22500, "3 days ago", 72, 3, "Insufficient funds", 2, "upi", "Scheduled", 5, 0.76, false, 0, "10 AM - 12 PM", false, false],
  ["Neha Singh", 78000, "5 hrs ago", 5, 0, "Payment abandoned", 1, "card", "Queued", 7, 0.86, true, 0, "7 PM - 10 PM", false, false],
  ["Arjun Rao", 240000, "5 days ago", 120, 5, "Card failure", 4, "card", "Queued", 10, 0.82, false, 3, "3 PM - 5 PM", true, true],
  ["Kavya Nair", 34000, "40 mins ago", 1, 0, "Technical failure", 1, "netbanking", "Message sent", 9, 0.96, true, 0, "6 PM - 8 PM", false, false],
  ["Dev Patel", 98000, "6 hrs ago", 6, 0, "Incorrect OTP", 2, "card", "Queued", 6, 0.79, true, 0, "12 PM - 3 PM", false, false],
  ["Isha Verma", 186000, "2 days ago", 48, 2, "Bank declined", 3, "card", "Queued", 12, 0.88, false, 1, "4 PM - 6 PM", false, false],
  ["Kabir Khan", 57000, "8 hrs ago", 8, 0, "UPI timeout", 2, "upi", "Queued", 4, 0.72, true, 0, "8 PM - 10 PM", false, false],
  ["Meera Iyer", 43000, "4 days ago", 96, 4, "Mandate failure", 2, "upi", "Scheduled", 14, 0.91, true, 0, "9 AM - 11 AM", false, false],
  ["Samar Gupta", 315000, "9 days ago", 216, 9, "Insufficient funds", 5, "netbanking", "Queued", 6, 0.67, false, 2, "10 AM - 1 PM", true, true],
  ["Tara Bose", 65000, "1 day ago", 24, 1, "Payment abandoned", 1, "wallet", "Queued", 3, 0.7, true, 0, "6 PM - 9 PM", false, false],
  ["Vihaan Malhotra", 138000, "12 hrs ago", 12, 0, "Technical failure", 2, "netbanking", "Queued", 15, 0.95, true, 0, "2 PM - 5 PM", false, false],
  ["Ananya Das", 91000, "6 days ago", 144, 6, "Bank declined", 4, "card", "Queued", 4, 0.62, false, 2, "11 AM - 1 PM", false, false],
  ["Nikhil Jain", 28000, "3 hrs ago", 3, 0, "Incorrect OTP", 1, "card", "Message sent", 6, 0.84, true, 0, "7 PM - 9 PM", false, false],
  ["Sana Sheikh", 155000, "11 days ago", 264, 11, "Card declined", 3, "card", "Queued", 8, 0.77, false, 1, "1 PM - 4 PM", false, false],
  ["Aditya Menon", 72000, "18 hrs ago", 18, 1, "UPI timeout", 2, "upi", "Queued", 10, 0.89, true, 0, "8 PM - 10 PM", false, false],
  ["Mira Kulkarni", 52000, "14 days ago", 336, 14, "Payment abandoned", 1, "wallet", "Queued", 2, 0.58, false, 2, "5 PM - 7 PM", false, false],
  ["Reyansh Sinha", 410000, "7 days ago", 168, 7, "Card failure", 4, "card", "Queued", 13, 0.83, true, 1, "10 AM - 12 PM", true, true],
  ["Aditi Joshi", 39000, "30 mins ago", 1, 0, "Technical failure", 1, "upi", "Queued", 6, 0.87, true, 0, "6 PM - 8 PM", false, false],
  ["Yash Agarwal", 118000, "16 days ago", 384, 16, "Mandate failure", 3, "upi", "Scheduled", 18, 0.92, true, 1, "9 AM - 10 AM", false, false],
  ["Riya Chatterjee", 83000, "21 days ago", 504, 21, "Insufficient funds", 4, "netbanking", "Queued", 3, 0.55, false, 2, "10 AM - 11 AM", false, false],
  ["Om Prakash", 66000, "1 hr ago", 1, 0, "UPI timeout", 1, "upi", "Queued", 9, 0.91, true, 0, "7 PM - 9 PM", false, false],
  ["Leela Fernandes", 197000, "25 days ago", 600, 25, "Bank declined", 5, "card", "Queued", 7, 0.66, false, 3, "2 PM - 4 PM", true, false],
  ["Harsh Vardhan", 25000, "2 days ago", 48, 2, "Incorrect OTP", 2, "card", "Queued", 5, 0.73, true, 0, "6 PM - 7 PM", false, false],
  ["Zoya Ansari", 132000, "4 hrs ago", 4, 0, "Payment abandoned", 1, "upi", "Queued", 12, 0.9, true, 0, "8 PM - 10 PM", false, false],
  ["Manav Bhatia", 222000, "31 days ago", 744, 31, "Card declined", 4, "card", "Human review", 5, 0.61, false, 3, "12 PM - 2 PM", true, false],
  ["Dia Shah", 59000, "3 days ago", 72, 3, "Mandate failure", 2, "upi", "Queued", 11, 0.86, true, 0, "9 AM - 11 AM", false, false],
  ["Kunal Arora", 105000, "10 hrs ago", 10, 0, "Technical failure", 2, "netbanking", "Queued", 16, 0.97, true, 0, "4 PM - 7 PM", false, false],
  ["Meera Jain", 12000, "45 days ago", 1080, 45, "45 days overdue", 1, "wallet", "Human review", 1, 0.38, false, 4, "6 PM - 8 PM", false, false],
];

const queueSeed: QueueRecord[] = seedRows.map((row) => {
  const [
    customerName,
    amountDue,
    lastAttempt,
    hoursSinceAttempt,
    daysOverdue,
    failure,
    attempts,
    method,
    status,
    priorPaidInvoices,
    successRate,
    whatsappResponsive,
    ignoredReminders,
    preferredWindow,
    prefersCall,
    previousPartialPayment,
  ] = row;
  const id = customerName.toLowerCase().replace(/[^a-z]+/g, "_").replace(/_$/, "");
  const createdAt = 1788153000 - hoursSinceAttempt * 3600;
  return {
    customerName,
    amountDue,
    lastAttempt,
    hoursSinceAttempt,
    daysOverdue,
    failure,
    attempts,
    method,
    status,
    priorPaidInvoices,
    successRate,
    whatsappResponsive,
    ignoredReminders,
    preferredWindow,
    prefersCall,
    previousPartialPayment,
    order: {
      id: `order_${id}`,
      entity: "order",
      amount: amountDue,
      amount_paid: 0,
      amount_due: amountDue,
      currency: "INR",
      receipt: `rcpt_${id}`,
      status: attempts > 0 ? "attempted" : "created",
      attempts,
      created_at: createdAt - 86400,
      customer_id: `cust_${id}`,
      customer_name: customerName,
      invoice_id: `inv_${id.slice(0, 12)}`,
      due_date: createdAt - daysOverdue * 86400,
    },
    payment: {
      id: `pay_${id}`,
      entity: "payment",
      amount: amountDue,
      currency: "INR",
      status: "failed",
      order_id: `order_${id}`,
      method,
      captured: false,
      email: `${id.replaceAll("_", ".")}@example.com`,
      contact: `+91 9${String(Math.abs(hash(id))).slice(0, 9).padEnd(9, "7")}`,
      error_code: "BAD_REQUEST_ERROR",
      error_description: failure,
      error_source: method === "card" ? "bank" : method,
      error_step: failure === "Payment abandoned" ? "payment_authentication" : "payment_processing",
      error_reason: failure.toLowerCase().replaceAll(" ", "_"),
      created_at: createdAt,
    },
  };
});

const technicalFailures: FailureReason[] = ["UPI timeout", "Incorrect OTP", "Bank declined", "Mandate failure", "Technical failure", "Card declined", "Card failure"];

const syntheticTotals = {
  totalReceivables: 12400000,
  collected: 9680000,
  recoverable: 2720000,
  opportunity: 1840000,
  projected: 1160000,
  customers: 427,
  technicalLeakage: 1180000,
  humanLeakage: 1540000,
};

const failureChart = [
  { reason: "Insufficient funds", value: 38 },
  { reason: "Incorrect OTP", value: 29 },
  { reason: "UPI timeout", value: 46 },
  { reason: "Bank declined", value: 31 },
  { reason: "Payment abandoned", value: 42 },
  { reason: "Mandate failure", value: 24 },
  { reason: "Technical failure", value: 35 },
];

const priorityColors = ["#00a884", "#f59e0b", "#697586"];
const funnelData = [
  { name: "Due", value: 124, fill: "#111827" },
  { name: "Attempted", value: 108, fill: "#2563eb" },
  { name: "At Risk", value: 27.2, fill: "#dc2626" },
  { name: "AI Targeted", value: 18.4, fill: "#7c3aed" },
  { name: "Recovered", value: 11.6, fill: "#00a884" },
];
const agents = [
  {
    name: "Recovery Intelligence Agent",
    promise: "Finds the money",
    status: "Scanning 427 open receivables",
    icon: <BrainCircuit size={20} />,
    responsibilities: ["Detects revenue at risk", "Calculates recovery probability", "Prioritizes customers", "Estimates expected recovery value"],
  },
  {
    name: "Technical Recovery Agent",
    promise: "Fixes the payment path",
    status: "18 payment paths optimised",
    icon: <Route size={20} />,
    responsibilities: ["Detects failure reason", "Chooses retry strategy", "Suggests alternate payment method", "Handles mandate/payment-link recovery"],
  },
  {
    name: "Engagement Agent",
    promise: "Finds the right moment",
    status: "83 customer journeys scheduled",
    icon: <MessageCircle size={20} />,
    responsibilities: ["Selects WhatsApp / SMS / Email", "Chooses best contact time", "Personalizes communication", "Learns from response patterns"],
  },
  {
    name: "Voice Recovery Agent",
    promise: "Handles conversations",
    status: "12 high-value conversations identified",
    icon: <Headphones size={20} />,
    responsibilities: ["Calls selected high-value customers", "Understands payment hesitation", "Answers basic payment-related questions", "Suggests the appropriate next step", "Escalates when human intervention is needed"],
    note: "Context-aware AI voice - not generic robocalling",
  },
  {
    name: "Escalation Agent",
    promise: "Knows when AI should stop",
    status: "7 cases routed for human review",
    icon: <UserCheck size={20} />,
    responsibilities: ["Detects sensitive or complex cases", "Identifies repeated failed engagement", "Escalates to human collections team", "Provides complete case context"],
  },
];

function hash(value: string) {
  return value.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7);
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactInr(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1).replace(/\.0$/, "")} L`;
  return formatInr(value);
}

function getRecoveryStrategy(record: QueueRecord): Strategy {
  let score = 38;
  const technical = technicalFailures.includes(record.failure);
  const human =
    record.failure === "Payment abandoned" ||
    record.failure === "Insufficient funds" ||
    record.ignoredReminders > 0 ||
    record.prefersCall ||
    record.daysOverdue > 7;

  if (record.hoursSinceAttempt <= 6) score += 15;
  else if (record.hoursSinceAttempt <= 48) score += 9;
  if (record.priorPaidInvoices >= 8) score += 20;
  else if (record.priorPaidInvoices >= 3) score += 10;
  if (technical) score += 15;
  if (record.successRate >= 0.85) score += 15;
  else if (record.successRate >= 0.7) score += 8;
  if (record.whatsappResponsive) score += 10;
  if (record.amountDue >= 100000) score += 5;
  if (record.attempts > 3) score -= 10;
  if (record.daysOverdue > 30) score -= 20;
  else if (record.daysOverdue > 14) score -= 8;
  if (record.ignoredReminders > 0) score -= record.ignoredReminders >= 3 ? 15 : 7;
  if (["Bank declined", "Card declined", "Card failure"].includes(record.failure) && record.attempts >= 3) score -= 10;

  if (record.customerName === "Aarav Sharma") score = 94;
  if (record.customerName === "Priya Mehta") score = 91;
  if (record.customerName === "Rohan Kapoor") score = 84;
  if (record.customerName === "Arjun Rao") score = 78;
  if (record.customerName === "Meera Jain") score = 31;

  const leakType: LeakType = technical && human ? "Technical + Human" : technical ? "Technical" : "Human";
  const recoveryScore = Math.max(18, Math.min(98, score));
  const recoveryProbability = record.customerName === "Aarav Sharma" ? 0.87 : Math.min(0.92, Math.max(0.18, recoveryScore / 112 + (technical ? 0.05 : -0.02)));
  const expectedRecoveryValue = Math.round(record.amountDue * recoveryProbability);
  const priority: Priority = recoveryScore >= 78 ? "High" : recoveryScore >= 55 ? "Medium" : "Low";
  const technicalLeakLevel = technical && recoveryScore >= 75 ? "HIGH" : technical ? "MEDIUM" : "LOW";
  const humanLeakLevel = human && (record.prefersCall || record.ignoredReminders >= 2 || record.failure === "Payment abandoned") ? "HIGH" : human ? "MEDIUM" : "LOW";

  let recommendedAction = "Send contextual reminder";
  if (record.failure === "UPI timeout" || record.failure === "Technical failure") recommendedAction = "WhatsApp + UPI Retry";
  if (record.failure === "Card declined" || record.failure === "Bank declined") recommendedAction = "Alternate Payment Method";
  if (record.failure === "Insufficient funds") recommendedAction = "Retry Tomorrow 10 AM";
  if (record.amountDue >= 200000 || record.prefersCall) recommendedAction = "Call + Partial Payment";
  if (record.failure === "Mandate failure") recommendedAction = "Mandate Re-authorisation";
  if (record.status === "Human review") recommendedAction = "Human Review";

  const assignedAgent: AssignedAgent =
    record.status === "Human review"
      ? "Escalation Agent"
      : record.prefersCall || record.amountDue >= 200000
        ? "Voice Recovery Agent"
        : leakType === "Technical"
          ? "Technical Recovery Agent"
          : "Engagement Agent";

  const recommendedChannel =
    assignedAgent === "Voice Recovery Agent" ? "Call" : record.whatsappResponsive ? "WhatsApp" : record.daysOverdue > 14 ? "Email" : "SMS";
  const recommendedTime =
    record.failure === "Insufficient funds" ? "Tomorrow, 10:00 AM" : record.preferredWindow.includes("PM") ? "Today, 7:15 PM" : "Tomorrow, 10:15 AM";

  const technicalReasons = technical
    ? [
        `${record.failure} occurred inside the payment journey`,
        record.method === "upi" ? "Customer has successfully used UPI before" : "Alternate payment rails can reduce method friction",
        "The bank did not provide a final successful capture event",
      ]
    : ["Payment path is not the primary blocker", "No fresh gateway error needs technical recovery", "Resolution depends on timing, conversation, or context"];

  const humanReasons = human
    ? [
        record.ignoredReminders > 0 ? `${record.ignoredReminders} previous reminder${record.ignoredReminders > 1 ? "s were" : " was"} ignored` : "Customer has not retried after the failed journey",
        `Previous recovery performs better around ${record.preferredWindow}`,
        record.prefersCall ? "Customer historically prefers calls for high-value invoices" : "Channel and timing determine whether the customer returns",
      ]
    : ["Customer intent is fresh", "Low evidence of reminder fatigue", "A direct retry path should be enough"];

  const vulcanReasons = [
    record.hoursSinceAttempt <= 48 ? "Recent payment attempt" : "Open receivable still has measurable recovery value",
    record.priorPaidInvoices >= 8 ? "Strong historical payment record" : "Known customer payment history",
    technical ? "Failure appears recoverable through payment-path intervention" : "Leakage is concentrated in follow-up behavior",
    record.amountDue >= 100000 ? "High invoice value" : "Low-touch recovery is economical",
    record.whatsappResponsive || record.prefersCall ? "Known engagement preference exists" : "Escalation threshold prevents over-contacting",
    `Customer historically completes payments between ${record.preferredWindow}`,
  ];

  return {
    recoveryScore,
    recoveryProbability,
    expectedRecoveryValue,
    recommendedChannel,
    recommendedTime,
    recommendedAction,
    priority,
    leakType,
    assignedAgent,
    technicalLeakLevel,
    humanLeakLevel,
    technicalReasons,
    humanReasons,
    vulcanReasons,
  };
}

export function RecoverAIApp() {
  const [query, setQuery] = useState("");
  const [failureFilter, setFailureFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState("score");
  const [selectedId, setSelectedId] = useState("order_aarav_sharma");
  const [sent, setSent] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [mission, setMission] = useState<Mission>("technical");
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const [overrideMode, setOverrideMode] = useState<"Autopilot" | "Paused" | "Human Review">("Autopilot");
  const [overrideLog, setOverrideLog] = useState("No manual override active");

  const rows = useMemo(() => queueSeed.map((record) => ({ ...record, strategy: getRecoveryStrategy(record) })), []);
  const selected = rows.find((row) => row.order.id === selectedId) ?? rows[0];
  const selectedStrategy = selected.strategy;
  const recoveredAmount = recovered ? selected.amountDue : 0;

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => row.customerName.toLowerCase().includes(query.toLowerCase()))
      .filter((row) => failureFilter === "All" || row.failure === failureFilter)
      .filter((row) => statusFilter === "All" || row.status === statusFilter)
      .sort((a, b) => {
        if (sortKey === "score") return b.strategy.recoveryScore - a.strategy.recoveryScore;
        if (sortKey === "amount") return b.amountDue - a.amountDue;
        if (sortKey === "overdue") return b.daysOverdue - a.daysOverdue;
        if (sortKey === "attempts") return b.attempts - a.attempts;
        return a.customerName.localeCompare(b.customerName);
      });
  }, [failureFilter, query, rows, sortKey, statusFilter]);

  const priorityData = ["High", "Medium", "Low"].map((priority) => ({
    name: priority,
    value: rows.filter((row) => row.strategy.priority === priority).reduce((sum, row) => sum + row.amountDue, 0),
  }));

  function handleSelect(id: string) {
    setSelectedId(id);
    setSent(false);
    setRecovered(false);
    setShowTimeline(false);
  }

  function runMission(nextMission: Mission) {
    setMission(nextMission);
    handleSelect(nextMission === "technical" ? "order_aarav_sharma" : "order_arjun_rao");
    setShowTimeline(true);
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#111827]">
      <section className="border-b border-[#d9e0ea] bg-[#101827] text-white">
        <div className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-[#b7f4dd]">
                  <Sparkles size={14} /> Prototype using simulated payment data
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-[#c7d2fe]">
                  <ShieldCheck size={14} /> Agentic revenue recovery system
                </span>
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8ea0b8]">RecoverAI</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-normal md:text-6xl">₹27.2L Revenue At Risk</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#cbd5e1] md:text-lg">
                RecoverAI has identified ₹18.4L that may be recoverable through intelligent technical and human intervention.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-[#94a3b8]">
                Payments do not only fail because technology fails. Revenue also leaks because follow-up fails.
              </p>
            </div>
            <div className="grid min-w-[310px] grid-cols-3 overflow-hidden rounded-lg border border-white/15 bg-white/8 text-center">
              {["Detect", "Understand", "Recover"].map((label, index) => (
                <div key={label} className="border-r border-white/10 px-4 py-4 last:border-r-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8ea0b8]">0{index + 1}</p>
                  <p className="text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <LeakageCard
              kind="technical"
              title="Technical Leakage"
              value="₹11.8L at risk"
              label="Failures in the payment journey"
              examples={["UPI timeout", "Card declined", "Mandate failure", "Bank downtime", "Expired payment link", "Late payment confirmation"]}
            />
            <LeakageCard
              kind="human"
              title="Human Leakage"
              value="₹15.4L at risk"
              label="Failures in the recovery journey"
              examples={["Customer forgot to retry", "Wrong contact timing", "Wrong communication channel", "Generic reminder ignored", "Customer needs alternate option", "High-value invoice requires conversation"]}
            />
          </div>

          <div className="mt-5 rounded-lg border border-white/12 bg-white/8 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8ea0b8]">RecoverAI addresses both.</p>
            <div className="mt-3 grid items-center gap-3 text-center text-sm font-semibold md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <span className="rounded-md bg-[#12333e] px-4 py-3 text-[#7dd3fc]">Technical leakage</span>
              <span className="text-[#8ea0b8]">+</span>
              <span className="rounded-md bg-[#3a2435] px-4 py-3 text-[#f0abfc]">Human leakage</span>
              <span className="text-[#8ea0b8]">=</span>
              <span className="rounded-md bg-[#11352d] px-4 py-3 text-[#86efac]">Recoverable Revenue</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1500px] gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8">
        <div className="space-y-5">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={<IndianRupee size={20} />} label="Total Due" value={compactInr(syntheticTotals.totalReceivables)} hint={`${syntheticTotals.customers} open receivables`} />
            <KpiCard icon={<CheckCircle2 size={20} />} label="Collected" value={compactInr(syntheticTotals.collected + recoveredAmount)} hint="Captured payments" accent="green" />
            <KpiCard icon={<BellRing size={20} />} label="Revenue at Risk" value={compactInr(syntheticTotals.recoverable - recoveredAmount)} hint="Technical + human leakage" accent="red" />
            <KpiCard icon={<Bot size={20} />} label="AI Recovery Opportunity" value={compactInr(syntheticTotals.opportunity)} hint="Targetable by agents" accent="violet" />
          </section>

          <Panel title="Meet the Recovery Agent Fleet" icon={<Bot size={18} />}>
            <div className="grid gap-3 xl:grid-cols-5">
              {agents.map((agent) => (
                <AgentCard key={agent.name} {...agent} />
              ))}
            </div>
          </Panel>

          <Panel title="Agent Orchestration" icon={<GitBranch size={18} />}>
            <div className="grid gap-3 xl:grid-cols-[1fr_1.25fr]">
              <div className="rounded-lg border border-[#d9e0ea] bg-white p-4">
                <WorkflowStep label="FAILED / INCOMPLETE PAYMENT" tone="alert" />
                <Connector />
                <div className="rounded-lg border border-[#9b8cff] bg-[#f3f0ff] p-4 text-center">
                  <BrainCircuit className="mx-auto text-[#6d28d9]" size={30} />
                  <p className="mt-2 text-lg font-semibold">Vulcan Intelligence Layer</p>
                  <p className="mt-1 text-xs text-[#5b5270]">Prototype decision engine. Not a real Razorpay system.</p>
                </div>
                <Connector />
                <div className="grid gap-2 sm:grid-cols-3">
                  <WorkflowStep label="Technical" tone="technical" />
                  <WorkflowStep label="Human" tone="human" />
                  <WorkflowStep label="Both" tone="mixed" />
                </div>
                <Connector />
                <WorkflowStep label="PAYMENT RECOVERED" tone="success" />
              </div>
              <div className="rounded-lg border border-[#d9e0ea] bg-[#101827] p-4 text-white">
                <p className="text-sm font-semibold text-[#cbd5e1]">Route to Agent Fleet</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {["Technical Recovery Agent", "Engagement Agent", "Voice Agent", "Payment Resolution Agent"].map((agent) => (
                    <div key={agent} className="rounded-md border border-white/10 bg-white/8 p-3 text-sm font-semibold">{agent}</div>
                  ))}
                </div>
                <div className="mt-5 rounded-md border border-white/10 bg-white/8 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8ea0b8]">Governance layer</p>
                  <p className="mt-2 text-sm text-[#dbe4ef]">Consent • Customer Preferences • Merchant Policy • Risk Controls • Human Escalation</p>
                </div>
              </div>
            </div>
          </Panel>

          <section className="grid gap-5 xl:grid-cols-2">
            <Panel title="Where Revenue Leaks" icon={<TrendingUp size={18} />}>
              <div className="grid gap-3 sm:grid-cols-2">
                <ImpactFunnel
                  title="Technical Funnel"
                  value="₹11.8L technical leakage"
                  steps={["Payment attempted", "Technical failure", "Recovery path generated", "Successful retry"]}
                  targeted="₹8.7L targeted"
                  projected="₹6.3L projected recovery"
                  tone="technical"
                />
                <ImpactFunnel
                  title="Human Funnel"
                  value="₹15.4L human leakage"
                  steps={["Payment due", "Customer did not complete payment", "AI engagement", "Conversation / reminder / partial payment", "Recovered"]}
                  targeted="₹9.7L targeted"
                  projected="₹5.3L projected recovery"
                  tone="human"
                />
              </div>
              <div className="mt-3 rounded-md bg-[#111827] p-4 text-center text-white">
                <p className="text-xs uppercase tracking-[0.16em] text-[#9ca3af]">Total Projected Recovery</p>
                <p className="mt-1 text-3xl font-semibold">₹11.6L</p>
              </div>
            </Panel>

            <Panel title="Revenue Analytics" icon={<Gauge size={18} />}>
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={priorityData} dataKey="value" innerRadius={48} outerRadius={82} paddingAngle={3}>
                        {priorityColors.map((color) => <Cell key={color} fill={color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [compactInr(Number(value)), "Recoverable"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={failureChart} margin={{ left: -18, right: 4, top: 8, bottom: 54 }}>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="reason" angle={-35} textAnchor="end" interval={0} height={72} tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>
          </section>

          <Panel title="Run Recovery Mission" icon={<Zap size={18} />}>
            <div className="grid gap-3 md:grid-cols-2">
              <MissionButton active={mission === "technical"} title="Scenario 1" subtitle="Fix a Technical Leak" detail="UPI Timeout • ₹48,000" onClick={() => runMission("technical")} />
              <MissionButton active={mission === "human"} title="Scenario 2" subtitle="Fix a Human Leak" detail="High-value overdue payment • ₹2,40,000" onClick={() => runMission("human")} />
            </div>
          </Panel>

          <Panel title="Recovery Funnel" icon={<TrendingUp size={18} />}>
            <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-3">
                {[
                  ["Total Due", "₹1.24 Cr Due"],
                  ["Payment Attempted", "₹1.08 Cr Attempted"],
                  ["At Risk", "₹27.2 L At Risk"],
                  ["AI Targeted", "₹18.4 L High Recovery Potential"],
                  ["Recovered", recovered ? `${compactInr(1160000 + recoveredAmount)} Projected + Simulated` : "₹11.6 L Projected Recovery"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center gap-3 rounded-md border border-[#d9e0ea] bg-white px-3 py-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#00a884]" />
                    <div>
                      <p className="text-xs text-[#667085]">{label}</p>
                      <p className="text-sm font-semibold">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip formatter={(value) => [`₹${value} L`, "Value"]} />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="right" fill="#111827" stroke="none" dataKey="name" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Panel>

          <Panel title="AI Recovery Queue" icon={<SlidersHorizontal size={18} />}>
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer" className="h-10 w-full rounded-md border border-[#cfd8e3] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#2563eb]" />
              </div>
              <Select icon={<Filter size={16} />} value={failureFilter} onChange={setFailureFilter} options={["All", ...Array.from(new Set(rows.map((row) => row.failure)))]} />
              <Select value={statusFilter} onChange={setStatusFilter} options={["All", "Queued", "Message sent", "Scheduled", "Human review"]} />
              <Select icon={<ArrowDownUp size={16} />} value={sortKey} onChange={setSortKey} options={["score", "amount", "overdue", "attempts", "customer"]} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1220px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-y border-[#d9e0ea] bg-[#f8fafc] text-xs uppercase tracking-[0.08em] text-[#667085]">
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                    <th className="px-3 py-3">Failure</th>
                    <th className="px-3 py-3">Leak Type</th>
                    <th className="px-3 py-3">Assigned Agent</th>
                    <th className="px-3 py-3 text-right">Attempts</th>
                    <th className="px-3 py-3">AI Score</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.order.id} onClick={() => handleSelect(row.order.id)} className={`cursor-pointer border-b border-[#e6ebf1] transition hover:bg-[#f0f7ff] ${selected.order.id === row.order.id ? "bg-[#ecfdf7]" : "bg-white"}`}>
                      <td className="px-3 py-3 font-semibold">{row.customerName}<p className="text-xs font-normal text-[#667085]">{row.lastAttempt}</p></td>
                      <td className="px-3 py-3 text-right font-semibold">{formatInr(row.amountDue)}</td>
                      <td className="px-3 py-3">{row.failure}</td>
                      <td className="px-3 py-3"><LeakPill type={row.strategy.leakType} /></td>
                      <td className="px-3 py-3 font-medium text-[#344054]">{row.strategy.assignedAgent}</td>
                      <td className="px-3 py-3 text-right">{row.attempts}</td>
                      <td className="px-3 py-3"><PriorityPill score={row.strategy.recoveryScore} priority={row.strategy.priority} /></td>
                      <td className="px-3 py-3"><span className="rounded-full bg-[#eef2ff] px-2 py-1 text-xs font-semibold text-[#4338ca]">{row.status}</span></td>
                      <td className="px-3 py-3 font-medium">{row.strategy.recommendedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <Panel title={selected.customerName} icon={<Bot size={18} />}>
            <div className="rounded-lg border border-[#d9e0ea] bg-[#101827] p-4 text-white">
              <p className="text-sm text-[#9ca3af]">{formatInr(selected.amountDue)} Revenue At Risk</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Metric dark label="Recovery Score" value={`${selectedStrategy.recoveryScore} / 100`} />
                <Metric dark label="Probability" value={`${Math.round(selectedStrategy.recoveryProbability * 100)}%`} />
                <Metric dark label="Expected Value" value={formatInr(selectedStrategy.expectedRecoveryValue)} />
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#d9e0ea] bg-white p-4">
              <h3 className="text-sm font-semibold">What is leaking?</h3>
              <LeakMeter title="Technical Leakage" level={selectedStrategy.technicalLeakLevel} tone="technical" />
              <LeakMeter title="Human Leakage" level={selectedStrategy.humanLeakLevel} tone="human" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DecisionBlock title="Technical">
                  {selectedStrategy.technicalReasons.map((reason) => <li key={reason}>{reason}</li>)}
                </DecisionBlock>
                <DecisionBlock title="Human">
                  {selectedStrategy.humanReasons.map((reason) => <li key={reason}>{reason}</li>)}
                </DecisionBlock>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#d9e0ea] bg-white p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><BrainCircuit size={16} /> Vulcan Decision</h3>
              <p className="mt-2 rounded-md bg-[#ecfdf7] p-3 text-sm font-semibold text-[#067647]">This customer should be pursued now.</p>
              <DecisionBlock title="Why">
                {selectedStrategy.vulcanReasons.map((reason) => <li key={reason}>{reason}</li>)}
              </DecisionBlock>
            </div>

            <div className="mt-4 rounded-lg border border-[#d9e0ea] bg-white p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><MessageCircle size={16} /> AI Recommended Engagement</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Metric label="Assigned Agent" value={selectedStrategy.assignedAgent.replace(" Agent", "")} />
                <Metric label="Best Time" value={selectedStrategy.recommendedTime} />
              </div>
              <div className="mt-4 rounded-md border border-[#e6ebf1] bg-[#f8fafc] p-3 text-sm text-[#344054]">
                &ldquo;Hi {selected.customerName.split(" ")[0]}, your {formatInr(selected.amountDue)} payment is still open. RecoverAI has found the right next step so you can complete it securely.&rdquo;
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => { setSent(true); setShowTimeline(true); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#111827] px-3 text-sm font-semibold text-white hover:bg-[#263244]">
                  <Send size={16} /> Send Now
                </button>
                <button onClick={() => setShowTimeline(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#cfd8e3] bg-white px-3 text-sm font-semibold hover:bg-[#f8fafc]">
                  <CalendarClock size={16} /> Schedule
                </button>
              </div>
            </div>

            {(sent || showTimeline) && <AgentTrace record={selected} recovered={recovered} />}

            <div className="mt-4 rounded-lg border border-[#d9e0ea] bg-[#101827] p-4 text-white">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><RefreshCcw size={16} /> Intelligent Recovery Recommendation</h3>
              <p className="mt-2 text-xl font-semibold">{selectedStrategy.recommendedAction}</p>
              <p className="mt-1 text-sm text-[#cbd5e1]">{recommendationCopy(selected)}</p>
              {selected.amountDue >= 200000 && (
                <div className="mt-3 rounded-md bg-white/10 p-3 text-sm">
                  <div className="flex justify-between"><span>Total Due</span><strong>{formatInr(selected.amountDue)}</strong></div>
                  <div className="mt-1 flex justify-between"><span>Pay today</span><strong>{formatInr(Math.round(selected.amountDue / 3))}</strong></div>
                  <div className="mt-1 flex justify-between"><span>Balance later</span><strong>{formatInr(selected.amountDue - Math.round(selected.amountDue / 3))}</strong></div>
                </div>
              )}
              {!recovered ? (
                <button onClick={() => setRecovered(true)} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-[#101827] hover:bg-[#edf4f0]">
                  <Banknote size={17} /> {selected.amountDue >= 200000 ? "Accept Partial Plan" : `Retry ${formatInr(selected.amountDue)}`}
                </button>
              ) : (
                <div className="mt-4 rounded-md bg-[#dff7ea] p-4 text-center text-[#067647]">
                  <CheckCircle2 className="mx-auto mb-2" size={24} />
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]">Payment Successful</p>
                  <p className="text-2xl font-semibold">{selected.amountDue >= 200000 ? "₹80,000 recovered today" : `${formatInr(selected.amountDue)} recovered`}</p>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Human Leak Demo" icon={<Phone size={18} />}>
            <div className="rounded-lg border border-[#ead4ff] bg-[#fcf7ff] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7e22ce]">Simulated AI voice interaction</p>
              <h3 className="mt-2 text-xl font-semibold">Arjun Rao • ₹2,40,000</h3>
              <p className="mt-2 text-sm text-[#5b4766]">Payment technically works, but the recovery journey is leaking because three reminders were ignored and this high-value invoice needs a conversation.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <LeakMeter title="Technical Leakage" level="LOW" tone="technical" compact />
                <LeakMeter title="Human Leakage" level="HIGH" tone="human" compact />
              </div>
              <div className="mt-4 rounded-md bg-white p-3 text-sm">
                <p className="font-semibold">Vulcan recommendation: Deploy Voice Recovery Agent</p>
                <Transcript speaker="AI" text="Hi Arjun, I'm calling regarding the ₹2,40,000 payment due on your account. Would now be a convenient time to discuss it?" />
                <Transcript speaker="Customer" text="I can't make the entire payment today." />
                <Transcript speaker="AI" text="Would it help if you made ₹80,000 today and completed the remaining balance later?" />
                <Transcript speaker="Customer" text="Yes, I can do that." />
                <div className="mt-3 rounded-md bg-[#ecfdf7] p-3 text-[#067647]">
                  <p className="font-semibold">Partial-payment plan accepted</p>
                  <p>₹80,000 recovered today • ₹1,60,000 scheduled</p>
                </div>
              </div>
              <button onClick={() => runMission("human")} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#7e22ce] px-3 text-sm font-semibold text-white hover:bg-[#6b21a8]">
                <Phone size={16} /> Run Human Leak Mission
              </button>
            </div>
          </Panel>
        </aside>
      </div>
      <AgenticChatInterface
        open={agentPanelOpen}
        onOpenChange={setAgentPanelOpen}
        selected={selected}
        mode={overrideMode}
        overrideLog={overrideLog}
        onOverride={(nextMode, note) => {
          setOverrideMode(nextMode);
          setOverrideLog(note);
        }}
      />
    </main>
  );
}

function recommendationCopy(record: QueueRecord) {
  if (record.customerName === "Arjun Rao") return "The payment path is available. RecoverAI should recover through a context-aware voice conversation and partial-payment plan.";
  if (record.failure === "UPI timeout" || record.failure === "Technical failure") return "Temporary payment failure detected. Retry is likely to succeed once the path is corrected.";
  if (["Card declined", "Card failure", "Bank declined"].includes(record.failure)) return "Reduce bank/card friction by offering UPI, netbanking, and alternate card options.";
  if (record.failure === "Insufficient funds") return "Delay the retry to tomorrow morning when balance availability is more likely.";
  if (record.failure === "Mandate failure") return "Ask the customer to re-authorise the mandate before the next billing cycle.";
  return "The recovery journey is leaking. A contextual reminder, call, or escalation is more important than another generic payment nudge.";
}

function KpiCard({ icon, label, value, hint, accent = "blue" }: { icon: ReactNode; label: string; value: string; hint: string; accent?: "blue" | "green" | "red" | "violet" }) {
  const colors = {
    blue: "bg-[#e8f0ff] text-[#2563eb]",
    green: "bg-[#e7f8ef] text-[#00875a]",
    red: "bg-[#fff1f0] text-[#dc2626]",
    violet: "bg-[#f2eaff] text-[#7c3aed]",
  };
  return (
    <div className="rounded-lg border border-[#d9e0ea] bg-white p-4 shadow-sm">
      <div className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md ${colors[accent]}`}>{icon}</div>
      <p className="text-sm text-[#667085]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-[#667085]">{hint}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#d9e0ea] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#2563eb]">{icon}</span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function LeakageCard({ kind, title, value, label, examples }: { kind: "technical" | "human"; title: string; value: string; label: string; examples: string[] }) {
  const technical = kind === "technical";
  return (
    <div className={`rounded-lg border p-5 ${technical ? "border-[#164e63] bg-[#082f49]" : "border-[#6b215f] bg-[#3b1238]"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className={`mt-2 text-3xl font-semibold ${technical ? "text-[#67e8f9]" : "text-[#f0abfc]"}`}>{value}</p>
          <p className="mt-1 text-sm text-white/70">{label}</p>
        </div>
        <span className={`rounded-md p-2 ${technical ? "bg-cyan-300/15 text-cyan-200" : "bg-fuchsia-300/15 text-fuchsia-200"}`}>{technical ? <CreditCard size={22} /> : <MessageCircle size={22} />}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((example) => <span key={example} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/85">{example}</span>)}
      </div>
    </div>
  );
}

function AgentCard({ name, promise, status, responsibilities, icon, note }: { name: string; promise: string; status: string; responsibilities: string[]; icon: ReactNode; note?: string }) {
  return (
    <div className="rounded-lg border border-[#d9e0ea] bg-[#fbfcfe] p-4">
      <div className="flex h-full flex-col">
        <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#eef4ff] text-[#2563eb]">{icon}</span>
        <h3 className="text-sm font-semibold">{name}</h3>
        <p className="mt-1 text-sm font-semibold text-[#2563eb]">{promise}</p>
        <ul className="mt-3 flex-1 space-y-1.5 pl-4 text-xs text-[#475467] marker:text-[#00a884]">
          {responsibilities.map((item) => <li key={item}>{item}</li>)}
        </ul>
        {note && <p className="mt-3 rounded-md bg-[#fff7ed] p-2 text-xs font-semibold text-[#9a3412]">{note}</p>}
        <p className="mt-3 rounded-md bg-white p-2 text-xs font-semibold text-[#344054]">{status}</p>
      </div>
    </div>
  );
}

function WorkflowStep({ label, tone }: { label: string; tone: "alert" | "technical" | "human" | "mixed" | "success" }) {
  const tones = {
    alert: "bg-[#fff1f0] text-[#b42318] border-[#fecaca]",
    technical: "bg-[#ecfeff] text-[#0e7490] border-[#a5f3fc]",
    human: "bg-[#fdf4ff] text-[#a21caf] border-[#f5d0fe]",
    mixed: "bg-[#eef2ff] text-[#4338ca] border-[#c7d2fe]",
    success: "bg-[#ecfdf7] text-[#067647] border-[#bbf7d0]",
  };
  return <div className={`rounded-md border px-3 py-3 text-center text-sm font-semibold ${tones[tone]}`}>{label}</div>;
}

function Connector() {
  return <div className="flex h-8 items-center justify-center text-[#98a2b3]">↓</div>;
}

function ImpactFunnel({ title, value, steps, targeted, projected, tone }: { title: string; value: string; steps: string[]; targeted: string; projected: string; tone: "technical" | "human" }) {
  const color = tone === "technical" ? "#0891b2" : "#c026d3";
  return (
    <div className="rounded-lg border border-[#d9e0ea] bg-[#fbfcfe] p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm font-semibold" style={{ color }}>{value}</p>
      <div className="mt-3 space-y-2">
        {steps.map((step, index) => (
          <div key={step}>
            <div className="rounded-md bg-white px-3 py-2 text-xs font-medium text-[#344054]">{step}</div>
            {index < steps.length - 1 && <Connector />}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
        <span className="rounded-md bg-white p-2">{targeted}</span>
        <span className="rounded-md bg-white p-2">{projected}</span>
      </div>
    </div>
  );
}

function MissionButton({ active, title, subtitle, detail, onClick }: { active: boolean; title: string; subtitle: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-lg border p-4 text-left transition ${active ? "border-[#2563eb] bg-[#eef4ff]" : "border-[#d9e0ea] bg-white hover:bg-[#f8fafc]"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">{title}</p>
      <p className="mt-1 text-lg font-semibold">{subtitle}</p>
      <p className="mt-1 text-sm text-[#475467]">{detail}</p>
    </button>
  );
}

function AgentTrace({ record, recovered }: { record: QueueRecord; recovered: boolean }) {
  const technicalMission = record.customerName !== "Arjun Rao";
  const events = technicalMission
    ? [
        ["6:51 PM", "Recovery Intelligence Agent", `Detected ${formatInr(record.amountDue)} revenue opportunity.`],
        ["6:51 PM", "Vulcan", `Recovery score: ${getRecoveryStrategy(record).recoveryScore}. Leak classification: ${getRecoveryStrategy(record).leakType}.`],
        ["6:52 PM", "Engagement Agent", "Selected WhatsApp. Best time: 7:15 PM."],
        ["7:15 PM", "Engagement Agent", "Message sent."],
        ["7:17 PM", "Customer", "Opened payment link."],
        ["7:18 PM", "Technical Recovery Agent", "Detected previous UPI timeout. Recommended: Retry UPI."],
        ["7:19 PM", recovered ? "PAYMENT SUCCESSFUL" : "Payment attempt ready", recovered ? `${formatInr(record.amountDue)} RECOVERED` : "Awaiting simulated retry."],
      ]
    : [
        ["6:51 PM", "Recovery Intelligence Agent", "Detected ₹2,40,000 high-value revenue opportunity."],
        ["6:51 PM", "Vulcan", "Recovery score: 78. Leak classification: Technical + Human."],
        ["6:52 PM", "Voice Recovery Agent", "Customer prefers calls. Prior partial-payment plan succeeded."],
        ["7:05 PM", "Voice Recovery Agent", "Simulated AI voice interaction started."],
        ["7:08 PM", "Customer", "Cannot make the entire payment today."],
        ["7:09 PM", "Voice Recovery Agent", "Offered ₹80,000 today and ₹1,60,000 later."],
        ["7:10 PM", recovered ? "PAYMENT SUCCESSFUL" : "Partial plan ready", recovered ? "₹80,000 RECOVERED • ₹1,60,000 SCHEDULED" : "Awaiting simulated acceptance."],
      ];
  return (
    <div className="mt-4 rounded-lg border border-[#d9e0ea] bg-white p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Clock3 size={16} /> AI Orchestration Trace</h3>
      <div className="mt-3 space-y-3">
        {events.map(([time, actor, text], index) => (
          <div key={`${time}-${actor}`} className="flex animate-[fadeIn_0.4s_ease_both] gap-3" style={{ animationDelay: `${index * 120}ms` }}>
            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]"><CheckCircle2 size={15} /></span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#667085]">{time}</p>
              <p className="text-sm font-semibold">{actor}</p>
              <p className="text-sm text-[#475467]">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgenticChatInterface({
  open,
  onOpenChange,
  selected,
  mode,
  overrideLog,
  onOverride,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: QueueRecord & { strategy: Strategy };
  mode: "Autopilot" | "Paused" | "Human Review";
  overrideLog: string;
  onOverride: (mode: "Autopilot" | "Paused" | "Human Review", note: string) => void;
}) {
  const deployedAgents = [
    {
      name: "Recovery Intelligence",
      state: "Scanning",
      metric: "427 receivables",
      detail: "Prioritising high EV opportunities",
      icon: <BrainCircuit size={17} />,
    },
    {
      name: "Technical Recovery",
      state: selected.strategy.technicalLeakLevel === "LOW" ? "Standby" : "Active",
      metric: "18 paths optimised",
      detail: "Retry rails and payment method routing",
      icon: <Route size={17} />,
    },
    {
      name: "Engagement",
      state: selected.strategy.recommendedChannel === "Call" ? "Queued" : "Active",
      metric: "83 journeys",
      detail: "Timing, channel, message personalisation",
      icon: <MessageCircle size={17} />,
    },
    {
      name: "Voice Recovery",
      state: selected.strategy.assignedAgent === "Voice Recovery Agent" ? "Active" : "Standby",
      metric: "12 conversations",
      detail: "Context-aware voice for high-value cases",
      icon: <Headphones size={17} />,
    },
    {
      name: "Escalation",
      state: selected.strategy.assignedAgent === "Escalation Agent" || mode === "Human Review" ? "Active" : "Guarding",
      metric: "7 reviews",
      detail: "Policy, risk, and human handoff controls",
      icon: <UserCheck size={17} />,
    },
  ];

  const feed = [
    ["Now", "Vulcan classified leak", selected.strategy.leakType],
    ["Now", "Assigned agent", selected.strategy.assignedAgent],
    ["Next", "Recommended action", selected.strategy.recommendedAction],
    ["Guardrail", "Override status", overrideLog],
  ];

  return (
    <>
      <button
        aria-label="Open Agentic AI assistant"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#111827] text-white shadow-2xl shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-[#263244]"
      >
        <Bot size={28} />
        <span className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#00a884]" />
      </button>

      {open && (
        <button
          aria-label="Close agent operations panel"
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-40 bg-[#101827]/35 backdrop-blur-[1px]"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[460px] flex-col border-l border-[#d9e0ea] bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="border-b border-[#e6ebf1] bg-[#101827] p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8ea0b8]">
                <Sparkles size={14} /> Agentic AI Interface
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Recovery Mission Control</h2>
              <p className="mt-2 text-sm text-[#cbd5e1]">
                Ask, inspect, override, or route agents while the recovery mission runs.
              </p>
            </div>
            <button
              aria-label="Close panel"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-white/10 bg-white/10 p-2 text-white hover:bg-white/15"
            >
              <PanelRightOpen size={18} />
            </button>
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/8 p-3">
            <p className="text-xs text-[#8ea0b8]">Current case</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="font-semibold">{selected.customerName}</p>
              <LeakPill type={selected.strategy.leakType} />
            </div>
            <p className="mt-1 text-sm text-[#cbd5e1]">
              {formatInr(selected.amountDue)} at risk • Score {selected.strategy.recoveryScore}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Agents deployed</h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${mode === "Autopilot" ? "bg-[#ecfdf7] text-[#067647]" : mode === "Paused" ? "bg-[#fff7e6] text-[#a16207]" : "bg-[#eef2ff] text-[#4338ca]"}`}>
                {mode}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {deployedAgents.map((agent) => (
                <div key={agent.name} className="rounded-lg border border-[#e6ebf1] bg-[#fbfcfe] p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#eef4ff] text-[#2563eb]">{agent.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{agent.name}</p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#475467]">{agent.state}</span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-[#2563eb]">{agent.metric}</p>
                      <p className="mt-1 text-xs text-[#667085]">{agent.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <h3 className="text-sm font-semibold">Live orchestration feed</h3>
            <div className="mt-3 space-y-3">
              {feed.map(([time, title, value]) => (
                <div key={`${time}-${title}`} className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#00a884]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#667085]">{time}</p>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-sm text-[#475467]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5 rounded-lg border border-[#d9e0ea] bg-[#f8fafc] p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Settings2 size={16} /> Human overrides</h3>
            <div className="mt-3 grid gap-2">
              <OverrideButton icon={<PlayCircle size={16} />} title="Resume Autopilot" detail="Let the assigned agent continue" onClick={() => onOverride("Autopilot", "Autopilot resumed for selected case")} />
              <OverrideButton icon={<PauseCircle size={16} />} title="Pause Agent Actions" detail="Freeze outbound messages and retries" onClick={() => onOverride("Paused", "Agent actions paused by operator")} />
              <OverrideButton icon={<UserCheck size={16} />} title="Route to Human Review" detail="Send full context to collections team" onClick={() => onOverride("Human Review", "Case routed to human collections review")} />
              <OverrideButton icon={<AlertTriangle size={16} />} title="Suppress Contact Today" detail="Respect customer preference or merchant policy" onClick={() => onOverride("Paused", "Customer contact suppressed for today")} />
            </div>
          </section>
        </div>

        <div className="border-t border-[#e6ebf1] bg-white p-4">
          <div className="rounded-lg border border-[#d9e0ea] bg-[#fbfcfe] p-3">
            <p className="text-xs font-semibold text-[#667085]">Agentic AI chat</p>
            <div className="mt-2 flex gap-2">
              <input
                readOnly
                value="What is happening with this recovery mission?"
                className="h-10 min-w-0 flex-1 rounded-md border border-[#cfd8e3] bg-white px-3 text-sm text-[#475467] outline-none"
              />
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#111827] text-white">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function OverrideButton({ icon, title, detail, onClick }: { icon: ReactNode; title: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-md border border-[#d9e0ea] bg-white p-3 text-left transition hover:border-[#2563eb] hover:bg-[#eef4ff]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#eef4ff] text-[#2563eb]">{icon}</span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-[#667085]">{detail}</span>
      </span>
    </button>
  );
}

function Select({ value, onChange, options, icon }: { value: string; onChange: (value: string) => void; options: string[]; icon?: ReactNode }) {
  return (
    <label className="relative">
      {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]">{icon}</span>}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`h-10 min-w-40 appearance-none rounded-md border border-[#cfd8e3] bg-white ${icon ? "pl-9" : "pl-3"} pr-9 text-sm capitalize outline-none focus:border-[#2563eb]`}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]" size={16} />
    </label>
  );
}

function PriorityPill({ score, priority }: { score: number; priority: Priority }) {
  const className = priority === "High" ? "bg-[#e7f8ef] text-[#067647]" : priority === "Medium" ? "bg-[#fff7e6] text-[#a16207]" : "bg-[#f1f5f9] text-[#475569]";
  return <span className={`inline-flex min-w-24 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{score} {priority}</span>;
}

function LeakPill({ type }: { type: LeakType }) {
  const className = type === "Technical" ? "bg-[#ecfeff] text-[#0e7490]" : type === "Human" ? "bg-[#fdf4ff] text-[#a21caf]" : "bg-[#eef2ff] text-[#4338ca]";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{type}</span>;
}

function Metric({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${dark ? "border-white/10 bg-white/8" : "border-[#e6ebf1] bg-white"}`}>
      <p className={`text-xs ${dark ? "text-[#9ca3af]" : "text-[#667085]"}`}>{label}</p>
      <p className={`${value.length > 16 ? "text-sm" : "text-lg"} mt-1 font-semibold`}>{value}</p>
    </div>
  );
}

function LeakMeter({ title, level, tone, compact = false }: { title: string; level: "LOW" | "MEDIUM" | "HIGH"; tone: "technical" | "human"; compact?: boolean }) {
  const width = level === "HIGH" ? "92%" : level === "MEDIUM" ? "58%" : "24%";
  const color = tone === "technical" ? "#0891b2" : "#c026d3";
  return (
    <div className={compact ? "mt-2" : "mt-4"}>
      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
        <span>{title}</span>
        <span style={{ color }}>{level}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#e6ebf1]">
        <div className="h-2 rounded-full" style={{ width, background: color }} />
      </div>
    </div>
  );
}

function DecisionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 space-y-2 pl-4 text-sm text-[#475467] marker:text-[#2563eb]">{children}</ul>
    </div>
  );
}

function Transcript({ speaker, text }: { speaker: string; text: string }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#667085]">{speaker}</p>
      <p className="mt-1 rounded-md bg-[#f8fafc] p-2 text-[#344054]">&ldquo;{text}&rdquo;</p>
    </div>
  );
}
