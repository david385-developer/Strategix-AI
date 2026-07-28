import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, ArrowUp, MessageSquare, Plus } from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import { aiConversations, aiPromptSuggestions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type Msg = { id: string; role: "user" | "assistant"; content: string };

const cannedResponses: string[] = [
  "Here's a 30-day Instagram plan focused on your summer launch. I recommend 3 content pillars: behind-the-scenes, product teasers, and customer stories. Schedule posts on Tue/Thu at 10 AM and Sun at 6 PM for peak engagement.",
  "I've drafted 5 LinkedIn posts around 'AI in marketing operations'. Each targets a different funnel stage — awareness, consideration, and decision. Want me to generate the accompanying visuals?",
  "Based on your brand profile, your ideal audience is marketing managers at B2B SaaS companies (50-500 employees) who care about workflow efficiency. I can build full personas with pain points and channel preferences.",
];

import { useAI } from "@/hooks/use-ai";

export function AIAssistant() {
  const open = useUIStore((s) => s.aiAssistantOpen);
  const setOpen = useUIStore((s) => s.setAiAssistantOpen);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { chat } = useAI();

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Math.random().toString(36).slice(2), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await chat({ message: text, history });
      if (res.success) {
        setMessages((m) => [
          ...m,
          { id: Math.random().toString(36).slice(2), role: "assistant", content: res.data.content },
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { id: Math.random().toString(36).slice(2), role: "assistant", content: "Sorry, I am temporarily unavailable. Please try again later." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed bottom-6 right-6 z-50 flex h-[620px] max-h-[calc(100vh-3rem)] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated"
          >
            <header className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/5 to-chart-4/5 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-glow">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Strategix AI</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> Online
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </header>

            {messages.length === 0 ? (
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-5">
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-sm text-foreground">
                      Hi Sarah! I'm your AI marketing assistant. I can help you plan campaigns,
                      generate content, and surface insights. What would you like to work on?
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Suggested prompts
                    </p>
                    <div className="space-y-1.5">
                      {aiPromptSuggestions.slice(0, 4).map((p) => (
                        <button
                          key={p}
                          onClick={() => send(p)}
                          className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Recent conversations
                    </p>
                    <div className="space-y-1">
                      {aiConversations.map((c) => (
                        <button
                          key={c.id}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
                        >
                          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse-soft"
                            style={{ animationDelay: `${i * 200}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Ask anything about your marketing…"
                    rows={1}
                    className="max-h-24 min-h-[40px] w-full resize-none rounded-xl border border-input bg-card px-3 py-2.5 pr-10 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <Button
                  size="icon"
                  onClick={() => send(input)}
                  disabled={!input.trim()}
                  className="h-10 w-10 shrink-0 rounded-xl"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between px-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                  <Plus className="h-3.5 w-3.5" /> New chat
                </Button>
                <span className="text-[11px] text-muted-foreground">AI may produce inaccurate info</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-elevated"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-success border-2 border-card" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
