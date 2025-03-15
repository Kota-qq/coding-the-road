import Link from 'next/link';

export default function Footer() {
  const navigation = [
    { path: '/', label: 'HOME' },
    { path: '/articles', label: 'ARTICLES' },
    { path: '/about', label: 'ABOUT' },
  ];

  return (
    <footer className="bg-gradient-to-b from-zinc-900 to-black text-white py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <Link href="/">
              <h4 className="font-mono text-xl font-bold mb-6 hover:text-zinc-200 transition-colors">
                Coding the Road
              </h4>
            </Link>
            <p className="text-zinc-400">車とバイク好きなエンジニアの技術記録</p>
          </div>
          <div>
            <h4 className="font-mono text-sm font-bold mb-6">NAVIGATION</h4>
            <nav className="space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  className="block text-zinc-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-white/10 text-center text-zinc-500">
          <p>© 2024 Coding the Road. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 