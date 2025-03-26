"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderIcon, Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ImageModal } from "@/components/ui/image-modal";

type Symbol = {
  id: string;
  title: string;
  file_path: string;
  category: string;
  url?: string;
  voice_text?: string;
};

export default function SymbolsPage() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSymbols();
  }, []);

  const fetchSymbols = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('is_active', true);
      
      console.log('Fetched data from Supabase:');
      console.log(JSON.stringify(data, null, 2));

      if (error) throw error;

      const symbolsWithUrls = await Promise.all(
        (data || []).map(async (symbol) => {
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(symbol.file_path);

          return {
            ...symbol,
            url: publicUrl,
          };
        })
      );

      setSymbols(symbolsWithUrls);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error.message || "シンボルの取得に失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolClick = (symbol: Symbol) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* サイドバー */}
      <div className="w-64 border-r border-border bg-card p-4 hidden md:block">
        <div className="space-y-4">
          <Input
            type="search"
            placeholder="シンボルを検索..."
            className="w-full"
          />
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">カテゴリー</h2>
            <nav className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <FolderIcon className="mr-2 h-4 w-4" />
                すべて
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <FolderIcon className="mr-2 h-4 w-4" />
                一般
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <FolderIcon className="mr-2 h-4 w-4" />
                食事
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <FolderIcon className="mr-2 h-4 w-4" />
                活動
              </Button>
            </nav>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">シンボル一覧</h1>
          <Link href="/symbols/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center">読み込み中...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {symbols.map((symbol) => (
              <Card 
                key={symbol.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSymbolClick(symbol)}
              >
                <div className="aspect-square relative">
                  <img
                    src={symbol.url}
                    alt={symbol.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedSymbol && (
          <ImageModal
            isOpen={!!selectedSymbol}
            onClose={() => setSelectedSymbol(null)}
            imageUrl={selectedSymbol.url || ""}
            title={selectedSymbol.title}
            voiceText={selectedSymbol.voice_text || selectedSymbol.title}
          />
        )}
      </div>
    </div>
  );
}