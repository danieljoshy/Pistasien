"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./PageTransition.module.css";

// Ensure ScrollTrigger is registered just in case
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * 1) Transition Overlay component.
 *    Place this securely inside your `app/layout.tsx` so it persists across pages.
 */
export function TransitionOverlay() {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
       gsap.set(overlayRef.current, { yPercent: 100, pointerEvents: "none" });
       return;
    }

    // New route mounted: delay briefly to let DOM paint, then slide overlay up (-100%)
    const tl = gsap.timeline();
    
    tl.to(overlayRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: "power4.inOut",
      delay: 0.1, // Hold pitch black briefly
      onStart: () => {
        // Refresh ScrollTrigger calculations after new layout mounts
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      },
      onComplete: () => {
        // Reset overlay back to the bottom (100) and unlock it
        gsap.set(overlayRef.current, { yPercent: 100, pointerEvents: "none" });
      }
    });
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      id="page-transition-overlay"
      className={styles.overlay}
    />
  );
}

/**
 * 2) Transition Link Wrapper.
 *    Replace standard `<Link>` with `<TransitionLink>` where cinematic routing is required.
 */
interface TransitionLinkProps extends React.ComponentProps<typeof Link> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function TransitionLink({ children, href, className, ...props }: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    // Prevent redundant animation if already on route
    if (pathname === href) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      router.push(href);
      return;
    }

    // Fade out main content
    gsap.to("main", { opacity: 0, duration: 0.6, ease: "power3.out" });

    // Ensure overlay sits to block clicks during transition
    gsap.set("#page-transition-overlay", { pointerEvents: "auto" });

    // Animate overlay up from the bottom (0%)
    gsap.to("#page-transition-overlay", {
      yPercent: 0,
      duration: 1.0,
      ease: "power4.inOut",
      onComplete: () => {
        // Reset main wrapper opacity right before mounting new page so it doesn't stay invisible permanently
        gsap.set("main", { opacity: 1 });
        router.push(href);
      }
    });
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
