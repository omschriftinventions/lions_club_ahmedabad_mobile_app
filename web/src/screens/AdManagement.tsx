import React, { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Icon } from "../components/Icon";
import { Spinner, Pill } from "../components/ui";

interface AdRow {
  id: number;
  image_url: string;
  title: string | null;
  link_url: string | null;
  placement: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

type Placement = "dashboard" | "login" | "both";

export default function AdManagement() {
  const { member } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [placement, setPlacement] = useState<Placement>("both");
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["ads", "all"],
    queryFn: () => api.get<{ ads: AdRow[] }>("/advertisements/all"),
  });

  const uploadMut = useMutation({
    mutationFn: (params: { file: string; title: string; placement: Placement; link_url?: string | null }) =>
      api.post<{ id: number; url: string }>("/advertisements/upload", params),
    onSuccess: () => { refetch(); setShowUpload(false); setFile(null); setTitle(""); setLinkUrl(""); setFileName(""); },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api.patch("/advertisements/" + id, { is_active: active }),
    onSuccess: () => refetch(),
  });

  const placementMut = useMutation({
    mutationFn: ({ id, placement }: { id: number; placement: Placement }) =>
      api.patch("/advertisements/" + id, { placement }),
    onSuccess: () => refetch(),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete("/advertisements/" + id),
    onSuccess: () => refetch(),
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => setFile(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleUpload = () => {
    if (!file) return;
    uploadMut.mutate({ file, title, placement, link_url: linkUrl || null });
  };

  const cyclePlacement = (ad: AdRow) => {
    const order: Placement[] = ["both", "dashboard", "login"];
    const current = ad.placement as Placement;
    const next = order[(order.indexOf(current) + 1) % order.length];
    placementMut.mutate({ id: ad.id, placement: next });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this advertisement permanently?")) deleteMut.mutate(id);
  };

  if (!member?.superAdmin) {
    return <div className="card pad"><div className="empty"><div className="ic"><Icon name="settings" size={38} /></div><div style={{ fontWeight: 700 }}>Super admin access required</div></div></div>;
  }

  return (
    <>
      <div className="page-head" style={{ marginBottom: 16 }}>
        <div><h2>Advertisement Management</h2><div className="muted">Upload banner images for dashboard and/or login page. Multiple images rotate automatically.</div></div>
        <button className="btn primary" onClick={() => setShowUpload(!showUpload)}><Icon name="upload" size={16} /> {showUpload ? "Cancel" : "Upload New Ad"}</button>
      </div>

      {showUpload && (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="grid grid-2">
            <div className="field">
              <label>Advertisement Title (optional)</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sponsor banner" />
            </div>
            <div className="field">
              <label>Link URL (optional)</label>
              <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Placement</label>
            <div className="btn-row">
              {(["both", "dashboard", "login"] as Placement[]).map((p) => (
                <button key={p} className={"btn " + (placement === p ? "primary" : "outline")} onClick={() => setPlacement(p)}>{p}</button>
              ))}
            </div>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Image File</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />
            {fileName && <div className="muted" style={{ marginTop: 6 }}>Selected: {fileName}</div>}
          </div>
          <div className="btn-row" style={{ marginTop: 14 }}>
            <button className="btn primary" onClick={handleUpload} disabled={!file || uploadMut.isPending}>
              {uploadMut.isPending ? "Uploading..." : "Upload Advertisement"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? <Spinner /> : (data?.ads.length ?? 0) === 0 ? (
        <div className="card pad"><div className="empty"><div className="ic"><Icon name="image" size={38} /></div><div style={{ fontWeight: 700 }}>No advertisements yet</div><div className="muted">Click Upload New Ad to add one.</div></div></div>
      ) : (
        <div className="grid grid-3">
          {data?.ads.map((ad) => (
            <div key={ad.id} className="card" style={{ overflow: "hidden" }}>
              <img src={ad.image_url} alt={ad.title || "Ad"} style={{ width: "100%", height: 120, objectFit: "cover" }} />
              <div style={{ padding: 12 }}>
                {ad.title && <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{ad.title}</div>}
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <Pill tone={ad.placement === "login" ? "blue" : ad.placement === "dashboard" ? "green" : "gold"}>{ad.placement}</Pill>
                  <Pill tone={ad.is_active ? "green" : "gray"}>{ad.is_active ? "active" : "inactive"}</Pill>
                </div>
                <div className="btn-row">
                  <button className="btn ghost sm" onClick={() => toggleMut.mutate({ id: ad.id, active: !ad.is_active })}>
                    <Icon name="settings" size={14} /> {ad.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button className="btn ghost sm" onClick={() => cyclePlacement(ad)}>
                    <Icon name="search" size={14} /> Placement
                  </button>
                  <button className="btn ghost sm" onClick={() => handleDelete(ad.id)} style={{ color: "var(--red)" }}>
                    <Icon name="trash" size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}