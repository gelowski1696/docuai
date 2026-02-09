'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUserAction } from '@/app/actions/get-current-user';

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const result = await getCurrentUserAction();
      if (result.success) {
        setUser(result.user);
      }
    }
    loadUser();

    // Back to top button visibility
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-page-root min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-[#0a0f1e] dark:via-[#0d1425] dark:to-[#0f1629] text-foreground transition-all duration-500 overflow-x-hidden relative">
      {/* Modern AI-Themed Animated Background */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"></div>
        
        {/* Animated gradient orbs - softer colors */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/10 dark:from-blue-500/8 dark:via-indigo-500/8 dark:to-purple-500/8 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/10 via-sky-400/10 to-blue-400/10 dark:from-cyan-500/8 dark:via-sky-500/8 dark:to-blue-500/8 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-violet-400/8 to-fuchsia-400/8 dark:from-violet-500/6 dark:to-fuchsia-500/6 rounded-full blur-[110px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-block animate-in fade-in slide-in-from-top-2 duration-700">
            <span className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 text-primary border border-primary/30 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Document Generation
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight dark:text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Create Professional <br />
            <span className="gradient-text relative">
              Documents in Seconds
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 500 10" preserveAspectRatio="none">
                <path d="M0,5 Q250,0 500,5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Harness the power of <span className="text-primary font-bold">advanced AI</span> to generate business documents, reports, and presentations. 
            Save hours of work with intelligent automation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <Link
              href={user ? "/generate" : "/login"}
              className="group px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 active:scale-95 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              <span className="relative inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {user ? "Generate Document" : "Get Started Free"}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="#pricing"
              className="group px-10 py-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-primary/50 hover:scale-105 transition-all duration-300 active:scale-95"
            >
              <span className="inline-flex items-center gap-2">
                View Pricing
                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Stats with modern cards */}
          <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto pt-16 animate-in fade-in zoom-in duration-1000 delay-700">
            {[
              { value: '10K+', label: 'Documents Created', icon: '📄' },
              { value: '5K+', label: 'Happy Users', icon: '⭐' },
              { value: '99.9%', label: 'Uptime', icon: '⚡' }
            ].map((stat, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-white/70 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 hover:scale-110 hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative space-y-2">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-black gradient-text">{stat.value}</div>
                  <div className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight dark:text-white">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful AI-driven features designed to streamline your document creation workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'AI-Powered Generation',
                description: 'Advanced AI models create professional content tailored to your needs in seconds.',
                color: 'from-indigo-500 to-purple-600',
                gradient: 'from-indigo-500/10 to-purple-600/10'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Multiple Formats',
                description: 'Export to PDF, DOCX, and XLSX. Get your documents in the format you need.',
                color: 'from-blue-500 to-cyan-600',
                gradient: 'from-blue-500/10 to-cyan-600/10'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                ),
                title: 'Professional Templates',
                description: 'Choose from dozens of business-ready templates for any document type.',
                color: 'from-purple-500 to-pink-600',
                gradient: 'from-purple-500/10 to-pink-600/10'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Lightning Fast',
                description: 'Generate complete documents in seconds, not hours. Save time and boost productivity.',
                color: 'from-amber-500 to-orange-600',
                gradient: 'from-amber-500/10 to-orange-600/10'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Secure & Private',
                description: 'Your data is encrypted and secure. We never share your information with third parties.',
                color: 'from-emerald-500 to-teal-600',
                gradient: 'from-emerald-500/10 to-teal-600/10'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                ),
                title: 'Easy to Use',
                description: 'Intuitive interface designed for everyone. No technical knowledge required.',
                color: 'from-rose-500 to-red-600',
                gradient: 'from-rose-500/10 to-red-600/10'
              }
            ].map((feature, i) => (
              <div key={i} className="group relative p-8 rounded-[2rem] bg-white/70 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-black mb-3 dark:text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-4 md:px-8 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Process</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight dark:text-white">
              Simple <span className="gradient-text">3-Step Process</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From idea to finished document in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '01',
                title: 'Choose Template',
                description: 'Select from our library of professional templates or start from scratch.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                )
              },
              {
                step: '02',
                title: 'AI Generates',
                description: 'Our advanced AI creates professional content based on your requirements.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                step: '03',
                title: 'Download & Use',
                description: 'Export in your preferred format and use immediately in your workflow.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )
              }
            ].map((step, i) => (
              <div key={i} className="relative group">
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                )}
                <div className="relative p-10 rounded-[2rem] bg-white/70 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-center hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="text-6xl font-black text-primary/20 mb-4 group-hover:text-primary/40 transition-colors">{step.step}</div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border border-primary/20">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-4 dark:text-white group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - All 4 Tiers */}
      <section id="pricing" className="relative py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Pricing</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight dark:text-white">
              Plans for <span className="gradient-text">Every Need</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Start free, upgrade as you grow. Transparent pricing with no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                id: 'FREE',
                name: 'Free Explorer',
                price: '₱0',
                limit: '3 generations/mo',
                features: ['Basic templates', 'PDF & DOCX exports', 'Standard support'],
                cta: 'Get Started',
                highlighted: false
              },
              {
                id: 'STARTER',
                name: 'Starter Pro',
                price: '₱399',
                limit: '15 generations/mo',
                features: ['All business templates', 'PDF, DOCX, XLSX', 'Email support', 'No branding'],
                cta: 'Start Free Trial',
                highlighted: false
              },
              {
                id: 'PRO',
                name: 'Power Creator',
                price: '₱899',
                limit: '50 generations/mo',
                features: ['Priority generation', 'All premium templates', 'Advanced AI models', '24/7 Support'],
                cta: 'Start Free Trial',
                highlighted: true
              },
              {
                id: 'ENTERPRISE',
                name: 'DocuAI Ultimate',
                price: '₱2,499',
                limit: '200 generations/mo',
                features: ['Highest limits', 'Team collaboration', 'Custom AI prompts', 'Dedicated manager'],
                cta: 'Get Started',
                highlighted: false
              }
            ].map((tier, i) => (
              <div key={i} className={`relative p-8 rounded-[2rem] bg-white/70 dark:bg-gray-800/90 backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden ${
                tier.highlighted 
                  ? 'border-primary shadow-2xl shadow-primary/20 scale-105' 
                  : 'border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30'
              }`}>
                {tier.highlighted && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5"></div>
                    <div className="relative text-center mb-4">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-[10px] rounded-full uppercase tracking-widest animate-pulse shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  </>
                )}
                <div className="relative text-center mb-8">
                  <h3 className="text-xl font-black mb-3 uppercase tracking-tight dark:text-white">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-black dark:text-white">{tier.price}</span>
                    <span className="text-gray-400 font-bold text-sm">/mo</span>
                  </div>
                  <div className="text-primary font-black text-sm uppercase tracking-widest">{tier.limit}</div>
                </div>
                <ul className="relative space-y-4 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] mt-0.5">✓</div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={user ? "/generate" : "/login"}
                  className={`relative block w-full py-4 rounded-2xl font-black tracking-widest uppercase text-[11px] text-center transition-all duration-300 hover:scale-105 overflow-hidden group ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-primary/40 hover:shadow-primary/60'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-primary/50'
                  }`}
                >
                  {tier.highlighted && (
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  )}
                  <span className="relative">{tier.cta}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 px-4 md:px-8 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
              </svg>
              <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight dark:text-white">
              Loved by <span className="gradient-text">Thousands</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "DocuAI has transformed how we create business proposals. What used to take hours now takes minutes!",
                author: "Maria Santos",
                role: "Business Consultant",
                avatar: "MS"
              },
              {
                quote: "The AI-generated content is surprisingly accurate and professional. It's like having a writing assistant 24/7.",
                author: "Juan Dela Cruz",
                role: "Marketing Manager",
                avatar: "JD"
              },
              {
                quote: "Best investment for our team. The time saved on document creation is invaluable. Highly recommended!",
                author: "Ana Reyes",
                role: "Operations Director",
                avatar: "AR"
              }
            ].map((testimonial, i) => (
              <div key={i} className="group relative p-8 rounded-[2rem] bg-white/70 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-amber-500 hover:scale-125 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black hover:scale-110 transition-transform">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-black dark:text-white">{testimonial.author}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 md:px-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center text-white space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who are saving time and creating better documents with AI.
          </p>
          <div className="flex justify-center items-center pt-6">
            <Link
              href={user ? "/generate" : "/login"}
              className="group px-10 py-5 bg-white text-indigo-600 dark:bg-gray-800 dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-600/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              <span className="relative inline-flex items-center gap-2">
                {user ? "Start Generating" : "Start Free Today"}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 md:px-8 bg-white/70 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-black text-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                DocuAI
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              © 2026 DocuAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-110 transition-all duration-300 z-50 animate-in fade-in slide-in-from-bottom-4 group"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}
