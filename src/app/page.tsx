import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Trophy,
  Zap,
  Target,
  Users,
  Globe,
  Clock,
  CheckCircle2,
  Star,
  Menu,
  X
} from "lucide-react";
import Image from "next/image";
import { Metadata } from 'next';

import { FAQ } from "@/components/landing/FAQ";

export const metadata: Metadata = {
  title: 'Global Discipline Engine - Master Your Exam Prep',
  description: 'Track, compete, and excel with the world\'s first discipline-first study platform. Join 10,000+ students mastering their goals.',
  openGraph: {
    title: 'Global Discipline Engine - Master Your Exam Prep',
    description: 'Track, compete, and excel with the world\'s first discipline-first study platform.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between border-b px-6 lg:px-12 backdrop-blur-sm bg-background/80 fixed w-full z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Zap className="h-5 w-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">GlobalDiscipline</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</Link>
          <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">How It Works</Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">Sign up free</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-16">
        <section className="flex flex-col items-center justify-center px-4 py-24 text-center lg:py-32 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px] -z-10" />

          <div className="space-y-6 max-w-4xl relative z-10">
            <div className="inline-flex items-center rounded-full border border-indigo-500/20 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm bg-indigo-500/5">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              v1.0 is now live - Join 10,000+ students
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-in fade-in duration-1000">
              Master Your Exam Prep with Global Discipline
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl leading-relaxed">
              Track, compete, and excel with the world's first discipline-first study platform. Turn your study sessions into achievements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/signup">
                <Button size="lg" className="px-8 h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 animate-pulse">
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="px-8 h-12 text-base backdrop-blur-sm bg-background/50 border-indigo-500/20 hover:bg-indigo-500/5">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap gap-8 justify-center pt-12 text-sm">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">10,000+</div>
                <div className="text-muted-foreground">Active Students</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">5M+</div>
                <div className="text-muted-foreground">Study Hours</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">50+</div>
                <div className="text-muted-foreground">Countries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-24 scroll-mt-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to keep you focused, motivated, and on track.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 text-white shadow-lg">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Focus Timer with XP</h3>
              <p className="text-muted-foreground text-sm">Track deep work sessions and earn XP for every minute of focused study.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mb-4 text-white shadow-lg">
                <Trophy className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Leaderboard</h3>
              <p className="text-muted-foreground text-sm">Compete with students worldwide and climb the ranks to unlock rewards.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 text-white shadow-lg">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Study Planner</h3>
              <p className="text-muted-foreground text-sm">Get personalized study plans tailored to your exam goals and schedule.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-4 text-white shadow-lg">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Challenges</h3>
              <p className="text-muted-foreground text-sm">Join challenges, compete with friends, and stay accountable together.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="container mx-auto px-4 py-24 scroll-mt-16 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in minutes and transform your study routine.
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "1", title: "Sign Up", desc: "Create your free account in seconds", icon: CheckCircle2 },
              { step: "2", title: "Start a Session", desc: "Use our focus timer to track your study time", icon: Clock },
              { step: "3", title: "Earn XP", desc: "Gain experience points and level up", icon: Star },
              { step: "4", title: "Challenge Friends", desc: "Compete and stay motivated together", icon: Users },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 text-white text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <item.icon className="h-8 w-8 text-indigo-600 mb-3" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              What Students Say
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { name: "Sarah M.", role: "Medical Student", quote: "This platform transformed my study routine. I went from scattered sessions to consistent focused work." },
              { name: "David L.", role: "Engineering Student", quote: "The leaderboard feature keeps me motivated. Competing with friends makes studying actually fun!" },
              { name: "Emma R.", role: "Law Student", quote: "The AI planner helped me organize 6 months of bar prep. Best investment I've made in my education." },
            ].map((testimonial) => (
              <div key={testimonial.name} className="p-6 rounded-2xl border bg-card backdrop-blur-sm shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Preview */}
        <section id="pricing" className="container mx-auto px-4 py-24 scroll-mt-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg">Choose the plan that works for you</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { tier: "Free", price: "$0", features: ["Basic focus timer", "Weekly stats", "1 active challenge", "Community access"] },
              { tier: "Pro", price: "$9.99", popular: true, features: ["Unlimited timer", "Advanced analytics", "5 active challenges", "Priority support", "XP multiplier"] },
              { tier: "Elite", price: "$19.99", features: ["Everything in Pro", "Custom study plans", "1-on-1 coaching", "Exclusive community", "Ad-free experience"] },
            ].map((plan) => (
              <div key={plan.tier} className={`p-6 rounded-2xl border ${plan.popular ? 'border-indigo-500 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-xl scale-105' : 'border-border bg-card'} backdrop-blur-sm`}>
                {plan.popular && (
                  <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.tier}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className={`w-full ${plan.popular ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : ''}`}>
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/premium" className="text-indigo-600 hover:text-indigo-700 font-medium">
              See full pricing details →
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Study Routine?</h2>
            <p className="text-lg mb-8 opacity-90">Join thousands of students achieving their goals with Global Discipline.</p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="px-8 h-12 text-base bg-white text-indigo-600 hover:bg-gray-100">
                Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">GlobalDiscipline</span>
              </div>
              <p className="text-sm text-muted-foreground">Master your discipline, conquer your goals.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">Get study tips and updates.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Enter your email" className="flex-1 px-3 py-2 rounded-md border bg-background text-sm" />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Global Discipline Engine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
