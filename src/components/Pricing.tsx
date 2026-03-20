import React from 'react';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for small teams just getting started.',
    features: ['Up to 5 users', 'Basic analytics', '24-hour support response time', '10GB storage', 'API access'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$99',
    description: 'Everything you need to scale your growing business.',
    features: ['Up to 20 users', 'Advanced analytics', '1-hour support response time', '100GB storage', 'Custom integrations', 'Team roles & permissions'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Advanced features for large scale organizations.',
    features: ['Unlimited users', 'Custom reporting', '24/7 dedicated support', 'Unlimited storage', 'SSO & Advanced Security', 'Custom SLA'],
    cta: 'Contact Sales',
    popular: false,
  }
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600">
            No hidden fees. No surprise charges. Choose the plan that best fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier) => (
            <div 
              key={tier.name} 
              className={`relative p-8 rounded-3xl border ${tier.popular ? 'border-indigo-600 shadow-2xl shadow-indigo-100 bg-white' : 'border-slate-200 bg-white shadow-sm'}`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-slate-500 text-sm h-10">{tier.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-slate-500 font-medium">/mo</span>}
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 shrink-0 ${tier.popular ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${tier.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'}`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
