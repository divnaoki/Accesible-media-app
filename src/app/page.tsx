import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">メディアライブラリ</h1>
          <p className="text-lg text-muted-foreground">
            あなたの大切な思い出を、簡単に管理
          </p>
        </div>

        <div className="grid gap-4">
          <Button
            asChild
            size="lg"
            className="w-full text-lg py-6"
            variant="default"
          >
            <Link href="/login">
              <LogIn className="mr-2 h-6 w-6" />
              ログイン
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full text-lg py-6"
            variant="outline"
          >
            <Link href="/signup">
              <UserPlus className="mr-2 h-6 w-6" />
              新規登録
            </Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}