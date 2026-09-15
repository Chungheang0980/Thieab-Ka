"use client";

import { Gift, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { AdminShell } from "@/components/AdminShell";
import { useWedding } from "@/components/WeddingProvider";

export default function DrawPage() {
  const { guests } = useWedding();
  const eligible = guests.filter((guest) => guest.status === "attending");
  const [winner, setWinner] = useState<typeof guests[number] | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [display, setDisplay] = useState("TK-0000");

  function draw() {
    if (!eligible.length || drawing) return;
    setWinner(null);
    setDrawing(true);
    let count = 0;
    const timer = setInterval(() => {
      setDisplay(eligible[Math.floor(Math.random() * eligible.length)].luckyId);
      count++;
      if (count > 18) {
        clearInterval(timer);
        const selected = eligible[Math.floor(Math.random() * eligible.length)];
        setDisplay(selected.luckyId);
        setWinner(selected);
        setDrawing(false);
      }
    }, 90);
  }

  return (
    <AdminShell title="ចាប់រង្វាន់សំណាង" subtitle={`${eligible.length} confirmed guests are eligible`}>
      <section className="draw-stage">
        <div className="draw-kicker"><Sparkles size={16} /> THIEAB KA LUCKY DRAW <Sparkles size={16} /></div>
        <h2>រង្វាន់សំណាង</h2>
        <p>ជ្រើសរើសអ្នកឈ្នះពីភ្ញៀវដែលបានបញ្ជាក់ការចូលរួម</p>
        <motion.div className={`draw-number ${drawing ? "drawing" : ""}`} animate={drawing ? { scale: [1, 1.04, 1] } : {}} transition={{ repeat: Infinity, duration: .35 }}>
          <small>LUCKY ID</small><strong>{display}</strong>
        </motion.div>
        {winner && <motion.div className="winner" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><Trophy /><div><small>សូមអបអរសាទរ</small><strong>{winner.name}</strong><span>តុ {winner.table}</span></div></motion.div>}
        <button className="draw-button" onClick={draw} disabled={drawing || !eligible.length}>{drawing ? <RotateCcw className="spin" /> : <Gift />} {drawing ? "កំពុងជ្រើសរើស..." : winner ? "ចាប់ម្តងទៀត" : "ចាប់រង្វាន់"}</button>
        <span className="draw-note">ការជ្រើសរើសត្រូវបានធ្វើដោយចៃដន្យពីភ្ញៀវចូលរួម</span>
      </section>
    </AdminShell>
  );
}
