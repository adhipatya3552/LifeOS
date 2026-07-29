"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronRight,
  FolderOpen,
  Mail,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { DemoSimulator } from "@/components/marketing/DemoSimulator";
import { SIGN_UP_HREF } from "@/components/marketing/auth-links";

export function HeroStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const tilt = tiltRef.current;
    if (!stage || !tilt) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduceMotion || isCoarse) return;

    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tilt.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
    };

    const onLeave = () => {
      tilt.style.transform = "rotateX(0deg) rotateY(0deg)";
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section
      id="demo"
      className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pb-28 sm:pt-20"
    >
      <div className="pointer-events-none absolute inset-0 os-grid-bg opacity-70" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -10%, rgba(124,92,255,0.28) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-[-10%] top-1/4 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "rgba(61,255,181,0.08)" }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="text-center lg:text-left"
        >
          <div
            className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm"
            style={{
              background: "rgba(124,92,255,0.12)",
              border: "1px solid rgba(124,92,255,0.32)",
              color: "var(--color-primary-light)",
            }}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Ask once. Gmail, Calendar, and Drive respond.</span>
          </div>

          <h1 className="font-display mb-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.5rem]">
            Your life&apos;s{" "}
            <span className="gradient-text">control room</span>
            <br className="hidden sm:block" />
            <span className="text-[0.92em]" style={{ color: "var(--color-text)" }}>
              {" "}
              in one conversation
            </span>
          </h1>

          <p
            className="mx-auto mb-8 max-w-xl text-lg leading-relaxed sm:text-xl lg:mx-0"
            style={{ color: "var(--color-text-muted)" }}
          >
            LifeOS is the personal AI agent that summarizes your inbox, books
            meetings, and works Drive docs — with private Google OAuth and
            approvals when a write action matters.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
            <a
              href={SIGN_UP_HREF}
              id="hero-cta-btn"
              className="gradient-primary flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] glow-primary sm:w-auto"
            >
              Launch LifeOS
              <ChevronRight className="h-5 w-5" />
            </a>
            <Link
              href="#features"
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-medium transition-all duration-200 hover:scale-[1.02] sm:w-auto"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-hover)",
                color: "var(--color-text)",
              }}
            >
              See how it works
            </Link>
          </div>

          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm lg:justify-start"
            style={{ color: "var(--color-text-subtle)" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" style={{ color: "var(--color-gmail)" }} />
              Gmail
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays
                className="h-3.5 w-3.5"
                style={{ color: "var(--color-calendar)" }}
              />
              Calendar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FolderOpen
                className="h-3.5 w-3.5"
                style={{ color: "var(--color-drive)" }}
              />
              Drive
            </span>
            <span>· free to start</span>
          </div>
        </motion.div>

        {/* 3D command desk */}
        <div ref={stageRef} className="stage-perspective relative mx-auto w-full max-w-xl lg:max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.15 }}
            ref={tiltRef}
            className="stage-tilt relative transition-transform duration-200 ease-out"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Back service panes */}
            <div
              className="pointer-events-none absolute -left-2 top-8 hidden h-28 w-36 rounded-xl sm:block md:-left-6"
              style={{
                transform: "translateZ(-40px) rotateY(12deg)",
                background: "rgba(234,67,53,0.12)",
                border: "1px solid rgba(234,67,53,0.35)",
                boxShadow: "var(--layer-1)",
              }}
            >
              <div className="flex h-full flex-col items-center justify-center gap-1 p-3">
                <Mail className="h-6 w-6" style={{ color: "#ea4335" }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-300/80">
                  Gmail
                </span>
              </div>
            </div>
            <div
              className="pointer-events-none absolute -right-2 top-16 hidden h-28 w-36 rounded-xl sm:block md:-right-6"
              style={{
                transform: "translateZ(-28px) rotateY(-12deg)",
                background: "rgba(66,133,244,0.12)",
                border: "1px solid rgba(66,133,244,0.35)",
                boxShadow: "var(--layer-1)",
              }}
            >
              <div className="flex h-full flex-col items-center justify-center gap-1 p-3">
                <CalendarDays className="h-6 w-6" style={{ color: "#4285f4" }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-300/80">
                  Calendar
                </span>
              </div>
            </div>
            <div
              className="pointer-events-none absolute bottom-8 left-1/2 hidden h-20 w-32 -translate-x-1/2 rounded-xl sm:block"
              style={{
                transform: "translateZ(-50px) translateY(20px)",
                background: "rgba(52,168,83,0.12)",
                border: "1px solid rgba(52,168,83,0.35)",
                boxShadow: "var(--layer-1)",
              }}
            >
              <div className="flex h-full flex-col items-center justify-center gap-1 p-2">
                <FolderOpen className="h-5 w-5" style={{ color: "#34a853" }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-green-300/80">
                  Drive
                </span>
              </div>
            </div>

            <div
              className="relative panel-3d-float"
              style={{ transform: "translateZ(24px)" }}
            >
              <DemoSimulator />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
