"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Link2, List } from "lucide-react";
import { sanitizeRichText } from "@/lib/blocks";

/**
 * Minimal WYSIWYG editor for the "Teks" block. Uses contentEditable +
 * execCommand; output is always run through sanitizeRichText before it reaches
 * the parent, so only a small allow-list of tags survives.
 */
export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value || "";
  }, [value]);

  function emit() {
    if (ref.current) onChange(sanitizeRichText(ref.current.innerHTML));
  }

  function run(command: string) {
    if (command === "createLink") {
      const url = window.prompt("URL tautan (https://...)");
      if (!url || !/^https?:\/\//i.test(url)) return;
      document.execCommand("createLink", false, url);
    } else {
      document.execCommand(command, false);
    }
    ref.current?.focus();
    emit();
  }

  return (
    <div className="rich-editor">
      <div className="rich-toolbar">
        <button type="button" onClick={() => run("bold")} aria-label="Tebal"><Bold size={15} /></button>
        <button type="button" onClick={() => run("italic")} aria-label="Miring"><Italic size={15} /></button>
        <button type="button" onClick={() => run("insertUnorderedList")} aria-label="Daftar"><List size={15} /></button>
        <button type="button" onClick={() => run("createLink")} aria-label="Tautan"><Link2 size={15} /></button>
      </div>
      <div
        ref={ref}
        className="rich-surface"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder="Tulis teks kamu di sini..."
      />
    </div>
  );
}
