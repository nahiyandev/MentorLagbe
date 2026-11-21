"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearStoredJwt } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useLanguage } from "@/context/language-context";

interface LogoutConfirmDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutConfirmDialog({
  open,
  onClose,
}: LogoutConfirmDialogProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = React.useState(false);

  const handleConfirmLogout = async () => {
    try {
      setLoading(true);
      await authClient.signOut();
      clearStoredJwt();
      toast.success(
        language === "bn"
          ? "সফলভাবে লগআউট হয়েছে।"
          : "Signed out successfully."
      );
      onClose();
      router.push("/");
      router.refresh();
    } catch {
      toast.error(
        language === "bn"
          ? "লগআউট করতে ব্যর্থ হয়েছে।"
          : "Failed to sign out."
      );
    } finally {
      setLoading(false);
    }
  };

  const isBn = language === "bn";

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      title={isBn ? "সাইন আউট নিশ্চিত করুন" : "Confirm Sign Out"}
      description={
        isBn
          ? "আপনি কি মেনটর লাগবে অ্যাকাউন্ট থেকে লগআউট করতে চান?"
          : "Are you sure you want to log out of your MentorLagbe account?"
      }
      className="max-w-md"
    >
      <div className="space-y-5 pt-1">
        <div className="flex items-center gap-4 rounded-xl border border-red-100 bg-red-50/70 dark:border-red-950/40 dark:bg-red-950/20 p-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
            <LogOut className="h-5 w-5" />
          </div>
          <div className="text-xs text-red-900 dark:text-red-300">
            <p className="font-bold text-sm">
              {isBn ? "সেশন সমাপ্তি" : "Ending Active Session"}
            </p>
            <p className="mt-0.5 opacity-90 leading-relaxed">
              {isBn
                ? "লগআউট করলে ড্যাশবোর্ড এবং সংরক্ষিত ফিচার ব্যবহার করতে পুনরায় সাইন ইন করতে হবে।"
                : "You will need to sign in again to access your dashboard, applications, and messages."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {isBn ? "বাতিল করুন" : "Cancel"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmLogout}
            disabled={loading}
            className="min-w-28"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                {isBn ? "লগআউট হচ্ছে..." : "Signing out..."}
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-1.5" />
                {isBn ? "হ্যাঁ, লগআউট করুন" : "Yes, Sign Out"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
