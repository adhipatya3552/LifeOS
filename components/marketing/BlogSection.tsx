"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, BookOpen } from "lucide-react";

export function BlogSection() {
  return (
    <section id="blog" className="relative px-4 py-20 overflow-hidden sm:px-6 sm:py-32">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 70% 80%, rgba(6,182,212,0.05) 0%, transparent 60%)",
        }}
      />
      
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider rounded-full"
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
              color: "var(--color-primary-light)",
            }}
          >
            <BookOpen className="h-3 w-3" />
            <span>Bonus Blog Post</span>
          </div>
          <h2 className="text-3xl font-bold md:text-5xl mb-6">
            Building LifeOS: A Journey into <span className="gradient-text">Secure AI Automation</span>
          </h2>
          <div className="w-20 h-1 mx-auto rounded-full gradient-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="p-8 md:p-12 glass rounded-3xl relative"
          style={{ border: "1px solid var(--color-border-hover)" }}
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Brain className="h-24 w-24 text-white" />
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-lg leading-relaxed md:text-xl" style={{ color: "var(--color-text)" }}>
              Building <strong>LifeOS</strong> for the &quot;Authorized to Act&quot; hackathon has been an exhilarating yet challenging journey. 
              Our goal was simple but ambitious: create a personal AI agent that can manage your digital life—emails, calendar, and documents—without compromising security. 
              The cornerstone of this achievement was the integration of <strong>Auth0 Token Vault</strong>.
            </p>

            <p className="text-base leading-relaxed md:text-lg" style={{ color: "var(--color-text-muted)" }}>
              Early in development, we faced a significant technical hurdle: how to allow an AI model to act on behalf of a user across multiple Google services 
              while keeping OAuth tokens completely isolated from the application logic. Traditional methods often involve storing tokens in a database where 
              the application (and potentially the AI) can access them directly. This didn&apos;t feel right for a truly secure &quot;Life OS.&quot;
            </p>

            <div 
                className="my-8 p-6 rounded-2xl bg-opacity-10 border border-opacity-20"
                style={{ 
                    background: "rgba(6, 182, 212, 0.05)",
                    borderColor: "rgba(6, 182, 212, 0.2)"
                }}
            >
                <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    <h4 className="font-bold text-cyan-400">The Breakthrough</h4>
                </div>
                <p className="italic text-lg" style={{ color: "var(--color-text)" }}>
                    &ldquo;By leveraging <strong>Auth0 Token Vault</strong>, we implemented a credential-free architecture. 
                    The agent triggers actions via secure IDs, never actually touching raw tokens.&rdquo;
                </p>
            </div>

            <p className="text-base leading-relaxed md:text-lg" style={{ color: "var(--color-text-muted)" }}>
              This abstraction layer solved our biggest security concern and allowed us to focus on the &quot;intelligence&quot; and user experience of the agent. 
              One of our proudest achievements was seeing the agent seamlessly transition from summarizing a complex thread of Gmail messages to booking a meeting 
              in Google Calendar, all from a single natural language prompt.
            </p>
            
            <p className="text-base leading-relaxed md:text-lg" style={{ color: "var(--color-text-muted)" }}>
              It felt like we were finally building the future of personal productivity. This journey taught us that with the right security primitives 
              like Token Vault, we can build powerful AI tools that users can actually trust with their most sensitive data.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    A
                </div>
                <div>
                    <p className="font-semibold" style={{ color: "var(--color-text)" }}>Adhipatya</p>
                    <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>Developer, LifeOS</p>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
