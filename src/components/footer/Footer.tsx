'use client';

import { motion } from 'framer-motion';
import { Shield, Code2, X, ExternalLink, Mail, Heart } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  Platform: [
    { label: 'Features', href: '#features' },
    { label: 'Volunteer Portal', href: '/login' },
    { label: 'NGO Portal', href: '/login' },
    { label: 'Admin Panel', href: '/login' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Android App', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

const socials = [
  { icon: Code2, href: 'https://github.com/saptarshi-sen1', label: 'GitHub' },
  { icon: X, href: '#', label: 'Twitter' },
  { icon: ExternalLink, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:saptarshi.sensxcs@gmail.com', label: 'Email' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#06101e]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,rgba(59,130,246,0.05),transparent)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CrisisConnect
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs mb-6">
              An AI-powered disaster response platform connecting NGOs, volunteers,
              and emergency teams in real time.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ y: -2, scale: 1.1 }}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2024 CrisisConnect. Built for humanity.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400 mx-1" /> by Saptarshi Sen
          </p>
        </div>
      </div>
    </footer>
  );
}
