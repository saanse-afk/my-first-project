"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "idle" | "uploading" | "success" | "error"

interface UploadResult {
  parsed: number
  upserted: number
  classified: number
}

export function CSVUpload() {
  const [status, setStatus] = useState<Status>("idle")
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    setFileName(file.name)
    setStatus("uploading")
    setError("")
    setResult(null)

    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Upload failed")
      setResult(data)
      setStatus("success")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
      setStatus("error")
    }
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      setStatus("error")
      return
    }
    upload(file)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-zinc-200 mb-1">Upload Instagram Export</h3>
        <p className="text-xs text-zinc-500">CSV from Meta Business Suite. Columns: ID, Page Name, Post Name, Post ID, Post Date, Post Type, Post Title, Views, Likes, Comments, Saves, Shares, Engagement Rate %</p>
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
          dragging ? "border-amber-500/50 bg-amber-500/5" : "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/30",
          status === "uploading" && "opacity-60 pointer-events-none"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {status === "uploading" ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-amber-400 animate-spin" />
            <div>
              <p className="text-zinc-300 text-sm font-medium">Processing {fileName}…</p>
              <p className="text-zinc-500 text-xs mt-1">Parsing CSV, calculating scores, classifying with Claude</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Upload size={20} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-300 text-sm font-medium">Drop CSV here or click to browse</p>
              <p className="text-zinc-600 text-xs mt-1">Instagram Business Suite export format</p>
            </div>
          </div>
        )}
      </div>

      {status === "success" && result && (
        <Card className="flex items-start gap-3 border-green-500/20 bg-green-500/5">
          <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-300 font-medium">Upload complete</p>
            <p className="text-xs text-zinc-400 mt-1">
              Parsed <strong className="text-zinc-200">{result.parsed}</strong> posts ·{" "}
              Saved <strong className="text-zinc-200">{result.upserted}</strong> to database ·{" "}
              Classified <strong className="text-zinc-200">{result.classified}</strong> via Claude
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-zinc-500 text-xs"
              onClick={() => { setStatus("idle"); setResult(null) }}
            >
              Upload another file
            </Button>
          </div>
        </Card>
      )}

      {status === "error" && (
        <Card className="flex items-start gap-3 border-red-500/20 bg-red-500/5">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-300 font-medium">Upload failed</p>
            <p className="text-xs text-zinc-400 mt-0.5">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-zinc-500 text-xs"
              onClick={() => setStatus("idle")}
            >
              Try again
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
