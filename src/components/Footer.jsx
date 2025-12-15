import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Jira Clone App. All rights reserved.
        </p>
        <div className="flex justify-center gap-4 mt-2 text-sm text-slate-400">
          <span className="hover:text-blue-600 cursor-pointer transition">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-blue-600 cursor-pointer transition">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-blue-600 cursor-pointer transition">Help Center</span>
        </div>
      </div>
    </footer>
  );
}