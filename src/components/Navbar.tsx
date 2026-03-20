import React, { useState } from 'react';
import { Menu, X, Hexagon } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Hexagon className="h-8 w-8 text-indigo-600 fill-indigo-100" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Nexus</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Features</a>
            <a href="#testimonials" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Testimonials</a>
            <a href="#pricing" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Pricing</a>
            <button className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
              Get Started
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-slate-900">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#features" className="block px-3 py-2 text-slate-600 font-medium hover:text-indigo-600 hover:bg-slate-50 rounded-md">Features</a>
            <a href="#testimonials" className="block px-3 py-2 text-slate-600 font-medium hover:text-indigo-600 hover:bg-slate-50 rounded-md">Testimonials</a>
            <a href="#pricing" className="block px-3 py-2 text-slate-600 font-medium hover:text-indigo-600 hover:bg-slate-50 rounded-md">Pricing</a>
            <button className="w-full text-left px-3 py-2 mt-2 bg-indigo-600 text-white rounded-md font-medium">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
