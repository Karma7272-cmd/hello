import React from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-8 border border-indigo-100">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
          Nexus v2.0 is now live
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8">
          Scale your startup with <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            intelligent automation
          </span>
        </h1>
        
        <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          The all-in-one platform to manage your operations, delight your customers, and grow your revenue faster than ever before.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
            Start your free trial
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all border border-slate-200 flex items-center justify-center gap-2">
            <PlayCircle className="w-5 h-5 text-indigo-600" />
            Watch demo
          </button>
        </div>

        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200/50 bg-white/50 p-2 shadow-2xl backdrop-blur-sm">
            <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-[16/9] flex items-center justify-center relative">
              {/* Dashboard Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-violet-50/50"></div>
              <div className="w-full h-full p-8 flex flex-col gap-4 relative z-10">
                <div className="h-8 w-1/3 bg-white rounded-lg shadow-sm"></div>
                <div className="flex-1 flex gap-4">
                  <div className="w-1/4 h-full bg-white rounded-lg shadow-sm"></div>
                  <div className="w-3/4 h-full flex flex-col gap-4">
                    <div className="h-32 bg-white rounded-lg shadow-sm"></div>
                    <div className="flex-1 bg-white rounded-lg shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
