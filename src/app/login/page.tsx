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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("ログインに失敗しました");
      }

      toast({
        title: "ログイン成功",
        description: "シンボル一覧画面に移動します",
      });

      router.push("/symbols");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "ログインに失敗しました。メールアドレスとパスワードを確認してください。",
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
          <h1 className="text-3xl font-bold tracking-tight">ログイン</h1>
          <p className="text-muted-foreground">
            アカウントにログインして、メディアを管理しましょう
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-lg py-6"
            disabled={loading}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          アカウントをお持ちでない方は
          <Link href="/signup" className="text-primary hover:underline ml-1">
            新規登録
          </Link>
          してください
        </div>
      </Card>
    </main>
  );
}
