"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Mail, Gift, CalendarPlus, Flame } from "lucide-react";
// Keep the same import paths you already use in your current file:
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export type ChatMessage = { role: string; content: string };

type ChatPanelProps = {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void; // your setinput
  onSend: () => void; // your chat()
  isLoading?: boolean; // optional, shows "Jarvis is thinking"
  userName?: string; // shown in the greeting
};

// Clicking a suggestion only fills the input. The user can edit it, then send.
const SUGGESTIONS = [
  { icon: Mail, label: "Draft an email", prompt: "Draft an email to " },
  {
    icon: Gift,
    label: "Send birthday wishes",
    prompt: "Send birthday wishes on WhatsApp to ",
  },
  {
    icon: CalendarPlus,
    label: "Plan my day",
    prompt: "What's on my calendar today?",
  },
  {
    icon: Flame,
    label: "Check my habits",
    prompt: "Which habits haven't I logged today?",
  },
];

function getGreeting(hour: number) {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function JarvisOrb({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-8 w-8 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#a5f3fc,#22d3ee_45%,#0e7490)] shadow-[0_0_14px_2px_rgba(34,211,238,0.45)] ${className}`}
    />
  );
}

export function ChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  isLoading = false,
  userName = "Athashri",
}: ChatPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Computed after mount so server and client HTML match (no hydration warning)
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend();
  };

  const useSuggestion = (prompt: string) => {
    onInputChange(prompt);
    inputRef.current?.focus();
  };

  return (
    <section
      aria-label="Chat with Jarvis"
      className="mx-auto flex h-full w-full max-w-2xl flex-col px-4 sm:px-6"
    >
      {/* Messages */}
      <div
        role="log"
        aria-live="polite"
        className="flex-1 space-y-6 overflow-y-auto py-8"
      >
        {messages.length === 0 && (
          <div className="flex min-h-full flex-col items-center justify-center gap-6 py-12 text-center motion-safe:animate-in motion-safe:fade-in duration-500">
            <JarvisOrb className="h-14 w-14" />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">
                {greeting}, {userName}
              </h1>
              <p className="text-sm text-zinc-400">
                What should we get done?
              </p>
            </div>

            <ul className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => useSuggestion(prompt)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-left text-sm text-zinc-200 transition motion-safe:hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-[0_0_18px_rgba(34,211,238,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <Icon
                      className="h-4 w-4 shrink-0 text-cyan-400"
                      aria-hidden="true"
                    />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((msg, i) => {
          const isHuman = msg.role === "Human";
          return (
            <div
              key={i}
              className="motion-safe:animate-in motion-safe:fade-in duration-300"
            >
              <p
                className={`mb-1.5 text-xs font-medium text-zinc-400 ${
                  isHuman ? "text-right" : ""
                }`}
              >
                {isHuman ? "You" : "Jarvis"}
              </p>
              <Message align={isHuman ? "end" : undefined}>
                <MessageAvatar>
                  {isHuman ? (
                    <Avatar>
                      <AvatarImage
                        src="https://api.dicebear.com/9.x/bottts/svg?seed=human"
                        alt="You"
                      />
                      <AvatarFallback>
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <JarvisOrb />
                  )}
                </MessageAvatar>
                <MessageContent className="bg-transparent text-white">
                  <Bubble
                    className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                      isHuman
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-50"
                        : "border-white/10 bg-zinc-900/70 text-zinc-100"
                    }`}
                  >
                    <BubbleContent>{msg.content}</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <JarvisOrb className="motion-safe:animate-pulse" />
            Jarvis is thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={submit}
        className="sticky bottom-0 flex items-center gap-2 bg-black pb-4 pt-2"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask Jarvis anything..."
          aria-label="Message Jarvis"
          autoComplete="off"
          className="h-12 rounded-2xl border-white/10 bg-zinc-900/70 px-4 text-white placeholder:text-zinc-500 focus-visible:border-cyan-400/60 focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!input.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-zinc-950 transition motion-safe:hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(34,211,238,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendHorizontal className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}