"use client"

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { path: '/', label: 'HOME' },
    { path: '/articles', label: 'ARTICLES' },
    { path: '/about', label: 'ABOUT' },
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/70 backdrop-blur-lg shadow-lg' : 'bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="z-50">
            <h1 className={`font-mono text-2xl font-bold tracking-tighter transition-colors duration-300 ${
              scrolled ? 'text-zinc-900' : 'text-white'
            } cursor-pointer hover:opacity-70`}>
              Coding the Road
            </h1>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`font-mono text-sm tracking-wider hover:opacity-70 transition-opacity ${
                  scrolled ? 'text-zinc-800' : 'text-white'
                } ${pathname === item.path ? 'opacity-100' : 'opacity-70'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* ハンバーガーメニュー */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-full transition-colors z-50 ${
              scrolled ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-white/10 text-white'
            }`}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div className={`
        fixed top-0 left-0 w-full h-screen bg-gradient-to-b from-zinc-900/95 to-black/95 backdrop-blur-lg
        transform transition-all duration-300 ease-in-out md:hidden
        ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      `}>
        <nav className="flex flex-col justify-center items-center h-full">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="block py-4 text-center font-mono text-lg text-white/90 hover:text-white hover:translate-x-2 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
} 