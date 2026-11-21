"use client";

import * as React from "react";
import {
  Clock,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { ChatMessage } from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TuitionChatDialogProps {
  tuitionId: string;
  tuitionTitle: string;
  tutorEmail: string;
  tutorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_QUESTIONS = [
  "What time slots and days are currently open for this batch?",
  "Could you share a brief overview of the syllabus covered?",
  "Are you open to 1-on-1 problem solving sessions alongside batch lectures?",
  "Is the monthly tuition fee negotiable for longer commitments?",
];

export function TuitionChatDialog({
  tuitionId,
  tuitionTitle,
  tutorEmail,
  tutorName,
  open,
  onOpenChange,
}: TuitionChatDialogProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputText, setInputText] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const myEmail = session?.user?.email;

  const scrollToBottom = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    if (!open || !myEmail || !tutorEmail) return;

    async function poll() {
      try {
        const res = await apiFetch<ChatMessage[]>(
          `/api/messages/thread?otherUser=${encodeURIComponent(
            tutorEmail
          )}&tuitionId=${encodeURIComponent(tuitionId)}`
        );
        if (active) {
          const list = extractList<ChatMessage>(res);
          setMessages(list);
          window.dispatchEvent(new Event("messagesRead"));
        }
      } catch {
        // Non-blocking
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void poll();

    const interval = setInterval(() => {
      void poll();
    }, 4000); // 4s real-time poll

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [open, myEmail, tutorEmail, tuitionId]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (!open) return null;

  const handleSend = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;
    if (!myEmail) {
      toast.error("Please sign in to send messages.");
      return;
    }

    setSending(true);
    try {
      const newMsg = await apiFetch<ChatMessage>("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          recipientEmail: tutorEmail,
          tuitionId,
          text: content,
        }),
      });

      setMessages((prev) => [...prev, newMsg]);
      setInputText("");
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not send message."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative flex h-[90vh] max-h-[640px] w-full max-w-xl flex-col rounded-3xl border border-sage-border bg-white dark:bg-[#141F18] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sage-border bg-sage-subtle/50 dark:bg-[#1C2B22]/50 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest dark:bg-[#8EE0BA] font-bold text-white dark:text-[#0C130F]">
              {getInitials(tutorName)}
            </span>
            <div className="min-w-0">
              <h2
                id="chat-dialog-title"
                className="text-sm font-bold text-forest dark:text-[#8EE0BA] truncate"
              >
                Inquiry with {tutorName}
              </h2>
              <p className="text-[11px] text-muted dark:text-[#9DB3A6] truncate">
                Regarding: <span className="font-semibold text-ink dark:text-[#EFF5F0]">{tuitionTitle}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted hover:bg-sage-subtle hover:text-forest dark:hover:bg-[#1C2B22] cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Feed */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-linear-to-b from-sage-bg/30 via-white to-white dark:from-[#0C130F] dark:via-[#141F18] dark:to-[#141F18]"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-subtle dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA] mb-3">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
                Direct Message with Tutor
              </h3>
              <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6] max-w-xs leading-relaxed">
                Ask about class timings, syllabus, fee schedules, or teaching style before applying.
              </p>

              {/* Quick suggestion chips */}
              <div className="mt-5 w-full space-y-2 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6] flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-clay" />
                  Suggested Questions:
                </p>
                <div className="flex flex-col gap-1.5">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="rounded-xl border border-sage-border bg-white dark:bg-[#18261E] p-2.5 text-xs text-left text-forest dark:text-[#8EE0BA] hover:bg-sage-subtle dark:hover:bg-[#1C2B22] transition-colors cursor-pointer"
                    >
                      &ldquo;{q}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderEmail.toLowerCase() === myEmail?.toLowerCase();
              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? "bg-forest text-white rounded-br-xs dark:bg-[#8EE0BA] dark:text-[#0C130F] font-medium"
                        : "bg-sage-subtle/80 dark:bg-[#1C2B22] text-ink dark:text-[#EFF5F0] rounded-bl-xs border border-sage-border"
                    }`}
                  >
                    {!isMe && (
                      <p className="mb-0.5 text-[10px] font-bold text-clay uppercase tracking-wider">
                        {msg.senderName} ({msg.senderRole})
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-muted dark:text-[#9DB3A6] px-1">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-sage-border bg-white dark:bg-[#141F18] p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Message ${tutorName} about this tuition...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-xl border border-sage-border bg-sage-bg/40 dark:bg-[#18261E] px-3.5 py-2.5 text-xs text-ink dark:text-[#EFF5F0] placeholder:text-muted/60 focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/20"
            />
            <Button
              type="submit"
              size="sm"
              disabled={sending || !inputText.trim()}
              className="gap-1.5 shrink-0 px-4"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
