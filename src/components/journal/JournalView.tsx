"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  addTask, toggleTask, deleteTask, addNote, updateNote, deleteNote,
} from "@/app/(grove)/journal/actions";
import { useSfx } from "@/components/ambiance/ambiance-context";

type Task = { id: string; content: string; done: boolean };
type Note = { id: string; content: string; bookId: string | null; bookTitle: string | null; createdAt: string };
type BookRef = { id: string; title: string };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function JournalView({
  focusBookId, tasks, notes, books,
}: {
  focusBookId: string | null;
  tasks: Task[];
  notes: Note[];
  books: BookRef[];
}) {
  const router = useRouter();
  const sfx = useSfx();
  const [, start] = useTransition();
  const [newTask, setNewTask] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteBook, setNoteBook] = useState<string>(focusBookId ?? "");
  const [editing, setEditing] = useState<{ id: string; content: string } | null>(null);

  const run = (fn: () => Promise<unknown>, sound?: Parameters<typeof sfx>[0]) =>
    start(async () => { if (sound) sfx(sound); await fn(); router.refresh(); });

  const submitTask = (e: React.FormEvent) => {
    e.preventDefault();
    const v = newTask.trim();
    if (!v) return;
    setNewTask("");
    run(() => addTask(v), "tap");
  };

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    const v = noteText.trim();
    if (!v) return;
    setNoteText("");
    run(() => addNote(v, noteBook || null), "success");
  };

  const focusTitle = focusBookId ? books.find((b) => b.id === focusBookId)?.title : null;
  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display glow-text" style={{ fontSize: "clamp(1.9rem,5vw,3rem)" }}>The Journal</h1>
        <p style={{ color: "var(--color-moss-200)" }}>A little list of what to do, and a margin for your private thoughts.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* TO-DO */}
        <section className="parchment p-5">
          <h2 className="font-display" style={{ fontSize: "1.5rem", color: "#2c2113" }}>📜 To do</h2>
          <form onSubmit={submitTask} className="mt-3 flex gap-2">
            <input value={newTask} onChange={(e) => setNewTask(e.target.value)} maxLength={4000}
              placeholder="press a new task into the bark…" className="ink-field" />
            <button type="submit" className="btn btn-ember" style={{ padding: "0.5rem 0.8rem" }} aria-label="Add task"><Plus size={18} /></button>
          </form>

          <ul className="mt-4 flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {pending.map((t) => (
                <motion.li key={t.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-2 group">
                  <button onClick={() => run(() => toggleTask(t.id, true), "chime")} aria-label="Mark done"
                    className="grid place-items-center rounded-md shrink-0"
                    style={{ width: 22, height: 22, border: "2px solid #8a6b47" }} />
                  <span className="font-hand text-xl flex-1" style={{ color: "#3a2c1a" }}>{t.content}</span>
                  <button onClick={() => run(() => deleteTask(t.id), "tap")} aria-label="Delete"
                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition" style={{ color: "#8a2330" }}>
                    <Trash2 size={15} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
            {pending.length === 0 && <li className="font-hand text-lg" style={{ color: "#9c7a4f" }}>nothing left to do — go read 🍄</li>}
          </ul>

          {done.length > 0 && (
            <>
              <div className="mt-4 mb-2 text-xs uppercase tracking-wider" style={{ color: "#9c7a4f" }}>done</div>
              <ul className="flex flex-col gap-1.5">
                {done.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 group">
                    <button onClick={() => run(() => toggleTask(t.id, false), "tap")} aria-label="Mark not done"
                      className="grid place-items-center rounded-md shrink-0"
                      style={{ width: 22, height: 22, border: "2px solid #8a6b47", background: "#8a6b47", color: "#f3e7cf" }}>
                      <Check size={14} />
                    </button>
                    <span className="font-hand text-xl flex-1 line-through" style={{ color: "#9c7a4f" }}>{t.content}</span>
                    <button onClick={() => run(() => deleteTask(t.id), "tap")} aria-label="Delete"
                      className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition" style={{ color: "#8a2330" }}>
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* MARGINALIA */}
        <section className="flex flex-col gap-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="font-serif-d text-xl" style={{ color: "var(--color-vellum)" }}>🪶 New marginalia</h2>
            {focusTitle && (
              <p className="text-sm mt-1 font-hand text-lg" style={{ color: "var(--color-candle)" }}>
                a note for <em>{focusTitle}</em>
              </p>
            )}
            <form onSubmit={submitNote} className="mt-3 flex flex-col gap-2">
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} maxLength={4000}
                placeholder="whisper something to your future self…" className="ink-field" />
              <div className="flex gap-2">
                <select value={noteBook} onChange={(e) => setNoteBook(e.target.value)} className="ink-field" style={{ flex: 1 }}>
                  <option value="">✦ a general thought</option>
                  {books.map((b) => <option key={b.id} value={b.id}>📖 {b.title}</option>)}
                </select>
                <button type="submit" className="btn btn-ember"><Plus size={16} /> Pin it</button>
              </div>
            </form>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <AnimatePresence initial={false}>
              {notes.map((n, i) => (
                <motion.div key={n.id} layout initial={{ opacity: 0, y: 10, rotate: 0 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="parchment p-4" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.6}deg)` }}>
                  {editing?.id === n.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea value={editing.content} onChange={(e) => setEditing({ id: n.id, content: e.target.value })} rows={4} className="ink-field" />
                      <div className="flex gap-2">
                        <button onClick={() => { run(() => updateNote(n.id, editing.content), "tap"); setEditing(null); }} className="btn btn-ember" style={{ padding: "0.3rem 0.7rem" }}><Check size={14} /> Save</button>
                        <button onClick={() => setEditing(null)} className="btn" style={{ padding: "0.3rem 0.7rem", background: "rgba(120,86,46,0.2)", color: "#5a4225" }}><X size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {n.bookTitle && <div className="text-xs mb-1 font-serif-d" style={{ color: "#8a2330" }}>📖 {n.bookTitle}</div>}
                      <p className="font-hand text-xl whitespace-pre-wrap" style={{ color: "#3a2c1a" }}>{n.content}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs" style={{ color: "#9c7a4f" }}>{fmtDate(n.createdAt)}</span>
                        <div className="flex gap-1">
                          <button onClick={() => { sfx("open"); setEditing({ id: n.id, content: n.content }); }} aria-label="Edit" style={{ color: "#6b4a2b" }}><Pencil size={14} /></button>
                          <button onClick={() => run(() => deleteNote(n.id), "close")} aria-label="Delete" style={{ color: "#8a2330" }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {notes.length === 0 && (
            <p className="font-hand text-xl text-center py-6" style={{ color: "var(--color-moss-300)" }}>the margins are still blank…</p>
          )}
        </section>
      </div>
    </div>
  );
}
