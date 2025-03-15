'use client';

import { ChevronDown } from 'lucide-react';

export default function ExploreButton() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('latest-articles');
    if (element) {
      const headerOffset = 80; // ヘッダーの高さ
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <a
      href="#latest-articles"
      className="group inline-flex flex-col items-center justify-center
                font-mono text-sm tracking-wider text-white/80
                transition-all duration-300 hover:text-white cursor-pointer"
      onClick={handleClick}
    >
      <span className="relative overflow-hidden inline-flex items-center pb-2">
        <span className="group-hover:-translate-y-full transition-transform duration-300">
          EXPLORE
        </span>
        <span className="absolute top-0 left-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          EXPLORE
        </span>
      </span>
      <span className="relative h-8 overflow-hidden">
        <ChevronDown className="w-4 h-4 transform translate-y-0 group-hover:-translate-y-8 transition-transform duration-300" />
        <ChevronDown className="w-4 h-4 absolute top-0 left-1/2 -ml-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300" />
      </span>
    </a>
  );
} 