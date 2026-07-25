import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, ArrowUp, MessageSquare, Plus, Clock, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { aiConversations, aiPromptSuggestions } from "@/lib/data";

type Msg = { id: string; role: "user" | "assistant"; content: string };

const responses = [
  "Here's a 30-day Instagram plan. I recommend 3 content pillars: behind-the-scenes, product education, and customer stories. Schedule posts Tue/Thu at 10 AM and Sun at 6 PM.",
  "I've drafted 5 LinkedIn posts around AI in marketing. Each targets a different funnel stage. Want me to generate visuals?",
  "Your ideal audience is marketing managers at B2B SaaS companies (50-500 employees) focused on workflow efficiency. I can build full personas.",
  "Based on this week's data, your best-performing content is Instagram Reels. I suggest increasing Reels frequency from 2 to 4 per week.",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "init", role: "assistant", content: "Hi Sarah! I'm your AI marketing assistant. I can help you plan campaigns, generate content, analyze performance, and brainstorm ideas. What would you like to work on today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Math.random().toString(36).slice(2), role: "user", content: text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { id: Math.random().toString(36).slice(2), role: "assistant", content: responses[Math.floor(Math.random() * responses.length)] }]);
      setTyping(false);
    }, 1400);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Your intelligent marketing co-pilot for planning, content, and insights."
        breadcrumbs={[{ label: "Dashboard", href: "/app/dashboard" }, { label: "AI Assistant" }]}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar: conversations */}
        <div className="space-y-4">
          <Button className="w-full"><Plus className="h-4 w-4" /> New conversation</Button>
          <Card>
            <CardContent className="p-3">
              <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent</p>
              <div className="space-y-1">
                {aiConversations.map((c, i) => (
                  <button
                    key={c.id}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60",
                      i === 0 && "bg-muted/60"
                    )}
                  >
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Pro tip</p>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Ask me to analyze a campaign, generate a content calendar, or compare channel performance.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        <Card className="flex h-[600px] flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Strategix AI</p>
                <p className="flex items-center gap-1 text-xs text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Online · Ready to help</p>
              </div>
            </div>
            <Button variant="ghost" size="sm"><Clock className="h-3.5 w-3.5" /> History</Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4 scrollbar-thin">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse-soft" style={{ animationDelay: `${i * 200}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="border-t border-border px-5 py-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Suggested prompts</p>
              <div className="flex flex-wrap gap-2">
                {aiPromptSuggestions.slice(0, 3).map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask anything about your marketing…"
                rows={1}
                className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-input bg-card px-3 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button size="icon" onClick={() => send(input)} disabled={!input.trim()} className="h-10 w-10 shrink-0 rounded-xl">
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
