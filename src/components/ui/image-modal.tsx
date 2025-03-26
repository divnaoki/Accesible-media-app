import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useRef } from "react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  voiceText: string;
}

export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  voiceText,
}: ImageModalProps) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (isOpen && 'speechSynthesis' in window) {
      // 前回の音声を停止
      window.speechSynthesis.cancel();
      
      // タイムアウトをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 音声の設定と再生
      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.lang = 'ja-JP';
      utteranceRef.current = utterance;
      
      // 音声再生終了時の処理
      utterance.onend = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          onClose();
        }, 2000);
      };

      // バックアップタイマー（音声再生が10秒以上かかる場合は強制的に閉じる）
      timeoutRef.current = setTimeout(() => {
        window.speechSynthesis.cancel();
        onClose();
      }, 10000);

      window.speechSynthesis.speak(utterance);
    }

    // クリーンアップ
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, voiceText, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="space-y-4">
          <div className="relative">
            <img
              src={imageUrl}
              alt={title}
              className="w-full rounded-lg"
            />
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 