"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image src="/bningoo-logo.svg" alt="Bningoo" width={100} height={28} className="h-9 w-auto" />
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </a>
            <a
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
            </a>
          </nav>

          {/* Theme toggle + mobile menu */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="container mx-auto flex flex-col gap-2 px-4 py-4">
              <a
                href="#features"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#contact"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <a
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Fresh Food for Your{" "}
            <span className="text-primary">Workplace</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Bningoo brings delicious, freshly prepared meals straight to your
            office. Order for your team, track deliveries, and keep everyone
            happy — all from one platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
            </a>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t bg-muted/50 px-4 py-24"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Everything Your Office Needs
          </h2>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            A complete food ordering solution for modern workplaces.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Team Orders",
                desc: "Order for your entire team in one go. Set recurring schedules and never miss lunch.",
              },
              {
                title: "Real-time Tracking",
                desc: "Know exactly when your food arrives with live order tracking and notifications.",
              },
              {
                title: "Smart Menu",
                desc: "Dynamic menus that adapt to your schedule, preferences, and dietary requirements.",
              },
              {
                title: "Inventory Sync",
                desc: "Automatic stock management. Never run out of your favorite items.",
              },
              {
                title: "Admin Dashboard",
                desc: "Full control over orders, users, menus, and reports from a single dashboard.",
              },
              {
                title: "Loyalty Program",
                desc: "Reward your team with points. Happy employees, better workplace.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            Getting started is simple.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up your company and invite your team members.",
              },
              {
                step: "02",
                title: "Browse & Order",
                desc: "Pick from curated menus and place orders for the week.",
              },
              {
                step: "03",
                title: "Enjoy & Track",
                desc: "Get real-time updates and enjoy fresh meals at work.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bningoo. Part of Lamseyah
            Corporation. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
