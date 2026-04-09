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
          observer.disconnect(); // Once visible, stay mounted
        }
      },
      { rootMargin: "200px" } // Start loading 200px before visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} id={id} style={{ minHeight: visible ? undefined : "50vh" }}>
      {visible ? children : null}
    </div>
  );
}
