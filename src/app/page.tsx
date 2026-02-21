'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Clock,
  Trophy,
  Target,
  Users,
  ArrowRight,
  Menu,
  X,
  Check,
  Brain,
  Flame,
  Star,
  ChevronDown,
  Globe,
  BookOpen,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LandingPage() {
  const { t } = useLanguage();
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: t.sidebar.groupGrowth.split(' ')[0], href: '#features' }, // Use something similar or generic
    { name: t.landing.howHighlight, href: '#how-it-works' },
    { name: t.landing.pricingTitleEnd, href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const features = [
    {
      icon: Clock,
      title: t.landing.featureFocus,
      description: t.landing.featureFocusDesc,
      color: "from-indigo-500/20 to-indigo-500/5",
      border: "border-indigo-500/20",
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-500/10",
    },
    {
      icon: Trophy,
      title: t.landing.featureLeaderboard,
      description: t.landing.featureLeaderboardDesc,
      color: "from-amber-500/20 to-amber-500/5",
      border: "border-amber-500/20",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
    },
    {
      icon: Brain,
      title: t.landing.featureAI,
      description: t.landing.featureAIDesc,
      color: "from-violet-500/20 to-violet-500/5",
      border: "border-violet-500/20",
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/10",
    },
    {
      icon: Flame,
      title: t.landing.featureStreak,
      description: t.landing.featureStreakDesc,
      color: "from-rose-500/20 to-rose-500/5",
      border: "border-rose-500/20",
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/10",
    },
    {
      icon: Users,
      title: t.landing.featureCommunity,
      description: t.landing.featureCommunityDesc,
      color: "from-teal-500/20 to-teal-500/5",
      border: "border-teal-500/20",
      iconColor: "text-teal-400",
      iconBg: "bg-teal-500/10",
    },
    {
      icon: Target,
      title: t.landing.featureMock,
      description: t.landing.featureMockDesc,
      color: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/20",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
  ];

  const howSteps = [
    {
      step: "01",
      title: t.landing.howStep1Title,
      description: t.landing.howStep1Desc,
      color: "text-indigo-400",
      bg: "bg-indigo-500/5",
      border: "border-indigo-500/15",
    },
    {
      step: "02",
      title: t.landing.howStep2Title,
      description: t.landing.howStep2Desc,
      color: "text-violet-400",
      bg: "bg-violet-500/5",
      border: "border-violet-500/15",
    },
    {
      step: "03",
      title: t.landing.howStep3Title,
      description: t.landing.howStep3Desc,
      color: "text-amber-400",
      bg: "bg-amber-500/5",
      border: "border-amber-500/15",
    },
  ];

  const pricingPlans = [
    {
      name: t.landing.planStarter,
      price: "$0",
      period: t.landing.planStarterPeriod,
      description: t.landing.planStarterDesc,
      features: [
        t.landing.planFeatureUnlimited,
        t.landing.planFeatureLeaderboard,
        t.landing.planFeatureMissions,
        t.landing.planFeatureStreak,
        t.landing.planFeatureCommunity,
      ],
      cta: t.landing.planStarterCTA,
      href: "/signup",
      highlight: false,
    },
    {
      name: t.landing.planPro,
      price: "$9",
      period: t.landing.planProPeriod,
      description: t.landing.planProDesc,
      features: [
        t.landing.planFeatureEverything,
        t.landing.planFeatureAI,
        t.landing.planFeatureMock,
        t.landing.planFeaturePrestige,
        t.landing.planFeatureCustom,
        t.landing.planFeatureSupport,
      ],
      cta: t.landing.planProCTA,
      href: "/signup?plan=pro",
      highlight: true,
      badge: t.landing.planMostPopular,
    },
  ];

  const faqs = [
    { q: t.landing.faq1Q, a: t.landing.faq1A },
    { q: t.landing.faq2Q, a: t.landing.faq2A },
    { q: t.landing.faq3Q, a: t.landing.faq3A },
    { q: t.landing.faq4Q, a: t.landing.faq4A },
  ];

  return (
    <div
      className="flex min-h-screen flex-col overflow-hidden"
      style={{
        background: 'hsl(224, 71%, 3%)',
        color: 'hsl(210, 40%, 98%)',
        fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* === AMBIENT BACKGROUND === */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="orb absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-indigo-600/8 animate-float-slow" />
        <div className="orb absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/6" style={{ animationDelay: '4s' }} />
        <div className="orb absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-indigo-500/4" style={{ animationDelay: '2s' }} />
        <div className="bg-grid absolute inset-0" />
      </div>

      {/* === HEADER === */}
      <header>
        <nav className={cn(
          'fixed z-50 w-full transition-all duration-500',
          isScrolled
            ? 'bg-[hsl(224,71%,3%)]/80 border-b border-white/[0.06] backdrop-blur-2xl py-3'
            : 'py-5'
        )}>
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 group-hover:scale-110 transition-all duration-300">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-black text-xl tracking-tight text-white">
                  Global<span className="gradient-text">Discipline</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-2xl px-2 py-1.5">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 text-sm font-semibold text-white/50 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hidden lg:flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl font-semibold">
                    {t.auth.signInLink}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all">
                    {t.auth.createAccount} <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuState(s => !s)}
                className="lg:hidden p-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
              >
                {menuState ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {menuState && (
              <div className="lg:hidden mt-4 p-4 rounded-2xl bg-[hsl(224,60%,5%)] border border-white/10 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuState(false)}
                    className="block px-4 py-3 text-sm font-semibold text-white/60 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full rounded-xl border-white/10 text-white/70 hover:text-white bg-transparent hover:bg-white/[0.05]">{t.auth.signInLink}</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold">{t.auth.createAccount}</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">

        {/* === HERO SECTION === */}
        <section className="relative pt-40 pb-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-8 max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>{t.landing.badge}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                <span className="text-white">{t.landing.heroTitle1}</span>
                <br />
                <span
                  className="gradient-text"
                  style={{
                    background: 'linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {t.landing.heroTitle2}
                </span>
                <br />
                <span className="text-white">{t.landing.heroTitle3}</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed">
                {t.landing.heroSubtitle} <span className="text-white/70 font-semibold">{t.landing.heroSubtitleMiddle}</span> {t.landing.heroSubtitleEnd}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-base font-black bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-2xl shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    {t.landing.ctaStart}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-14 px-10 text-base font-semibold text-white/60 hover:text-white rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all"
                  >
                    {t.landing.ctaSeeFeatures}
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className="h-9 w-9 rounded-full border-2 border-[hsl(224,71%,3%)] bg-gradient-to-br from-indigo-500/30 to-violet-500/30 ring-1 ring-white/10"
                    />
                  ))}
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-white/30 font-medium">{t.landing.socialProof}</p>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-white/30 font-medium">{t.landing.socialProofCountries}</span>
                </div>
              </div>
            </div>

            {/* Hero Visual: Stats Preview Cards */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: t.landing.statStudyHours, value: "2.4M+", icon: Clock, color: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/15" },
                { label: t.landing.statStudents, value: "10K+", icon: Users, color: "text-teal-400", bg: "bg-teal-500/5", border: "border-teal-500/15" },
                { label: t.landing.statSessions, value: "8.2", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/5", border: "border-orange-500/15" },
                { label: t.landing.statXP, value: "180K", icon: Zap, color: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/15" },
              ].map(({ label, value, icon: Icon, color, bg, border }) => (
                <div
                  key={label}
                  className={`rounded-2xl border ${bg} ${border} p-4 text-center group hover:-translate-y-1 transition-all duration-300 cursor-default`}
                >
                  <div className={`inline-flex items-center justify-center h-8 w-8 rounded-xl ${bg} border ${border} mb-3 mx-auto`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-[11px] text-white/30 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === FEATURES SECTION === */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                {t.landing.pricingTitleEnd}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {t.landing.featuresTitle} <span className="gradient-text">{t.landing.featuresHighlight}</span>
              </h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto">
                {t.landing.featuresSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${feature.color} ${feature.border} p-6 hover:-translate-y-1 transition-all duration-300 cursor-default`}
                >
                  <div className={`h-12 w-12 rounded-2xl ${feature.iconBg} border ${feature.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-base font-black text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === HOW IT WORKS === */}
        <section id="how-it-works" className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/3 to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs font-bold uppercase tracking-widest">
                {t.landing.howHighlight}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {t.landing.howTitle} <span className="gradient-text">{t.landing.howHighlight}</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

              {howSteps.map((step, idx) => (
                <div
                  key={step.step}
                  className={`relative rounded-2xl border ${step.bg} ${step.border} p-8 text-center group hover:-translate-y-1 transition-all duration-300`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`text-6xl font-black ${step.color} opacity-10 absolute top-4 right-6`}>{step.step}</div>
                  <div className={`inline-flex items-center justify-center h-12 w-12 rounded-2xl ${step.bg} border ${step.border} mb-4`}>
                    <span className={`text-xl font-black ${step.color}`}>{step.step}</span>
                  </div>
                  <h3 className="text-base font-black text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === PRICING === */}
        <section id="pricing" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs font-bold uppercase tracking-widest">
                {t.landing.pricingTitleEnd}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {t.landing.pricingTitle} <span className="gradient-text">{t.landing.pricingHighlight}</span> {t.landing.pricingTitleEnd}
              </h2>
              <p className="text-white/40 text-lg">{t.landing.pricingSubtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative rounded-3xl border p-8 flex flex-col transition-all duration-300 hover:-translate-y-1",
                    plan.highlight
                      ? "bg-gradient-to-br from-indigo-500/15 to-violet-500/10 border-indigo-500/30 shadow-2xl shadow-indigo-500/10"
                      : "bg-gradient-to-br from-white/[0.03] to-transparent border-white/[0.08]"
                  )}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/30">
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-black text-white mb-1">{plan.name}</h3>
                    <p className="text-white/40 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-white/30 text-sm mb-1">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-white/60">
                        <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          plan.highlight ? "bg-indigo-500/20 text-indigo-400" : "bg-white/[0.06] text-white/40"
                        )}>
                          <Check className="h-3 w-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}>
                    <Button
                      className={cn(
                        "w-full h-12 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]",
                        plan.highlight
                          ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-xl shadow-indigo-500/25"
                          : "bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/10"
                      )}
                    >
                      {plan.cta} {plan.highlight && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === FAQ === */}
        <section id="faq" className="py-32 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs font-bold uppercase tracking-widest">
                FAQ
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {t.landing.faqTitle} <span className="gradient-text">{t.landing.faqHighlight}</span>
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-2xl border transition-all duration-300 overflow-hidden",
                    openFaq === idx
                      ? "bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20"
                      : "bg-white/[0.02] border-white/[0.07] hover:border-white/15"
                  )}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-sm font-bold text-white/80 pr-4">{faq.q}</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-white/30 shrink-0 transition-transform duration-300",
                      openFaq === idx ? "rotate-180 text-indigo-400" : ""
                    )} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === FINAL CTA === */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 md:p-20 text-center">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-300/10 rounded-full blur-3xl -ml-32 -mb-32" />

              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-semibold">
                  <Shield className="h-4 w-4" />
                  {t.landing.ctaNoCreditCard}
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.9] tracking-tight">
                  {t.landing.ctaSectionTitle}
                </h2>
                <p className="text-white/60 text-lg font-medium max-w-xl mx-auto italic">
                  {t.landing.ctaSectionQuote}
                </p>
                <div>
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="h-16 px-14 text-xl font-black bg-white text-indigo-700 hover:bg-white/90 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                      {t.landing.ctaSectionButton}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* === FOOTER === */}
      <footer className="py-16 border-t border-white/[0.06] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-3 group w-fit">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-black text-xl text-white tracking-tight">GlobalDiscipline</span>
              </Link>
              <p className="text-sm text-white/30 max-w-xs leading-relaxed">
                {t.landing.footerTagline}
              </p>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-semibold">{t.landing.footerActive}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">{t.landing.footerPlatform}</h4>
              <ul className="space-y-2.5">
                {[t.sidebar.focusTimer, t.sidebar.leaderboard, t.sidebar.studyPlanner, t.sidebar.rewards].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">{t.landing.footerCompany}</h4>
              <ul className="space-y-2.5">
                {[t.landing.footerAbout, t.landing.footerBlog, t.landing.footerPrivacy, t.landing.footerContact].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/15">
              {t.landing.footerCopyright}
            </p>
            <div className="flex items-center gap-4">
              <BookOpen className="h-4 w-4 text-white/15" />
              <Globe className="h-4 w-4 text-white/15" />
              <Shield className="h-4 w-4 text-white/15" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
