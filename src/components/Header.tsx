'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { path: '/', label: 'HOME' },
    { path: '/articles', label: 'ARTICLES' },
    { path: '/about', label: 'ABOUT' },
  ];

  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="font-mono text-xl font-bold">
            TECH BLOG
          </Link>

          {/* PC用メニュー */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`font-mono text-sm hover:text-zinc-600 transition-colors ${
                      pathname === item.path ? 'text-zinc-900' : 'text-zinc-500'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* モバイル用メニューボタン */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* モバイル用メニュー */}
      {isOpen && (
        <div className="md:hidden">
          <nav className="bg-white border-t">
            <ul className="container mx-auto px-6 py-4">
              {menuItems.map((item) => (
                <li key={item.path} className="mb-4 last:mb-0">
                  <Link
                    href={item.path}
                    className={`block font-mono text-sm hover:text-zinc-600 transition-colors ${
                      pathname === item.path ? 'text-zinc-900' : 'text-zinc-500'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
} 