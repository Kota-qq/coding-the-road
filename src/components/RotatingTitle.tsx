'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function RotatingTitle() {
  const [isRotating, setIsRotating] = useState(false);
  const router = useRouter();

  const handleRotation = () => {
    setIsRotating(true);
    setTimeout(() => {
      router.push('/about');
    }, 600);
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* メインコンテンツ */}
      <div 
        className={`
          transform-gpu transition-all duration-600 text-center
          ${isRotating ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        `}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Coding the Road
        </h1>
        <p className="text-zinc-500 mt-2 text-sm max-w-2xl mx-auto">
            エンジン音とキーボードのリズムが響き合う。車とバイク好きなエンジニアの技術記録。
        </p>
      </div>

      {/* About Button */}
      <button
        onClick={handleRotation}
        className="absolute md:right-[-100px] bottom-[-60px] md:bottom-auto group
                 inline-flex items-center justify-center px-4 md:px-8 py-4 
                 font-mono text-sm tracking-wider text-white/80
                 transition-all duration-300 hover:text-white"
      >
        <span className="relative overflow-hidden inline-flex items-center">
          <span className="transform transition-all duration-300 group-hover:-translate-x-full opacity-100 group-hover:opacity-0">
            ABOUT
          </span>
          <span className="absolute left-0 transform transition-all duration-300 translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100">
            ABOUT
          </span>
        </span>
        <ArrowRight className="ml-2 w-4 h-4 transform transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
      </button>
    </div>
  );
} 