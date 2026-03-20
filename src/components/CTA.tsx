import React from 'react';

const CTA: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-600"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to supercharge your startup?
        </h2>
        <p className="text-indigo-100 text-xl mb-10">
          Join over 4,000 forward-thinking companies building the future with Nexus.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg">
            Get Started for Free
          </button>
          <button className="px-8 py-4 bg-transparent text-white border border-indigo-400 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all">
            Talk to Sales
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
