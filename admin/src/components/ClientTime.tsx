'use client';

import { useEffect, useState } from 'react';

export default function ClientTime() {
  const [time, setTime] = useState<string>('--:--:--');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date().toLocaleTimeString());
  }, []);

  if (!mounted) {
    return <span>--:--:--</span>;
  }

  return <span>{time}</span>;
}
