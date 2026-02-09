'use client';

import { useState, useEffect } from 'react';
import { getSubscription } from '@/app/actions/get-subscription';
import { changeSubscriptionTier } from '@/app/actions/upgrade';
import { SubscriptionTier } from '@/lib/subscription';
import { getSession } from '@/app/actions/get-session';

type BillingCycle = 'MONTHLY' | 'ANNUAL';

interface Tier {
  id: SubscriptionTier | 'FREE';
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  limit: string;
  bestFor: string;
  features: string[];
  recommended?: boolean;
}

interface PricingSubscription {
  tier?: string;
  billingCycle?: BillingCycle;
}

export default function PricingPage() {
  const [subscription, setSubscription] = useState<PricingSubscription | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);

      const session = await getSession();
      const loggedIn = Boolean(session);
      setIsAuthenticated(loggedIn);

      if (loggedIn) {
        const subRes = await getSubscription();
        if (subRes.success && subRes.subscription) setSubscription(subRes.subscription);
        if (subRes.success && subRes.subscription?.billingCycle) {
          setBillingCycle(subRes.subscription.billingCycle);
        } else if (!subRes.success) {
          setNotification({
            type: 'error',
            message: subRes.error || 'Failed to load subscription details.',
          });
        }
      }

      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!isAuthenticated) {
      setNotification({
        type: 'error',
        message: 'Please login first to change your subscription.',
      });
      return;
    }

    setUpgradingTier(tier);
    const res = await changeSubscriptionTier({ tier, billingCycle });
    if (res.success) {
      const subRes = await getSubscription();
      if (subRes.success && subRes.subscription) setSubscription(subRes.subscription);
      setNotification({
        type: 'success',
        message: res.message || (res.changed ? `Subscription changed to ${tier}.` : `You are already on the ${tier} plan.`),
      });
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Upgrade failed. Please try again.',
      });
    }
    setUpgradingTier(null);
  };

  const tiers: Tier[] = [
    {
      id: 'FREE',
      name: 'Free Explorer',
      monthlyPrice: 0,
      annualPrice: 0,
      limit: '3 generations/mo',
      bestFor: 'Trying DocuAI',
      features: ['Basic templates', 'PDF & DOCX exports', 'Standard support'],
    },
    {
      id: 'STARTER',
      name: 'Starter Pro',
      monthlyPrice: 399,
      annualPrice: 319,
      limit: '15 generations/mo',
      bestFor: 'Freelancers and solo teams',
      features: ['All business templates', 'PDF, DOCX, XLSX', 'Email support', 'No branding'],
    },
    {
      id: 'PRO',
      name: 'Power Creator',
      monthlyPrice: 899,
      annualPrice: 719,
      limit: '50 generations/mo',
      bestFor: 'Growing businesses',
      features: ['Priority generation', 'All premium templates', 'Advanced AI models', '24/7 Support'],
      recommended: true,
    },
    {
      id: 'ENTERPRISE',
      name: 'DocuAI Ultimate',
      monthlyPrice: 2499,
      annualPrice: 1999,
      limit: '200 generations/mo',
      bestFor: 'High-volume organizations',
      features: ['Highest limits', 'Team collaboration', 'Custom AI prompts', 'Dedicated manager'],
    },
  ];

  const formatPHP = (value: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-background dark:bg-[#0a0f1e] text-foreground transition-all duration-500 overflow-x-hidden">
      {notification && (
        <div
          className={`fixed bottom-8 right-8 z-[110] px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-500 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-bold">{notification.message}</span>
          </div>
        </div>
      )}

      <main className="relative pt-32 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10"></div>

        <div className="text-center mb-24 space-y-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight dark:text-white">
            Plans for <span className="gradient-text">Everyone</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Scale your document workflow with transparent PHP pricing and predictable limits.
          </p>
          <div className="inline-flex items-center p-1 rounded-2xl border border-border/50 bg-white/60 dark:bg-slate-900/60">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                billingCycle === 'MONTHLY' ? 'bg-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                billingCycle === 'ANNUAL' ? 'bg-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-300'
              }`}
            >
              Annual
            </button>
            <span className="ml-3 mr-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Save 20%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`glass rounded-[3rem] p-8 border-2 flex flex-col items-start relative overflow-hidden group transition-all duration-500 ${
                tier.recommended
                  ? 'border-primary shadow-2xl shadow-primary/20 scale-105 z-10'
                  : 'border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5'
              }`}
            >
              {tier.recommended && (
                <div className="absolute top-6 right-6 px-4 py-1.5 bg-primary text-white font-black text-[10px] rounded-full uppercase tracking-widest shadow-lg shadow-primary/30">
                  Most Popular
                </div>
              )}

              {subscription?.tier === tier.id && (
                <div className="absolute top-6 left-6 px-4 py-1.5 bg-green-500/10 text-green-500 font-bold text-[10px] rounded-full border border-green-500/20 uppercase tracking-widest">
                  Current
                </div>
              )}

              <div className="mb-10 mt-6">
                <h3 className="text-xl font-black mb-2 dark:text-white uppercase tracking-tight">{tier.name}</h3>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">{tier.bestFor}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black dark:text-white">
                    {billingCycle === 'ANNUAL' ? formatPHP(tier.annualPrice) : formatPHP(tier.monthlyPrice)}
                  </span>
                  <span className="text-gray-400 font-bold text-sm">/mo</span>
                </div>
                {billingCycle === 'ANNUAL' && tier.monthlyPrice > 0 && (
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    Billed annually at {formatPHP(tier.annualPrice * 12)}
                  </div>
                )}
                <div className="mt-3 text-primary font-black text-sm uppercase tracking-widest">{tier.limit}</div>
              </div>

              <ul className="space-y-5 mb-12 flex-1 w-full">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] mt-0.5">✓</div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => tier.id !== 'FREE' && handleUpgrade(tier.id as SubscriptionTier)}
                disabled={
                  loading ||
                  !isAuthenticated ||
                  subscription?.tier === tier.id ||
                  tier.id === 'FREE' ||
                  !!upgradingTier
                }
                className={`w-full py-5 rounded-2xl font-black tracking-widest uppercase text-[11px] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                  tier.recommended
                    ? 'bg-primary text-white shadow-xl shadow-primary/40 hover:shadow-primary/60'
                    : 'bg-white dark:bg-gray-800 border-2 border-border/50 text-gray-500 dark:text-gray-300 hover:border-primary/50'
                }`}
              >
                {loading
                  ? 'Loading...'
                  : !isAuthenticated
                  ? 'Login to Upgrade'
                  : upgradingTier === tier.id
                  ? 'Processing...'
                  : subscription?.tier === tier.id
                    ? 'Active'
                    : tier.id === 'FREE'
                      ? 'Current Free Plan'
                      : `Upgrade to ${tier.id}`}
              </button>
            </div>
          ))}
        </div>

        <section className="mt-20 glass rounded-[2rem] border border-border/50 p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-black mb-6">Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 uppercase tracking-widest text-[10px]">
                  <th className="py-3 pr-4">Feature</th>
                  <th className="py-3 px-4">Free</th>
                  <th className="py-3 px-4">Starter</th>
                  <th className="py-3 px-4">Pro</th>
                  <th className="py-3 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-300 font-semibold">
                <tr className="border-t border-border/40">
                  <td className="py-4 pr-4">Monthly Generations</td>
                  <td className="py-4 px-4">3</td>
                  <td className="py-4 px-4">15</td>
                  <td className="py-4 px-4">50</td>
                  <td className="py-4 px-4">200</td>
                </tr>
                <tr className="border-t border-border/40">
                  <td className="py-4 pr-4">XLSX Export</td>
                  <td className="py-4 px-4">-</td>
                  <td className="py-4 px-4">✓</td>
                  <td className="py-4 px-4">✓</td>
                  <td className="py-4 px-4">✓</td>
                </tr>
                <tr className="border-t border-border/40">
                  <td className="py-4 pr-4">Premium Templates</td>
                  <td className="py-4 px-4">-</td>
                  <td className="py-4 px-4">Core</td>
                  <td className="py-4 px-4">All</td>
                  <td className="py-4 px-4">All + custom</td>
                </tr>
                <tr className="border-t border-border/40">
                  <td className="py-4 pr-4">Support</td>
                  <td className="py-4 px-4">Standard</td>
                  <td className="py-4 px-4">Email</td>
                  <td className="py-4 px-4">24/7 Priority</td>
                  <td className="py-4 px-4">Dedicated manager</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-3xl border border-border/50 p-6">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Billing</div>
            <p className="font-semibold text-gray-600 dark:text-gray-300">All plans are charged in Philippine Peso (PHP).</p>
          </div>
          <div className="glass rounded-3xl border border-border/50 p-6">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Upgrades</div>
            <p className="font-semibold text-gray-600 dark:text-gray-300">
              {isAuthenticated
                ? 'Upgrade takes effect instantly after confirmation.'
                : 'Login is required before changing your plan.'}
            </p>
          </div>
          <div className="glass rounded-3xl border border-border/50 p-6">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Limits</div>
            <p className="font-semibold text-gray-600 dark:text-gray-300">Generation limits reset monthly by subscription tier.</p>
          </div>
        </section>

        <div className="mt-24 text-center">
          <p className="text-gray-500 dark:text-gray-400 font-bold flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Secure payment processing. Philippine Peso PHP accepted.
          </p>
        </div>
      </main>
    </div>
  );
}
