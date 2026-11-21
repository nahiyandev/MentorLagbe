"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Loader2,
  MessageCircle,
  Search,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import type { ChatConversation, ChatMessage } from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesDashboardPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
  const [activeConvo, setActiveConvo] = React.useState<ChatConversation | null>(null);
  const [thread, setThread] = React.useState<ChatMessage[]>([]);
  const [loadingList, setLoadingList] = React.useState(true);
  const [loadingThread, setLoadingThread] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const myEmail = session?.user?.email;

  const scrollToBottom = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const loadConversations = React.useCallback(async () => {
    try {
      const res = await apiFetch<ChatConversation[]>("/api/messages/conversations");
      const list = extractList<ChatConversation>(res);
      setConversations(list);
      return list;
    } catch {
      return [];
    } finally {
      setLoadingList(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    async function init() {
      const list = await loadConversations();
      if (active && list.length > 0 && !activeConvo) {
        setActiveConvo(list[0]);
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, [loadConversations, activeConvo]);

  React.useEffect(() => {
    let active = true;
    if (!activeConvo) return;

    async function fetchThread() {
      try {
        const res = await apiFetch<ChatMessage[]>(
          `/api/messages/thread?conversationId=${encodeURIComponent(
            activeConvo!.conversationId
          )}`
        );
        if (active) {
          const msgs = extractList<ChatMessage>(res);
          setThread(msgs);
          if (activeConvo && activeConvo.unreadCount > 0) {
            setConversations((prev) =>
              prev.map((c) =>
                c.conversationId === activeConvo.conversationId
                  ? { ...c, unreadCount: 0 }
                  : c
              )
            );
            window.dispatchEvent(new Event("messagesRead"));
          }
        }
      } catch {
        // Non-blocking
      } finally {
        if (active) {
          setLoadingThread(false);
        }
      }
    }

    void fetchThread();

    const interval = setInterval(() => {
      void fetchThread();
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeConvo]);

  React.useEffect(() => {
    scrollToBottom();
  }, [thread, scrollToBottom]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeConvo || !myEmail) return;
    setSending(true);

    try {
      const newMsg = await apiFetch<ChatMessage>("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          recipientEmail: activeConvo.otherParty.email,
          tuitionId: activeConvo.tuitionId,
          text: replyText.trim(),
        }),
      });

      setThread((prev) => [...prev, newMsg]);
      setReplyText("");
      setTimeout(scrollToBottom, 50);

      // Refresh conversations list to update snippet
      void loadConversations();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.otherParty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.otherParty.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tuitionTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-forest sm:text-3xl dark:text-[#8EE0BA]">
          Direct Messages &amp; Inquiries
        </h1>
        <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
          Communicate directly between students and tutors regarding schedule, fees, and syllabus before and after applying.
        </p>
      </div>

      <Card className="overflow-hidden border-sage-border shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px] divide-y md:divide-y-0 md:divide-x divide-sage-border">
          {/* Left: Conversations List */}
          <div
            className={`md:col-span-4 flex flex-col bg-sage-bg/30 dark:bg-[#101A14] ${
              activeConvo ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search filter */}
            <div className="p-3.5 border-b border-sage-border">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
                <input
                  type="search"
                  placeholder="Filter inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-sage-border bg-white dark:bg-[#18261E] pl-8 pr-3 py-1.5 text-xs text-ink dark:text-[#EFF5F0] placeholder:text-muted/60 focus:border-forest/50 focus:outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-sage-border">
              {loadingList ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted dark:text-[#9DB3A6]">
                  <MessageCircle className="mx-auto h-8 w-8 text-muted/40 mb-2" />
                  No messages found
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = activeConvo?.conversationId === c.conversationId;
                  return (
                    <button
                      key={c.conversationId}
                      type="button"
                      onClick={() => {
                        setActiveConvo(c);
                        setLoadingThread(true);
                        if (c.unreadCount > 0) {
                          setConversations((prev) =>
                            prev.map((item) =>
                              item.conversationId === c.conversationId
                                ? { ...item, unreadCount: 0 }
                                : item
                            )
                          );
                          window.dispatchEvent(new Event("messagesRead"));
                        }
                      }}
                      className={`w-full p-4 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-sage-subtle dark:bg-[#1C2B22]"
                          : "hover:bg-sage-bg/70 dark:hover:bg-[#141F18]"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest dark:bg-[#8EE0BA] text-xs font-bold text-white dark:text-[#0C130F]">
                        {getInitials(c.otherParty.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-xs font-bold text-forest dark:text-[#8EE0BA]">
                            {c.otherParty.name}
                          </p>
                          <span className="text-[10px] text-muted dark:text-[#9DB3A6] shrink-0">
                            {formatDate(c.lastMessage.createdAt)}
                          </span>
                        </div>
                        {c.tuitionTitle && (
                          <p className="text-[11px] font-semibold text-clay truncate mt-0.5">
                            {c.tuitionTitle}
                          </p>
                        )}
                        <p className="text-xs text-muted dark:text-[#9DB3A6] truncate mt-1">
                          {c.lastMessage.text}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shrink-0 mt-1">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Active Message Thread */}
          <div
            className={`md:col-span-8 flex flex-col bg-white dark:bg-[#141F18] ${
              !activeConvo ? "hidden md:flex" : "flex"
            }`}
          >
            {activeConvo ? (
              <>
                {/* Thread Header */}
                <div className="flex items-center justify-between border-b border-sage-border px-5 py-3.5 bg-sage-subtle/30 dark:bg-[#1C2B22]/30">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveConvo(null)}
                      className="md:hidden rounded-lg p-1.5 text-muted hover:bg-sage-subtle cursor-pointer"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
                          {activeConvo.otherParty.name}
                        </h2>
                        <Badge variant="sage" className="text-[10px] uppercase">
                          {activeConvo.otherParty.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted dark:text-[#9DB3A6]">
                        {activeConvo.otherParty.email}
                      </p>
                    </div>
                  </div>

                  {activeConvo.tuitionId && (
                    <Link
                      href={`/tuitions/${activeConvo.tuitionId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-forest dark:text-[#8EE0BA] hover:underline"
                    >
                      <span className="hidden sm:inline">View Tuition</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>

                {/* Messages Body */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[460px]"
                >
                  {loadingThread ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted" />
                    </div>
                  ) : thread.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted">
                      No messages yet in this inquiry.
                    </div>
                  ) : (
                    thread.map((msg) => {
                      const isMe =
                        msg.senderEmail.toLowerCase() === myEmail?.toLowerCase();
                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col ${
                            isMe ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                              isMe
                                ? "bg-forest text-white rounded-br-xs dark:bg-[#8EE0BA] dark:text-[#0C130F] font-medium"
                                : "bg-sage-subtle/80 dark:bg-[#1C2B22] text-ink dark:text-[#EFF5F0] rounded-bl-xs border border-sage-border"
                            }`}
                          >
                            {!isMe && (
                              <p className="mb-0.5 text-[10px] font-bold text-clay uppercase">
                                {msg.senderName}
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

                {/* Reply Input Bar */}
                <div className="border-t border-sage-border p-3.5 sm:p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSendReply();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder={`Reply to ${activeConvo.otherParty.name}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 rounded-xl border border-sage-border bg-sage-bg/40 dark:bg-[#18261E] px-4 py-2 text-xs text-ink dark:text-[#EFF5F0] placeholder:text-muted/60 focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={sending || !replyText.trim()}
                      className="gap-1.5 shrink-0"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span>Send</span>
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageCircle className="h-10 w-10 text-muted/30 mb-2" />
                <p className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
                  Select a Conversation
                </p>
                <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6]">
                  Choose an inquiry from the list on the left to review questions and reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
