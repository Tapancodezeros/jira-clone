import React from 'react';
import {
    Github,
    Twitter,
    Linkedin,
    Command,
    Heart,
    ExternalLink,
    Mail,
    ArrowRight
} from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
            {/* Decorative Gradient Blob */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xl tracking-tight">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Command className="w-6 h-6 text-blue-500" />
                            </div>
                            <span>Jira Clone</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                            A powerful, open-source project management tool built for modern teams. Streamline your workflow with style and efficiency.
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialLink href="#" icon={<Github className="w-5 h-5" />} label="GitHub" />
                            <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} label="Twitter" />
                            <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} label="LinkedIn" />
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Product</h3>
                        <ul className="space-y-4">
                            <FooterLink href="#">Features</FooterLink>
                            <FooterLink href="#">Roadmap</FooterLink>
                            <FooterLink href="#">Changelog</FooterLink>
                            <FooterLink href="#">Integrations</FooterLink>
                        </ul>
                    </div>

                    <div className="lg:col-span-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Resources</h3>
                        <ul className="space-y-4">
                            <FooterLink href="#">Documentation</FooterLink>
                            <FooterLink href="#">API Reference</FooterLink>
                            <FooterLink href="#">Community</FooterLink>
                            <FooterLink href="#">Help Center</FooterLink>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="lg:col-span-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Stay Updated</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                            Subscribe to our newsletter for the latest updates and tips.
                        </p>
                        <form className="relative" onSubmit={(e) => e.preventDefault()}>
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                aria-label="Subscribe"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        © {currentYear} Jira Clone. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                        <span>by Team CodeZeros</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <FooterLink href="#" isSmall>Privacy</FooterLink>
                        <FooterLink href="#" isSmall>Terms</FooterLink>
                        <FooterLink href="#" isSmall>Cookies</FooterLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon, label }) {
    return (
        <a
            href={href}
            className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all duration-300 transform hover:-translate-y-1"
            aria-label={label}
        >
            {icon}
        </a>
    );
}

function FooterLink({ href, children, isSmall = false }) {
    return (
        <li>
            <a
                href={href}
                className={`inline-flex items-center group text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ${isSmall ? 'text-xs' : 'text-sm'}`}
            >
                <span>{children}</span>
                {!isSmall && (
                    <ExternalLink className="w-3 h-3 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                )}
            </a>
        </li>
    );
}