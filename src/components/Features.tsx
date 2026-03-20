import React from 'react';
import { Zap, Shield, BarChart3, Smartphone, Globe, Workflow } from 'lucide-react';

const features = [
  {
    name: 'Lightning Fast',
    description: 'Built on edge computing architecture, delivering sub-50ms response times globally.',
    icon: Zap,
  },
  {
    name: 'Bank-grade Security',
    description: 'SOC2 compliant with end-to-end encryption to keep your data perfectly secure.',
    icon: Shield,
  },
  {
    name: 'Advanced Analytics',
    description: 'Real-time insights and custom dashboards to track what matters most to your business.',
    icon: BarChart3,
  },
  {
    name: 'Mobile First',
    description: 'Fully responsive interface that works flawlessly on iOS, Android, and web.',
    icon: Smartphone,
  },
  {
    name: 'Global Reach',
    description: 'Deploy instantly to 35+ regions worldwide with automatic failover.',
    icon: Globe,
  },
  {
    name: 'Custom Workflows',
    description: 'Automate repetitive tasks with our intuitive drag-and-drop workflow builder.',
    icon: Workflow,
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm mb-3">Features</h2>
          <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to scale
          </p>
          <p className="text-lg text-slate-600">
            Stop wasting time on manual processes. Our platform provides the tools you need to build, launch, and grow your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.name}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
