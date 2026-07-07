import PDFDocument from "pdfkit";
import { Writable } from "stream";
import { getMeetingDetail } from "../services/meetingService";

function parseJSON(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") { try { return JSON.parse(val); } catch { return []; } }
  return [];
}

/**
 * Generate a professional PDF for a meeting and return it as a Buffer.
 * Includes: meeting name, date, participants, transcript, summary, action items, footer.
 */
export async function generateMeetingPDF(clubId: number, meetingId: number): Promise<Buffer> {
  const meeting = await getMeetingDetail(clubId, meetingId);
  if (!meeting) throw new Error("not_found");

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 100; // margins
    const NAVY = "#003F87";
    const GOLD = "#FFD100";
    const INK = "#0A1628";
    const MUTE = "#6B7785";

    // ── Header ──
    doc.fontSize(22).fillColor(NAVY).font("Helvetica-Bold").text("Lions Club Ahmedabad Host", 50, 50);
    doc.fontSize(10).fillColor(GOLD).text("Meeting Report", 50, 78);
    doc.moveDown(0.5);
    // Divider line
    doc.moveTo(50, 95).lineTo(pageWidth - 50, 95).strokeColor(NAVY).lineWidth(1.5).stroke();

    // ── Meeting info ──
    let y = 115;
    doc.fontSize(18).fillColor(INK).font("Helvetica-Bold").text(meeting.title, 50, y);
    y += 28;
    doc.fontSize(11).fillColor(MUTE).font("Helvetica");
    if (meeting.meeting_date) { doc.text("Date: " + meeting.meeting_date, 50, y); y += 16; }
    if (meeting.location) { doc.text("Location: " + meeting.location, 50, y); y += 16; }
    const h = Math.floor(meeting.duration_seconds / 3600);
    const m = Math.floor((meeting.duration_seconds % 3600) / 60);
    const s = meeting.duration_seconds % 60;
    const duration = meeting.duration_seconds ? (h ? h + "h " + m + "m" : m ? m + "m " + s + "s" : s + "s") : "--";
    doc.text("Duration: " + duration, 50, y); y += 16;
    if (meeting.meeting_type) { doc.text("Type: " + meeting.meeting_type, 50, y); y += 16; }
    if (meeting.meeting_mood) { doc.text("Mood: " + meeting.meeting_mood, 50, y); y += 16; }

    // ── Participants ──
    if (meeting.participants.length) {
      y += 6;
      doc.fontSize(12).fillColor(NAVY).font("Helvetica-Bold").text("Participants", 50, y);
      y += 18;
      doc.fontSize(10).fillColor(INK).font("Helvetica");
      for (const p of meeting.participants) {
        doc.text(p.name + (p.role ? "  (" + p.role + ")" : ""), 60, y);
        y += 14;
      }
    }

    // ── Executive Summary ──
    if (meeting.summary?.executive_summary) {
      y += 12;
      if (y > 700) { doc.addPage(); y = 50; }
      doc.fontSize(12).fillColor(NAVY).font("Helvetica-Bold").text("Executive Summary", 50, y);
      y += 18;
      doc.fontSize(10).fillColor(INK).font("Helvetica");
      const summaryText = meeting.summary.executive_summary;
      const summaryHeight = doc.heightOfString(summaryText, { width: contentWidth });
      if (y + summaryHeight > 780) { doc.addPage(); y = 50; }
      doc.text(summaryText, 50, y, { width: contentWidth, lineGap: 4 });
      y += summaryHeight + 8;
    }

    // ── Key Discussions ──
    const keyDiscussions = parseJSON(meeting.summary?.key_discussions);
    if (keyDiscussions.length) {
      y += 8;
      if (y > 740) { doc.addPage(); y = 50; }
      doc.fontSize(12).fillColor(NAVY).font("Helvetica-Bold").text("Key Discussions", 50, y);
      y += 18;
      doc.fontSize(10).fillColor(INK).font("Helvetica");
      for (const d of keyDiscussions) {
        const text = "\u2022  " + String(d);
        const h2 = doc.heightOfString(text, { width: contentWidth });
        if (y + h2 > 780) { doc.addPage(); y = 50; }
        doc.text(text, 50, y, { width: contentWidth, lineGap: 3 });
        y += h2 + 4;
      }
    }

    // ── Action Items ──
    if (meeting.action_items.length) {
      y += 8;
      if (y > 740) { doc.addPage(); y = 50; }
      doc.fontSize(12).fillColor(NAVY).font("Helvetica-Bold").text("Action Items", 50, y);
      y += 18;
      doc.fontSize(10).fillColor(INK).font("Helvetica");
      for (const ai of meeting.action_items) {
        const text = "\u2022  " + ai.description + (ai.assignee ? " (" + ai.assignee + ")" : "") + "  [" + ai.status + "]";
        const h2 = doc.heightOfString(text, { width: contentWidth });
        if (y + h2 > 780) { doc.addPage(); y = 50; }
        doc.text(text, 50, y, { width: contentWidth, lineGap: 3 });
        y += h2 + 4;
      }
    }

    // ── Decisions ──
    if (meeting.decisions.length) {
      y += 8;
      if (y > 740) { doc.addPage(); y = 50; }
      doc.fontSize(12).fillColor(NAVY).font("Helvetica-Bold").text("Decisions", 50, y);
      y += 18;
      doc.fontSize(10).fillColor(INK).font("Helvetica");
      for (const d of meeting.decisions) {
        const text = "\u2022  " + d.description + (d.decided_by ? " (" + d.decided_by + ")" : "");
        const h2 = doc.heightOfString(text, { width: contentWidth });
        if (y + h2 > 780) { doc.addPage(); y = 50; }
        doc.text(text, 50, y, { width: contentWidth, lineGap: 3 });
        y += h2 + 4;
      }
    }

    // ── Follow-Ups ──
    if (meeting.follow_ups.length) {
      y += 8;
      if (y > 740) { doc.addPage(); y = 50; }
      doc.fontSize(12).fillColor(NAVY).font("Helvetica-Bold").text("Follow-Ups", 50, y);
      y += 18;
      doc.fontSize(10).fillColor(INK).font("Helvetica");
      for (const f of meeting.follow_ups) {
        const text = "\u2022  " + f.description + (f.owner ? " (" + f.owner + ")" : "");
        const h2 = doc.heightOfString(text, { width: contentWidth });
        if (y + h2 > 780) { doc.addPage(); y = 50; }
        doc.text(text, 50, y, { width: contentWidth, lineGap: 3 });
        y += h2 + 4;
      }
    }

    // ── Risks ──
    const risks = parseJSON(meeting.summary?.risks);
    if (risks.length) {
      y += 8;
      if (y > 740) { doc.addPage(); y = 50; }
      doc.fontSize(12).fillColor(NAVY).font("Helvetica-Bold").text("Risks", 50, y);
      y += 18;
      doc.fontSize(10).fillColor(INK).font("Helvetica");
      for (const r of risks) {
        const text = "\u2022  " + String(r);
        const h2 = doc.heightOfString(text, { width: contentWidth });
        if (y + h2 > 780) { doc.addPage(); y = 50; }
        doc.text(text, 50, y, { width: contentWidth, lineGap: 3 });
        y += h2 + 4;
      }
    }

    // ── Topics ──
    const topics = parseJSON(meeting.summary?.topics);
    if (topics.length) {
      y += 8;
      if (y > 740) { doc.addPage(); y = 50; }
      doc.fontSize(12).fillColor(NAVY).font("Helvetica-Bold").text("Topics", 50, y);
      y += 18;
      doc.fontSize(10).fillColor(INK).font("Helvetica");
      const topicText = topics.join(", ");
      const h2 = doc.heightOfString(topicText, { width: contentWidth });
      if (y + h2 > 780) { doc.addPage(); y = 50; }
      doc.text(topicText, 50, y, { width: contentWidth });
      y += h2 + 8;
    }

    // ── Transcript (on a new page) ──
    if (meeting.transcript?.full_text) {
      doc.addPage();
      y = 50;
      doc.fontSize(12).fillColor(NAVY).font("Helvetica-Bold").text("Transcript", 50, y);
      y += 20;
      doc.fontSize(9).fillColor(INK).font("Helvetica");
      const transcriptLines = meeting.transcript.full_text.split("\n");
      for (const line of transcriptLines) {
        if (y > 780) { doc.addPage(); y = 50; }
        doc.text(line, 50, y, { width: contentWidth, lineGap: 2 });
        y += doc.heightOfString(line, { width: contentWidth }) + 2;
      }
    }

    // ── Page numbers ──
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.start + pages.count; i++) {
      doc.switchToPage(i);
      const pageH = doc.page.height;
      doc.fontSize(8).fillColor(MUTE).font("Helvetica").text(
        "Lions Club Ahmedabad Host  -  Page " + (i + 1) + " of " + pages.count,
        50, pageH - 35, { width: contentWidth, align: "center" }
      );
    }

    doc.end();
  });
}