"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyEmail() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-8">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <Mail className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">確認メールを送信しました</h1>
          <p className="text-muted-foreground">
            ご登録いただいたメールアドレスに確認メールを送信しました。
            メール内のリンクをクリックして、メールアドレスの確認を完了してください。
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">ログイン画面へ</Link>
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              トップページに戻る
            </Link>
          </div>
        </div>
      </Card>
    </main>
  );
} 