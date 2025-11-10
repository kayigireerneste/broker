"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface RichTextEditorProps {
  label?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  placeholder?: string;
  className?: string;
}

type EditorInstance = {
  getData: () => string;
  setData: (data: string) => void;
};

const baseToolbar = [
  "heading",
  "|",
  "bold",
  "italic",
  "link",
  "bulletedList",
  "numberedList",
  "blockQuote",
  "|",
  "undo",
  "redo",
];

type CKEditorModule = typeof import("@ckeditor/ckeditor5-react");
type ClassicEditorModule = typeof import("@ckeditor/ckeditor5-build-classic");

export function RichTextEditor({
  label,
  id,
  value,
  onChange,
  disabled,
  helperText,
  error,
  placeholder,
  className,
}: RichTextEditorProps) {
  const generatedId = useId();
  const editorId = id ?? generatedId;
  const editorRef = useRef<EditorInstance | null>(null);
  const editorModulesRef = useRef<{
    CKEditor: CKEditorModule["CKEditor"];
    ClassicEditor: ClassicEditorModule["default"];
  } | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadEditor() {
      try {
        const [ckeditorModule, classicModule] = await Promise.all([
          import("@ckeditor/ckeditor5-react"),
          import("@ckeditor/ckeditor5-build-classic"),
        ]);

        if (!isMounted) return;

        editorModulesRef.current = {
          CKEditor: ckeditorModule.CKEditor,
          ClassicEditor: (classicModule as ClassicEditorModule).default,
        };
        setIsEditorReady(true);
      } catch (error) {
        console.error("Failed to load rich text editor", error);
      }
    }

    if (typeof window !== "undefined" && !editorModulesRef.current) {
      void loadEditor();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const instance = editorRef.current;
    if (!instance) return;
    const currentData = instance.getData();
    if (value !== currentData) {
      instance.setData(value ?? "");
    }
  }, [value]);

  const borderClasses = error
    ? "border-red-500 focus-within:ring-red-500"
    : "border-[#004B5B]/40 focus-within:ring-[#004B5B]";

  if (!isEditorReady || !editorModulesRef.current) {
    return (
      <div className={className}>
        {label ? (
          <label htmlFor={editorId} className="mb-2 block text-sm font-medium text-[#004B5B]">
            {label}
          </label>
        ) : null}
        <div
          className={`rounded-lg border bg-white shadow-sm transition ${borderClasses} ${
            disabled ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <div className="p-4 text-sm text-gray-400">Loading editor…</div>
        </div>
        {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
        {!error && helperText ? <p className="mt-1 text-xs text-gray-500">{helperText}</p> : null}
      </div>
    );
  }

  const { CKEditor, ClassicEditor } = editorModulesRef.current;

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={editorId} className="mb-2 block text-sm font-medium text-[#004B5B]">
          {label}
        </label>
      ) : null}
      <div
        className={`rounded-lg border bg-white shadow-sm focus-within:ring-2 transition ${borderClasses} ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <CKEditor
          // CKEditor typing expects the generic Editor type; the classic build complies at runtime.
          editor={ClassicEditor as unknown as never}
          data={value}
          disabled={disabled}
          onReady={(editor) => {
            editorRef.current = editor as EditorInstance;
          }}
          onChange={(_event, editor) => {
            const data = editor.getData();
            onChange(data);
          }}
          config={{
            placeholder,
            toolbar: baseToolbar,
          }}
        />
      </div>
      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
      {!error && helperText ? <p className="mt-1 text-xs text-gray-500">{helperText}</p> : null}
    </div>
  );
}

export default RichTextEditor;
