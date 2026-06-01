"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Loader.module.css";

interface LoaderProps {
  onComplete?: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const textCharsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const brandName = "Pistasien";

  useEffect(() => {
    // Ensure we are in a browser environment
    if (typeof window === "undefined") return;

    // Accessibility check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Block scrolling while loader is active
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = ""; // restore scroll
        if (onComplete) onComplete();
      }
    });

    if (prefersReducedMotion) {
      setProgress(100);
      gsap.set(barRef.current, { width: "100%" });
      tl.to(loaderRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "power2.inOut",
      });
      return;
    }

    const progressObj = { value: 0 };

    // 1. Text Reveal (staggered blur + y-offset)
    tl.fromTo(
      textCharsRef.current,
      { y: 40, opacity: 0, filter: "blur(10px)" },
      { 
        y: 0, 
        opacity: 1, 
        filter: "blur(0px)", 
        duration: 1.2, 
        stagger: 0.05, 
        ease: "power3.out" 
      }
    )
    // 2. Progress Bar & Percentage Counter Sync
    .to(
      progressObj,
      {
        value: 100,
        duration: 2.0, // Slow & smooth, luxury feel
        ease: "power2.inOut",
        onUpdate: () => {
          const val = Math.round(progressObj.value);
          setProgress(val);
          gsap.set(barRef.current, { width: `${val}%` });
        }
      },
      "-=0.6" // overlapping start logic
    )
    // 4. Exit Animation (slide up revealing the homepage)
    .to(
      loaderRef.current,
      {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut"
      },
      "+=0.2" // slight breathe delay before exiting
    );

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <div ref={loaderRef} className={styles.loader}>
      <div className={styles.inner}>
        {/* Brand Name */}
        <h1 className={styles.brand}>
          {brandName.split("").map((char, i) => (
            <span
              key={i}
              className={styles.char}
              ref={(el) => { textCharsRef.current[i] = el; }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Progress Bar under Logo */}
        <div className={styles.barWrap}>
          <div ref={barRef} className={styles.bar}></div>
        </div>

        {/* Sync Percentage */}
        <div className={styles.percentage}>
          <span>{progress}</span>%
        </div>
      </div>
    </div>
  );
}
