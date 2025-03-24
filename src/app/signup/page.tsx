"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "パスワードが一致しません",
      });
      setLoading(false);
      return;
    }

    try {
      // アカウント作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("ユーザー作成に失敗しました");
      }

      // 既存のプロフィールをチェック
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", authData.user.id)
        .single();

      if (!existingProfile) {
        // プロフィール作成
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: authData.user.id,
              username,
              display_name: displayName,
            },
          ]);

        if (profileError) throw profileError;
      }

      // 確認メール送付完了画面にリダイレクト
      router.push("/verify-email");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "アカウントの作成に失敗しました。もう一度お試しください。",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-8">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            トップに戻る
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">アカウント作成</h1>
          <p className="text-muted-foreground">
            新しいアカウントを作成して、メディアを管理しましょう
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                required
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">ユーザー名</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-lg py-6"
            disabled={loading}
          >
            {loading ? "作成中..." : "アカウントを作成"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちの方は
          <Link href="/login" className="text-primary hover:underline ml-1">
            ログイン
          </Link>
          してください
        </div>
      </Card>
    </main>
  );
}
