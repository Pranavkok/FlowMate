import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Zap, Shield, Clock, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Triggers",
    desc: "Connect any event — webhooks, schedules, app events, and more.",
    bg: "bg-yellow-300",
    shadow: "shadow-[4px_4px_0_#1a1a1a]",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    desc: "All workflows run in isolated environments with end-to-end encryption.",
    bg: "bg-cyan-300",
    shadow: "shadow-[4px_4px_0_#1a1a1a]",
  },
  {
    icon: Clock,
    title: "Always On",
    desc: "Your automations run 24/7 without you lifting a finger.",
    bg: "bg-pink-300",
    shadow: "shadow-[4px_4px_0_#1a1a1a]",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "Track every execution, success rate, and time saved across all flows.",
    bg: "bg-purple-300",
    shadow: "shadow-[4px_4px_0_#1a1a1a]",
  },
];

const steps = [
  { num: "01", title: "Choose a Trigger", desc: "Pick what kicks off your automation — a webhook, form, or schedule.", color: "bg-yellow-300" },
  { num: "02", title: "Add Actions", desc: "Stack multiple actions: send emails, transfer tokens, post updates.", color: "bg-pink-300" },
  { num: "03", title: "Go Live!", desc: "Activate your Zap and watch it run silently in the background.", color: "bg-cyan-300" },
];

const integrations = [
  { name: "Webhooks", emoji: "🔗" },
  { name: "Email", emoji: "✉️" },
  { name: "Solana", emoji: "◎" },
  { name: "Slack", emoji: "💬" },
  { name: "Discord", emoji: "🎮" },
  { name: "HTTP", emoji: "🌐" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FEFCE8]">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-300 border-2 border-black shadow-[3px_3px_0_#1a1a1a] mb-6">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                <span className="text-xs font-black text-black tracking-wide uppercase">Automation made simple</span>
              </div>

              <h1 className="font-black text-5xl lg:text-6xl text-black leading-[1.1] tracking-tight mb-6">
                Automate your
                <span className="block text-[#06D6A0] [-webkit-text-stroke:2px_#1a1a1a]"> workflow,</span>
                reclaim your time.
              </h1>

              <p className="text-lg text-gray-700 leading-relaxed mb-8 max-w-md font-medium">
                FlowMate connects your apps and services into seamless workflows — no code needed. Build once, run forever.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-white bg-black border-2 border-black shadow-[4px_4px_0_#06D6A0] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#06D6A0] transition-all"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-black bg-white border-2 border-black shadow-[4px_4px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#1a1a1a] transition-all"
                >
                  Sign in →
                </Link>
              </div>

              {/* Trust */}
              <div className="mt-10 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["bg-yellow-400", "bg-pink-400", "bg-cyan-400"].map((c, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-black ${c}`} />
                  ))}
                </div>
                <p className="text-sm font-bold text-black">
                  <span className="text-[#06D6A0]">2,400+</span> teams automate with FlowMate
                </p>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-3xl bg-white border-2 border-black shadow-[8px_8px_0_#1a1a1a] p-8 flex flex-col items-center justify-center min-h-[320px] animate-float">
                <div className="w-20 h-20 rounded-2xl bg-yellow-300 border-2 border-black shadow-[4px_4px_0_#1a1a1a] flex items-center justify-center mb-5">
                  <Zap className="w-10 h-10 text-black fill-black" />
                </div>
                <p className="text-xl font-black text-black mb-2">Workflow Automation</p>
                <p className="text-sm font-medium text-gray-600 text-center max-w-xs">Connect triggers to actions and let FlowMate handle the rest</p>

                {/* Mini flow */}
                <div className="mt-6 flex items-center gap-2">
                  {["⚡ Webhook", "→", "✉️ Email"].map((item, i) => (
                    <span key={i} className={`text-xs font-bold ${i === 1 ? "text-gray-500" : "px-3 py-1.5 bg-yellow-100 border-2 border-black rounded-lg"}`}>{item}</span>
                  ))}
                </div>
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-5 -left-5 bg-pink-300 rounded-2xl p-4 border-2 border-black shadow-[4px_4px_0_#1a1a1a] animate-float-delayed">
                <p className="text-xs font-bold text-black">Workflows ran today</p>
                <p className="text-2xl font-black text-black">48,293</p>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-cyan-300 rounded-full px-4 py-2 border-2 border-black shadow-[3px_3px_0_#1a1a1a] animate-wiggle">
                <span className="text-xs font-black text-black">🔥 HOT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Pills */}
      <section className="py-12 px-6 border-y-2 border-black bg-black">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-black text-yellow-300 mb-6 uppercase tracking-widest">Connects with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {integrations.map((item, i) => {
              const colors = ["bg-yellow-300", "bg-pink-300", "bg-cyan-300", "bg-purple-300", "bg-orange-300", "bg-green-300"];
              return (
                <div key={item.name} className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${colors[i % colors.length]} border-2 border-white font-bold text-black`}>
                  <span className="text-base">{item.emoji}</span>
                  <span className="text-sm">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-pink-300 border-2 border-black shadow-[4px_4px_0_#1a1a1a] rounded-2xl px-6 py-3 mb-6">
              <h2 className="font-black text-3xl text-black">Everything you need to automate</h2>
            </div>
            <p className="text-lg font-medium text-gray-700 max-w-xl mx-auto">Powerful primitives that compose into anything your team needs.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group p-6 rounded-2xl ${f.bg} border-2 border-black ${f.shadow} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#1a1a1a] transition-all`}
              >
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-white border-2 border-black shadow-[2px_2px_0_#1a1a1a]">
                  <f.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="font-black text-black mb-2 text-lg">{f.title}</h3>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white border-y-2 border-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-cyan-300 border-2 border-black shadow-[4px_4px_0_#1a1a1a] rounded-2xl px-6 py-3 mb-6">
              <h2 className="font-black text-3xl text-black">How FlowMate works</h2>
            </div>
            <p className="text-lg font-medium text-gray-700">From idea to automation in under 5 minutes.</p>
          </div>
          <div className="flex flex-col gap-6">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-5 items-start">
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${s.color} border-2 border-black shadow-[3px_3px_0_#1a1a1a] flex items-center justify-center`}>
                  <span className="text-lg font-black text-black">{s.num}</span>
                </div>
                <div className="bg-[#FEFCE8] rounded-2xl p-6 flex-1 border-2 border-black shadow-[4px_4px_0_#1a1a1a]">
                  <h3 className="font-black text-lg text-black mb-1">{s.title}</h3>
                  <p className="text-gray-700 font-medium text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-yellow-300 border-2 border-black shadow-[8px_8px_0_#1a1a1a] overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-4 right-8 w-16 h-16 rounded-full bg-pink-400 border-2 border-black opacity-60" />
            <div className="absolute bottom-4 left-8 w-10 h-10 rounded-full bg-cyan-400 border-2 border-black opacity-60" />

            <h2 className="relative font-black text-4xl text-black mb-4">Start automating today! 🚀</h2>
            <p className="relative font-medium text-black/70 mb-8 text-lg">No credit card required. Free forever for small teams.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-white bg-black border-2 border-black shadow-[4px_4px_0_#FF4D6D] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#FF4D6D] transition-all text-lg"
            >
              Create your first Zap
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-black py-8 px-6 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-300 border-2 border-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-black fill-black" />
            </div>
            <span className="font-black text-lg text-white">FlowMate</span>
          </div>
          <p className="text-sm font-medium text-gray-400">© 2025 FlowMate. Automate everything.</p>
        </div>
      </footer>
    </div>
  );
}
