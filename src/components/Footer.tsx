import React from 'react';
import { Hexagon, Twitter, Github, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Hexagon className="h-6 w-6 text-indigo-600 fill-indigo-100" />
              <span className="font-bold text-xl tracking-tight text-slate-900">Nexus</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Making automation intelligent and effortless for startups and enterprises worldwide.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-indigo-600"><Twitter className="h-5 w-5"/></a>
              <a href="#" className="text-slate-400 hover:text-indigo-600"><Github className="h-5 w-5"/></a>
              <a href="#" className="text-slate-400 hover:text-indigo-600"><Linkedin className="h-5 w-5"/></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Features</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Integrations</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Pricing</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">About Us</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Careers</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Blog</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Nexus Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-slate-500 text-sm">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
