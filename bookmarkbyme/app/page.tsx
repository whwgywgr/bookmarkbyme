"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Download,
  LayoutGrid,
  Link2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"

type Bookmark = { id: string; name: string; url: string; category: string }

const KEY = "bookmarkbyme_v1"
const OLD_KEY = "linkhub_v1"

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const normUrl = (u: string) => {
  const t = u.trim()
  return /^https?:\/\//i.test(t) ? t : "https://" + t
}
const domainOf = (u: string) => {
  try {
    return new URL(normUrl(u)).hostname
  } catch {
    return u
  }
}
const pretty = (u: string) =>
  normUrl(u).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "")
const faviconOf = (u: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domainOf(u))}&sz=64`
const hueOf = (s: string) => {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}
const catOf = (l: Bookmark) => l.category || "Tanpa Kategori"
const esc = (s: string) =>
  s.replace(/[&<>"]/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch] as string
  )

export default function Page() {
  const [links, setLinks] = React.useState<Bookmark[]>([])
  const [loaded, setLoaded] = React.useState(false)
  const [activeCat, setActiveCat] = React.useState("__all")
  const [query, setQuery] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Bookmark | null>(null)
  const [form, setForm] = React.useState({ url: "", name: "", category: "" })
  const [deleteTarget, setDeleteTarget] = React.useState<Bookmark | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    let migrated: Bookmark[] | null = null
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || "null")
      if (d && Array.isArray(d.links)) setLinks(d.links)
      else {
        const o = JSON.parse(localStorage.getItem(OLD_KEY) || "null")
        if (o && Array.isArray(o.links) && o.links.length) {
          migrated = o.links
          setLinks(o.links)
        }
      }
    } catch {}
    setLoaded(true)
    if (migrated) localStorage.setItem(KEY, JSON.stringify({ links: migrated }))
  }, [])

  React.useEffect(() => {
    if (!loaded) return
    localStorage.setItem(KEY, JSON.stringify({ links }))
  }, [links, loaded])

  const categories = React.useMemo(
    () => [...new Set(links.map(catOf))].sort((a, b) => a.localeCompare(b)),
    [links]
  )
  const counts = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const l of links) m.set(catOf(l), (m.get(catOf(l)) ?? 0) + 1)
    return m
  }, [links])
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return links.filter((l) => {
      if (activeCat !== "__all" && catOf(l) !== activeCat) return false
      if (
        q &&
        !(
          l.name.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          catOf(l).toLowerCase().includes(q)
        )
      )
        return false
      return true
    })
  }, [links, activeCat, query])

  function openAdd() {
    setEditing(null)
    setForm({ url: "", name: "", category: "" })
    setDialogOpen(true)
  }

  function openEdit(l: Bookmark) {
    setEditing(l)
    setForm({ url: l.url, name: l.name, category: l.category })
    setDialogOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.url.trim()) return
    const url = normUrl(form.url)
    const name = form.name.trim() || domainOf(url)
    const category = form.category.trim() || "Tanpa Kategori"
    if (editing) {
      setLinks((ls) =>
        ls.map((l) => (l.id === editing.id ? { ...l, name, url, category } : l))
      )
      toast.success("Link dikemaskini")
    } else {
      setLinks((ls) => [{ id: uid(), name, url, category }, ...ls])
      toast.success("Link ditambah")
    }
    setDialogOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setLinks((ls) => ls.filter((l) => l.id !== deleteTarget.id))
    setDeleteTarget(null)
    toast.success("Link dibuang")
  }

  function download(name: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function exportJson() {
    if (!links.length) return toast.error("Tiada link untuk dieksport")
    download(
      `bookmarkbyme-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(
        { app: "bookmarkbyme", exportedAt: new Date().toISOString(), links },
        null,
        2
      ),
      "application/json"
    )
    toast.success("Backup JSON dimuat turun")
  }

  function buildBookmarksHtml(): string {
    const groups = new Map<string, Bookmark[]>()
    for (const l of links) {
      const c = catOf(l)
      if (!groups.has(c)) groups.set(c, [])
      groups.get(c)!.push(l)
    }
    let html =
      '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n'
    for (const [cat, ls] of groups) {
      html += `    <DT><H3>${esc(cat)}</H3>\n    <DL><p>\n`
      for (const l of ls)
        html += `        <DT><A HREF="${esc(normUrl(l.url))}">${esc(l.name)}</A>\n`
      html += "    </DL><p>\n"
    }
    html += "</DL><p>\n"
    return html
  }

  function exportHtml() {
    if (!links.length) return toast.error("Tiada link untuk dieksport")
    download(
      `bookmarkbyme-bookmarks-${new Date().toISOString().slice(0, 10)}.html`,
      buildBookmarksHtml(),
      "text/html"
    )
    toast.success("Fail bookmarks HTML dimuat turun")
  }

  function parseBookmarksHtml(
    text: string
  ): Array<{ name: string; url: string; category: string }> {
    const doc = new DOMParser().parseFromString(text, "text/html")
    const out: Array<{ name: string; url: string; category: string }> = []
    const walk = (dl: Element | null, cat: string) => {
      if (!dl) return
      for (const node of Array.from(dl.children)) {
        if (node.tagName !== "DT") continue
        const h3 = node.querySelector(":scope > h3")
        const a = node.querySelector(":scope > a")
        if (h3) {
          const sibling = node.nextElementSibling
          const sub =
            node.querySelector(":scope > dl") ||
            (sibling && sibling.tagName === "DL" ? sibling : null)
          walk(sub, h3.textContent?.trim() || cat)
        } else if (a && a.getAttribute("href")) {
          out.push({
            name: a.textContent?.trim() || "",
            url: a.getAttribute("href") || "",
            category: cat,
          })
        }
      }
    }
    walk(doc.querySelector("dl"), "Tanpa Kategori")
    return out
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result)
      const isHtml =
        /<!DOCTYPE NETSCAPE|<dt>\s*<a\s/i.test(text) ||
        (/<dl/i.test(text) && /<a\s+href/i.test(text))
      try {
        let arr: Array<{ name?: string; url?: string; category?: string }>
        let merge = false
        if (isHtml) {
          arr = parseBookmarksHtml(text)
          merge = true
        } else {
          const d = JSON.parse(text)
          arr = Array.isArray(d) ? d : d.links
        }
        if (!Array.isArray(arr) || !arr.length) throw new Error("kosong")
        const mapped = arr
          .filter((l) => l && l.url)
          .map((l) => ({
            id: uid(),
            name:
              String(l.name || domainOf(String(l.url))).trim() ||
              domainOf(String(l.url)),
            url: normUrl(String(l.url)),
            category:
              String(l.category || "Tanpa Kategori").trim() || "Tanpa Kategori",
          }))
        if (merge) {
          const existing = new Set(
            links.map((l) => l.url.replace(/\/$/, "").toLowerCase())
          )
          const fresh = mapped.filter(
            (l) => !existing.has(l.url.replace(/\/$/, "").toLowerCase())
          )
          const dup = mapped.length - fresh.length
          if (!fresh.length) {
            toast.info("Semua bookmark dah ada dalam senarai")
            return
          }
          if (
            !window.confirm(
              `Import ${fresh.length} bookmark dari browser?${dup ? ` (${dup} duplikat dilangkau)` : ""} Bookmark sedia ada dikekal.`
            )
          )
            return
          setLinks((ls) => [...fresh, ...ls])
        } else {
          if (!window.confirm(`Import ${mapped.length} link? Data semasa akan diganti.`))
            return
          setLinks(mapped)
        }
        toast.success("Import berjaya")
      } catch {
        toast.error(
          "Fail tidak sah. Pilih fail backup BookmarkByME (.json) atau bookmarks HTML browser."
        )
      }
    }
    reader.readAsText(f)
    e.target.value = ""
  }

  function CategoryButton({
    label,
    value,
    count,
    icon,
  }: {
    label: string
    value: string
    count: number
    icon?: React.ReactNode
  }) {
    const active = activeCat === value
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={active}
          onClick={() => setActiveCat(value)}
          title={label}
        >
          {icon}
          <span className="min-w-0 break-words leading-snug">{label}</span>
          <span
            className={`ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
              active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
            }`}
          >
            {count}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  function BookmarkCard({ l }: { l: Bookmark }) {
    const letter = (l.name || domainOf(l.url) || "?").trim().charAt(0).toUpperCase()
    const color = `hsl(${hueOf(l.name || l.url)} 70% 55%)`
    return (
      <div className="group relative flex max-w-full items-center gap-2.5 rounded-xl border bg-card p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative h-7 w-7 shrink-0">
          <div
            className="absolute inset-0 flex items-center justify-center rounded-md text-xs font-bold text-white select-none"
            style={{ background: color }}
          >
            {letter}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={faviconOf(l.url)}
            alt=""
            className="relative h-7 w-7 rounded-md bg-white object-contain"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        </div>
        <a
          href={normUrl(l.url)}
          target="_blank"
          rel="noopener noreferrer"
          title={pretty(l.url)}
          className="min-w-0 text-sm font-semibold text-foreground hover:text-primary"
        >
          {l.name}
        </a>
        <div className="ml-auto flex gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => openEdit(l)}
          >
            <Pencil />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(l)}
          >
            <Trash2 />
            <span className="sr-only">Buang</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Link2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">BookmarkByME</p>
              <p className="text-xs text-muted-foreground">
                {links.length} link · {categories.length} kategori
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Kategori</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <CategoryButton
                  label="Semua"
                  value="__all"
                  count={links.length}
                  icon={<LayoutGrid className="h-4 w-4" />}
                />
                {categories.map((c) => (
                  <CategoryButton
                    key={c}
                    label={c}
                    value={c}
                    count={counts.get(c) ?? 0}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
          <p className="hidden text-sm font-bold sm:block">BookmarkByME</p>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari link…"
              className="pl-8"
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.html,.htm,application/json,text/html"
            className="hidden"
            onChange={onImportFile}
          />
          <Button
            variant="ghost"
            size="icon"
            title="Import (JSON / bookmarks HTML)"
            onClick={() => fileRef.current?.click()}
          >
            <Upload />
            <span className="sr-only">Import</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" title="Eksport">
                  <Download />
                  <span className="sr-only">Eksport</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportJson}>Backup JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={exportHtml}>
                Bookmarks browser (HTML)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={openAdd}>
            <Plus />
            Link Baharu
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-3 p-4">
          {links.length === 0 && loaded ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20 text-center">
              <Link2 className="h-10 w-10 text-muted-foreground" />
              <p className="font-semibold">Belum ada link</p>
              <p className="text-sm text-muted-foreground">
                Klik butang <span className="font-medium">+ Link Baharu</span> untuk
                mula simpan link anda.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20 text-center">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">Tiada hasil dijumpai</p>
              <p className="text-sm text-muted-foreground">
                Cuba kata kunci atau kategori lain.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filtered.map((l) => (
                <BookmarkCard key={l.id} l={l} />
              ))}
            </div>
          )}
          <p className="mt-auto pt-4 text-center text-xs text-muted-foreground">
            Data disimpan secara peribadi dalam pelayar anda (localStorage). Tip:{" "}
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px] font-semibold">
              Ctrl
            </kbd>
            +klik link untuk buka di tab belakang.
          </p>
        </main>
      </SidebarInset>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Link" : "Link Baharu"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Kemaskini butiran link ini."
                : "Simpan link baharu ke dalam koleksi anda."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="fUrl" className="text-sm font-medium">
                URL <span className="text-destructive">*</span>
              </label>
              <Input
                id="fUrl"
                required
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="contoh.com"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="fName" className="text-sm font-medium">
                Nama
              </label>
              <Input
                id="fName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nama link (auto jika kosong)"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="fCat" className="text-sm font-medium">
                Kategori
              </label>
              <Input
                id="fCat"
                list="catList"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="cth: Kerja, Sosial, Pembelajaran"
              />
              <datalist id="catList">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buang link ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `${deleteTarget.name} — ${pretty(deleteTarget.url)}` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Buang</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="bottom-center" />
    </SidebarProvider>
  )
}
