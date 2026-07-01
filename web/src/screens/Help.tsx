import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState } from '../components/ui';
import { GUIDE_SECTIONS, GUIDE_FAQS, type GuideSection, type GuideFAQ } from '../lib/guide';

export default function Help() {
  const [q, setQ] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const dbFaqs = useQuery({ queryKey: ['faqs'], queryFn: () => api.get<{ faqs: any[] }>('/faqs') });

  // Merge built-in FAQs with any DB-managed FAQs.
  const allFaqs: GuideFAQ[] = useMemo(() => {
    const db = (dbFaqs.data?.faqs ?? []).map((f) => ({ q: f.question, a: f.answer, category: f.category || 'General' }));
    return [...GUIDE_FAQS, ...db];
  }, [dbFaqs.data]);

  const ql = q.trim().toLowerCase();
  const sections: GuideSection[] = ql
    ? GUIDE_SECTIONS.filter((s) => `${s.title} ${s.summary} ${s.steps.join(' ')} ${(s.tips ?? []).join(' ')}`.toLowerCase().includes(ql))
    : GUIDE_SECTIONS;
  const faqs: GuideFAQ[] = ql
    ? allFaqs.filter((f) => `${f.q} ${f.a} ${f.category}`.toLowerCase().includes(ql))
    : allFaqs;

  const faqGroups = faqs.reduce((acc: Record<string, GuideFAQ[]>, f) => { const k = f.category; (acc[k] = acc[k] || []).push(f); return acc; }, {});

  return (
    <>
      <div className="page-head">
        <div><h1>Help &amp; User Guide</h1><div className="sub">How to use the portal &mdash; search pages or questions</div></div>
      </div>

      <div className="card pad" style={{ marginBottom: 16, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--faint)' }}><Icon name="search" size={18} /></span>
        <input className="input" style={{ paddingLeft: 38 }} placeholder="Search the guide or FAQs (e.g. RSVP, upload, officer)..."
          value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      </div>

      {q && (sections.length === 0 && faqs.length === 0) ? <EmptyState icon="search" title={`No matches for "${q}"`} body="Try a different keyword." /> : (
        <>
          {sections.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, color: 'var(--muted)', margin: '6px 4px 12px', letterSpacing: '.04em', textTransform: 'uppercase' }}>User Guide &middot; {sections.length}</h3>
              <div className="grid grid-2" style={{ marginBottom: 20 }}>
                {sections.map((s) => (
                  <div key={s.id} className="card pad">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 24, lineHeight: 1 }}>{s.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>{s.title}</div>
                        <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>{s.summary}</div>
                      </div>
                    </div>
                    <ol style={{ margin: '14px 0 0', paddingLeft: 20, lineHeight: 1.6 }}>
                      {s.steps.map((step, i) => <li key={i} style={{ marginBottom: 6, color: 'var(--ink-2)' }}>{step}</li>)}
                    </ol>
                    {s.tips && s.tips.length > 0 && (
                      <div style={{ marginTop: 12, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 12px' }}>
                        {s.tips.map((t, i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i ? 6 : 0 }}><Icon name="check" size={15} /><span className="muted" style={{ fontSize: 13 }}>{t}</span></div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {faqs.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, color: 'var(--muted)', margin: '6px 4px 12px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Frequently Asked &middot; {faqs.length}</h3>
              {dbFaqs.isLoading ? <Spinner /> : Object.entries(faqGroups).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>{cat}</div>
                  {items.map((f, i) => {
                    const key = `${cat}-${i}`;
                    const open = openFaq === key;
                    return (
                      <div key={key} className="card" style={{ marginBottom: 8, overflow: 'hidden' }}>
                        <button className="list-row" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => setOpenFaq(open ? null : key)}>
                          <div className="meta"><div className="title" style={{ fontSize: 14 }}>{f.q}</div></div>
                          <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s', display: 'inline-flex' }}><Icon name="chevron" size={16} /></span>
                        </button>
                        {open && <div className="muted" style={{ padding: '0 18px 16px', lineHeight: 1.6 }}>{f.a}</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}

          <hr className="divider" />
          <div className="muted" style={{ marginBottom: 10 }}>Still need help?</div>
          <a href="mailto:secretary@lionsclubahmedabad.org" className="btn outline">
            <Icon name="mail" size={16} /> Contact the Secretary
          </a>
        </>
      )}
    </>
  );
}