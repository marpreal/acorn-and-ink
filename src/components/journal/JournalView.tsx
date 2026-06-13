"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Feather, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  addTask, toggleTask, deleteTask, addNote, updateNote, deleteNote,
  addEntry, updateEntry, deleteEntry,
} from "@/app/(grove)/journal/actions";
import { useSfx } from "@/components/ambiance/ambiance-context";

type Task = { id: string; content: string; done: boolean };
type Note = { id: string; content: string; bookId: string | null; bookTitle: string | null; createdAt: string };
type BookRef = { id: string; title: string };
type Entry = { id: string; title: string | null; content: string; mood: string | null; entryDate: string; createdAt: string };

const MOODS = ["🌙", "☀️", "🍄", "🌿", "🕯️", "🥀", "✨", "🦉", "🍂"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const today = () => new Date().toISOString().slice(0, 10);
const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const fmtDay = (iso: string) => {
  const d = new Date(iso);
  return `${ordinal(d.getDate())} of ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
};
const fmtNote = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function JournalView({
  focusBookId, tasks, notes, books, entries,
}: {
  focusBookId: string | null;
  tasks: Task[];
  notes: Note[];
  books: BookRef[];
  entries: Entry[];
}) {
  const router = useRouter();
  const sfx = useSfx();
  const [, start] = useTransition();
  const run = (fn: () => Promise<unknown>, sound?: Parameters<typeof sfx>[0]) =>
    start(async () => { if (sound) sfx(sound); await fn(); router.refresh(); });

  // diary composer
  const [eDate, setEDate] = useState(today());
  const [eTitle, setETitle] = useState("");
  const [eMood, setEMood] = useState<string>("");
  const [eContent, setEContent] = useState("");
  const [editing, setEditing] = useState<Entry | null>(null);

  // todo + marginalia
  const [newTask, setNewTask] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteBook, setNoteBook] = useState<string>(focusBookId ?? "");
  const [editNote, setEditNote] = useState<{ id: string; content: string } | null>(null);

  const submitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const c = eContent.trim();
    if (!c) return;
    setEContent(""); setETitle(""); setEMood("");
    run(() => addEntry({ title: eTitle.trim() || null, content: c, mood: eMood || null, entryDate: eDate }), "chime");
  };
  const saveEdit = () => {
    if (!editing) return;
    const ed = editing;
    setEditing(null);
    run(() => updateEntry(ed.id, { title: ed.title, content: ed.content, mood: ed.mood, entryDate: ed.entryDate.slice(0, 10) }), "tap");
  };

  // group entries by day
  const groups: { day: string; items: Entry[] }[] = [];
  for (const e of entries) {
    const day = e.entryDate.slice(0, 10);
    const g = groups.find((x) => x.day === day);
    if (g) g.items.push(e); else groups.push({ day, items: [e] });
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const focusTitle = focusBookId ? books.find((b) => b.id === focusBookId)?.title : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display glow-text" style={{ fontSize: "clamp(1.9rem,5vw,3rem)" }}>The Journal</h1>
        <p style={{ color: "var(--color-moss-200)" }}>A spell-book diary for your days — and a little list of what to do.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* DIARY */}
        <section className="lg:col-span-2 flex flex-col gap-5">
          {/* composer */}
          <form onSubmit={submitEntry} className="spell-page p-5">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="font-display flex items-center gap-2" style={{ fontSize: "1.4rem", color: "#2c2113" }}>
                <Feather size={18} /> Inscribe a page
              </span>
              <input type="date" value={eDate} onChange={(e) => setEDate(e.target.value)}
                className="ink-field ml-auto" style={{ width: "auto" }} aria-label="Entry date" />
            </div>
            <input value={eTitle} onChange={(e) => setETitle(e.target.value)} maxLength={160}
              placeholder="a name for this page (optional)…" className="ink-field mb-2"
              style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }} />
            <textarea value={eContent} onChange={(e) => setEContent(e.target.value)} rows={4} maxLength={20000}
              placeholder="Dear diary — today the wood whispered…" className="ink-field"
              style={{ fontFamily: "var(--font-hand)", fontSize: "1.25rem" }} />
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-sm" style={{ color: "#6b4a2b" }}>spirit of the day:</span>
              {MOODS.map((m) => (
                <button key={m} type="button" onClick={() => { sfx("hover"); setEMood((cur) => (cur === m ? "" : m)); }}
                  className="text-xl rounded-md px-1 transition" aria-pressed={eMood === m}
                  style={{ background: eMood === m ? "rgba(245,196,81,0.3)" : "transparent", transform: eMood === m ? "scale(1.15)" : "none" }}>
                  {m}
                </button>
              ))}
              <button type="submit" className="btn btn-ember ml-auto"><Feather size={16} /> Inscribe</button>
            </div>
          </form>

          {/* pages */}
          {entries.length === 0 ? (
            <p className="font-hand text-2xl text-center py-8" style={{ color: "var(--color-moss-300)" }}>
              the spell-book waits for its first words…
            </p>
          ) : (
            groups.map((g) => (
              <div key={g.day}>
                <div className="flex items-center gap-3 my-3">
                  <div className="hairline flex-1" />
                  <span className="font-display" style={{ color: "var(--color-candle)" }}>✦ {fmtDay(g.day)} ✦</span>
                  <div className="hairline flex-1" />
                </div>
                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {g.items.map((e) => (
                      <motion.article key={e.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                        className="spell-page p-5">
                        {editing?.id === e.id ? (
                          <div className="flex flex-col gap-2 relative z-10">
                            <input value={editing.title ?? ""} onChange={(ev) => setEditing({ ...editing, title: ev.target.value })}
                              placeholder="title" className="ink-field" />
                            <textarea value={editing.content} onChange={(ev) => setEditing({ ...editing, content: ev.target.value })}
                              rows={5} className="ink-field" style={{ fontFamily: "var(--font-hand)", fontSize: "1.2rem" }} />
                            <div className="flex items-center gap-2">
                              <input type="date" value={editing.entryDate.slice(0, 10)} onChange={(ev) => setEditing({ ...editing, entryDate: ev.target.value })} className="ink-field" style={{ width: "auto" }} />
                              <div className="flex gap-1">
                                {MOODS.map((m) => (
                                  <button key={m} type="button" onClick={() => setEditing({ ...editing, mood: editing.mood === m ? null : m })}
                                    className="text-lg" style={{ opacity: editing.mood === m ? 1 : 0.4 }}>{m}</button>
                                ))}
                              </div>
                              <button onClick={saveEdit} className="btn btn-ember ml-auto" style={{ padding: "0.3rem 0.7rem" }}><Check size={14} /> Save</button>
                              <button onClick={() => setEditing(null)} className="btn" style={{ padding: "0.3rem 0.6rem", background: "rgba(120,86,46,0.2)", color: "#5a4225" }}><X size={14} /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative z-10">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-display flex items-center gap-2" style={{ fontSize: "1.35rem", color: "#2c2113" }}>
                                {e.mood && <span>{e.mood}</span>}
                                {e.title || <span style={{ color: "#9c7a4f" }}>A page</span>}
                              </h3>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => { sfx("open"); setEditing(e); }} aria-label="Edit" style={{ color: "#6b4a2b" }}><Pencil size={15} /></button>
                                <button onClick={() => run(() => deleteEntry(e.id), "close")} aria-label="Delete" style={{ color: "#8a2330" }}><Trash2 size={15} /></button>
                              </div>
                            </div>
                            <p className="drop-cap whitespace-pre-wrap" style={{ fontFamily: "var(--font-hand)", fontSize: "1.3rem", color: "#3a2c1a" }}>{e.content}</p>
                          </div>
                        )}
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </section>

        {/* TO-DO + MARGINALIA */}
        <aside className="flex flex-col gap-5">
          <section className="parchment p-5">
            <h2 className="font-display" style={{ fontSize: "1.4rem", color: "#2c2113" }}>📜 To do</h2>
            <form onSubmit={(e) => { e.preventDefault(); const v = newTask.trim(); if (!v) return; setNewTask(""); run(() => addTask(v), "tap"); }} className="mt-3 flex gap-2">
              <input value={newTask} onChange={(e) => setNewTask(e.target.value)} maxLength={4000}
                placeholder="a new task…" className="ink-field" />
              <button type="submit" className="btn btn-ember" style={{ padding: "0.5rem 0.7rem" }} aria-label="Add task"><Plus size={18} /></button>
            </form>
            <ul className="mt-3 flex flex-col gap-1.5">
              <AnimatePresence initial={false}>
                {pending.map((t) => (
                  <motion.li key={t.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="flex items-center gap-2 group">
                    <button onClick={() => run(() => toggleTask(t.id, true), "chime")} aria-label="Mark done"
                      className="shrink-0 rounded-md" style={{ width: 20, height: 20, border: "2px solid #8a6b47" }} />
                    <span className="font-hand text-lg flex-1" style={{ color: "#3a2c1a" }}>{t.content}</span>
                    <button onClick={() => run(() => deleteTask(t.id), "tap")} aria-label="Delete" className="opacity-0 group-hover:opacity-60 hover:!opacity-100" style={{ color: "#8a2330" }}><Trash2 size={14} /></button>
                  </motion.li>
                ))}
              </AnimatePresence>
              {pending.length === 0 && <li className="font-hand text-lg" style={{ color: "#9c7a4f" }}>nothing left — go read 🍄</li>}
            </ul>
            {done.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5 pt-2" style={{ borderTop: "1px dashed rgba(120,86,46,0.3)" }}>
                {done.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 group">
                    <button onClick={() => run(() => toggleTask(t.id, false), "tap")} aria-label="Undo" className="grid place-items-center rounded-md shrink-0" style={{ width: 20, height: 20, border: "2px solid #8a6b47", background: "#8a6b47", color: "#f3e7cf" }}><Check size={12} /></button>
                    <span className="font-hand text-lg flex-1 line-through" style={{ color: "#9c7a4f" }}>{t.content}</span>
                    <button onClick={() => run(() => deleteTask(t.id), "tap")} aria-label="Delete" className="opacity-0 group-hover:opacity-60" style={{ color: "#8a2330" }}><Trash2 size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass rounded-2xl p-5">
            <h2 className="font-serif-d text-xl" style={{ color: "var(--color-vellum)" }}>🪶 Marginalia</h2>
            {focusTitle && <p className="text-sm mt-1 font-hand text-lg" style={{ color: "var(--color-candle)" }}>a note for <em>{focusTitle}</em></p>}
            <form onSubmit={(e) => { e.preventDefault(); const v = noteText.trim(); if (!v) return; setNoteText(""); run(() => addNote(v, noteBook || null), "success"); }} className="mt-3 flex flex-col gap-2">
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} maxLength={4000} placeholder="a private note to yourself…" className="ink-field" />
              <div className="flex gap-2">
                <select value={noteBook} onChange={(e) => setNoteBook(e.target.value)} className="ink-field" style={{ flex: 1 }}>
                  <option value="">✦ general</option>
                  {books.map((b) => <option key={b.id} value={b.id}>📖 {b.title}</option>)}
                </select>
                <button type="submit" className="btn btn-ember" style={{ padding: "0.4rem 0.7rem" }}><Plus size={16} /></button>
              </div>
            </form>
            <div className="mt-3 flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {notes.map((n) => (
                  <motion.div key={n.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="parchment p-3">
                    {editNote?.id === n.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea value={editNote.content} onChange={(e) => setEditNote({ id: n.id, content: e.target.value })} rows={3} className="ink-field" />
                        <div className="flex gap-2">
                          <button onClick={() => { run(() => updateNote(n.id, editNote.content), "tap"); setEditNote(null); }} className="btn btn-ember" style={{ padding: "0.25rem 0.6rem" }}><Check size={13} /></button>
                          <button onClick={() => setEditNote(null)} className="btn" style={{ padding: "0.25rem 0.5rem", background: "rgba(120,86,46,0.2)", color: "#5a4225" }}><X size={13} /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {n.bookTitle && <div className="text-xs mb-0.5 font-serif-d" style={{ color: "#8a2330" }}>📖 {n.bookTitle}</div>}
                        <p className="font-hand text-lg whitespace-pre-wrap" style={{ color: "#3a2c1a" }}>{n.content}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs" style={{ color: "#9c7a4f" }}>{fmtNote(n.createdAt)}</span>
                          <div className="flex gap-1">
                            <button onClick={() => { sfx("open"); setEditNote({ id: n.id, content: n.content }); }} aria-label="Edit" style={{ color: "#6b4a2b" }}><Pencil size={13} /></button>
                            <button onClick={() => run(() => deleteNote(n.id), "close")} aria-label="Delete" style={{ color: "#8a2330" }}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {notes.length === 0 && <p className="font-hand text-base" style={{ color: "var(--color-moss-300)" }}>the margins are blank…</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
