"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional(),
  category: z.string().min(1, "カテゴリーを選択してください"),
  imageUrl: z.string().min(1, "画像をアップロードしてください"),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateSymbolPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!imageFile) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "画像ファイルを選択してください",
      });
      return;
    }

    try {
      // 1. 画像をSupabase Storageにアップロード
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // 2. データベースに登録
      const { error: dbError } = await supabase
        .from('images')
        .insert([
          {
            title: data.title,
            description: data.description,
            file_path: filePath,
            storage_bucket: 'images',
            voice_text: data.title,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ]);

      if (dbError) throw dbError;

      toast({
        title: "シンボルを作成しました",
        description: "シンボル一覧に追加されました",
      });
      router.push("/symbols");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error.message || "シンボルの作成に失敗しました",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("imageUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-2">
          <Link
            href="/symbols"
            className="text-sm text-muted-foreground hover:text-primary flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            戻る
          </Link>
        </div>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">新しいシンボルを作成</h1>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="シンボルのタイトルを入力"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="シンボルの説明を入力（任意）"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">カテゴリー</Label>
              <Select
                onValueChange={(value) => form.setValue("category", value)}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">一般</SelectItem>
                  <SelectItem value="food">食事</SelectItem>
                  <SelectItem value="activity">活動</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>画像</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="max-h-[200px] mx-auto rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview(null);
                        form.setValue("imageUrl", "");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <Label
                      htmlFor="image-upload"
                      className="mt-2 block text-sm font-medium cursor-pointer"
                    >
                      クリックして画像をアップロード
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG, GIF形式（最大10MB）
                    </p>
                  </div>
                )}
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.imageUrl.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/symbols")}
              >
                キャンセル
              </Button>
              <Button type="submit">作成</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}