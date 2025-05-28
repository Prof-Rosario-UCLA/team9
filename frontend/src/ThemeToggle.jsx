import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isLight = theme === 'light';

  return (
    <label className="swap swap-rotate cursor-pointer">
      <input
        type="checkbox"
        className="hidden"
        onChange={() => setTheme(isLight ? 'dark' : 'light')}
        checked={isLight}
      />
      <svg className="swap-on fill-current w-5 h-5" viewBox="0 0 24 24">
        <path d="M5.64 17.66A9 9 0 0012 21a9 9 0 100-18 9 9 0 00-6.36 15.66z" />
      </svg>
      <svg className="swap-off fill-current w-5 h-5" viewBox="0 0 24 24">
        <path d="M21.64 13A9 9 0 1111 2.36 7 7 0 0021.64 13z" />
      </svg>
    </label>
  );
}
