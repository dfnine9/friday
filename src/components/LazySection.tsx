"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

export default function LazySection({ children, id }: { children: ReactNode; id?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" } // Load 600px before visible — very eager
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} id={id}>
      {visible ? children : <div style={{ minHeight: "20vh" }} />}
    </div>
  );
}
