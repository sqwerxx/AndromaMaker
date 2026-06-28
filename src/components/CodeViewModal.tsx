import React, { useState, useRef } from 'react';
import { Copy, Check, Code, X, Download } from 'lucide-react';

interface CodeViewModalProps {
  isOpen: boolean;
  code: string;
  botName: string;
  onClose: () => void;
}

export default function CodeViewModal({
  isOpen,
  code,
  botName,
  onClose,
}: CodeViewModalProps) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const handleSelectAll = () => {
    if (codeRef.current) {
      const range = document.createRange();
      range.selectNode(codeRef.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${botName.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_bot.py`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 backdrop-blur-2xl p-4 animate-fade-in"
      id="modal-codeview"
    >
      <div className="bg-[#181815]/95 backdrop-blur-xl border border-white/10 w-full max-w-4xl h-[85vh] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-pop-in">
        
        {/* Header */}
        <div className="p-4 bg-[#1e1e1a] border-b border-charcoal-light flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
            <Code className="w-5 h-5 text-amber-gold" strokeWidth={1.5} />
            <h3 className="font-serif italic text-lg text-warm-cream font-medium">
              Архив кода для {botName || 'бота'} (aiogram 3.x)
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-warm-clay hover:text-warm-cream hover:bg-charcoal-light rounded-full transition-all"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-[#131311] border-b border-charcoal-light flex flex-wrap items-center justify-between gap-2 text-xs text-warm-clay select-none shrink-0">
          <div className="flex items-center gap-4">
            <span className="font-sans text-amber-gold/90">
              Стандарты: <span className="font-mono bg-[#1e1e1a] px-1.5 py-0.5 rounded border border-charcoal-light">PEP-8</span>
            </span>
            <span className="font-sans text-warm-clay/60">
              Библиотека: <span className="font-mono bg-[#1e1e1a] px-1.5 py-0.5 rounded border border-charcoal-light">aiogram 3.x</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded bg-charcoal-light hover:bg-charcoal-dark border border-charcoal-light hover:border-warm-clay/30 transition-all font-sans cursor-pointer"
            >
              Выделить всё
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded bg-charcoal-light hover:bg-charcoal-dark border border-charcoal-light hover:border-warm-clay/30 flex items-center gap-1 transition-all font-sans cursor-pointer text-amber-gold"
            >
              <Download className="w-3.5 h-3.5" />
              Скачать .py
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 rounded bg-amber-gold hover:bg-amber-gold/90 text-[#181815] font-semibold flex items-center gap-1.5 transition-all font-sans cursor-pointer shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Копировать код
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 bg-[#0f0f0d] p-4 overflow-y-auto text-xs font-mono text-[#dcdccc] leading-relaxed custom-scrollbar selection:bg-amber-gold/30 selection:text-white">
          <pre ref={codeRef} className="whitespace-pre overflow-x-auto select-text">
            {code}
          </pre>
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-[#131311] border-t border-charcoal-light text-center text-[11px] text-warm-clay/50 font-sans shrink-0 select-none">
          Установка: <code className="font-mono bg-[#181815] px-1.5 py-0.5 rounded text-amber-gold">pip install aiogram</code>. Запуск скрипта: <code className="font-mono bg-[#181815] px-1.5 py-0.5 rounded">python bot.py</code>
        </div>

      </div>
    </div>
  );
}
