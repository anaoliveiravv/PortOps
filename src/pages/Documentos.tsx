import { useEffect, useMemo, useRef, useState } from "react";
import { documents as seedDocuments, ships, type DocumentItem } from "@/data/mockData";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Paperclip,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useProfile } from "@/store/profileStore";
import { PROFILES } from "@/data/profiles";
import { useLanguageCode } from "@/i18n/useT";
import { ShipLink } from "@/components/ShipLink";
import { DocumentStatusBadge } from "@/components/StatusBadges";
import { SummaryMetricCard, SummaryMetricsPanel } from "@/components/SummaryMetrics";

type LocalDocument = DocumentItem & {
  source: "seed" | "upload";
  file?: File;
  previewUrl?: string;
  mimeType?: string;
};

const DOC_TYPES: DocumentItem["type"][] = ["BL", "Manifesto", "Certificado Sanitário", "DI", "Lista de Tripulação"];

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function escapePdfText(input: string) {
  return input
    .normalize("NFD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function createPdfBlob(lines: string[]) {
  const content = lines
    .map((line, index) => `BT /F1 12 Tf 1 0 0 1 48 ${790 - index * 22} Tm (${escapePdfText(line)}) Tj ET`)
    .join("\n");

  const stream = `${content}\n`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function createSeedDocumentBlob(doc: DocumentItem) {
  const ship = ships.find((item) => item.id === doc.shipId);

  if (doc.name.endsWith(".xml")) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<declaracaoImportacao numero="${doc.id}">
  <navio imo="${ship?.imo ?? ""}" nome="${ship?.name ?? ""}" />
  <carga>${ship?.cargo ?? ""}</carga>
  <agente>${ship?.agent ?? ""}</agente>
  <status>${doc.status}</status>
  <emitidoEm>${doc.uploadedAt}</emitidoEm>
</declaracaoImportacao>`;

    return new Blob([xml], { type: "application/xml" });
  }

  const lines = [
    "PortOps - Documento operacional de demonstracao",
    "",
    `Arquivo: ${doc.name}`,
    `Documento: ${doc.id}`,
    `Tipo: ${doc.type}`,
    `Status: ${doc.status}`,
    `Navio: ${ship?.name ?? "Nao informado"}`,
    `IMO: ${ship?.imo ?? "Nao informado"}`,
    `Agente: ${ship?.agent ?? "Nao informado"}`,
    `Origem: ${ship?.origin ?? "Nao informada"}`,
    `Carga: ${ship?.cargo ?? "Nao informada"}`,
    `Enviado por: ${doc.uploadedBy}`,
    `Data de envio: ${new Date(doc.uploadedAt).toLocaleString("pt-BR")}`,
    "",
    "Este arquivo foi gerado para visualizacao no prototipo.",
    "Em ambiente real, a area exibiria o arquivo oficial enviado pelo usuario.",
  ];

  return createPdfBlob(lines);
}

function inferMimeType(name: string, fallback?: string) {
  if (fallback) return fallback;
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".xml")) return "application/xml";
  if (name.match(/\.(png|jpg|jpeg|webp)$/i)) return "image/*";
  return "application/octet-stream";
}

export default function Documentos() {
  const language = useLanguageCode();
  const locale = language === "pt" ? "pt-BR" : language === "en" ? "en-US" : "zh-CN";
  const { current } = useProfile();
  const profile = current ? PROFILES[current] : null;
  const [documents, setDocuments] = useState<LocalDocument[]>(
    seedDocuments.map((doc) => ({ ...doc, source: "seed" as const })),
  );
  const [selected, setSelected] = useState<LocalDocument | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shipId, setShipId] = useState(ships[0]?.id ?? "");
  const [docType, setDocType] = useState<DocumentItem["type"]>("Manifesto");
  const [file, setFile] = useState<File | null>(null);
  const createdUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = createdUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const stats = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        acc.total += 1;
        acc[doc.status] += 1;
        return acc;
      },
      { total: 0, validado: 0, pendente: 0, rejeitado: 0 },
    );
  }, [documents]);

  const shipMap = useMemo(() => new Map(ships.map((ship) => [ship.id, ship])), []);

  const ensurePreview = (doc: LocalDocument) => {
    if (doc.previewUrl) return doc;

    let blob: Blob;
    let mimeType = inferMimeType(doc.name, doc.mimeType);

    if (doc.source === "upload" && doc.file) {
      blob = doc.file;
      mimeType = inferMimeType(doc.file.name, doc.file.type);
    } else {
      blob = createSeedDocumentBlob(doc);
      mimeType = blob.type;
    }

    const previewUrl = URL.createObjectURL(blob);
    createdUrls.current.add(previewUrl);

    const nextDoc = { ...doc, previewUrl, mimeType };
    setDocuments((current) => current.map((item) => (item.id === doc.id ? nextDoc : item)));
    return nextDoc;
  };

  const openDocument = (doc: LocalDocument) => {
    const previewable = ensurePreview(doc);
    setSelected(previewable);
    setViewerOpen(true);
  };

  const downloadDocument = (doc: LocalDocument) => {
    const previewable = ensurePreview(doc);
    const link = window.document.createElement("a");
    link.href = previewable.previewUrl!;
    link.download = previewable.name;
    link.click();
  };

  const handleUpload = () => {
    if (!file) {
      toast(language === "pt" ? "Selecione um arquivo para continuar." : language === "en" ? "Select a file to continue." : "请选择文件以继续。");
      return;
    }

    const nextId = `D-${String(documents.length + 1).padStart(3, "0")}`;
    const uploaded: LocalDocument = {
      id: nextId,
      name: file.name,
      shipId,
      type: docType,
      status: "pendente",
      uploadedBy: language === "pt" ? "Usuário autenticado" : language === "en" ? "Authenticated user" : "已认证用户",
      uploadedAt: new Date().toISOString(),
      size: formatSize(file.size),
      source: "upload",
      file,
      mimeType: inferMimeType(file.name, file.type),
    };

    setDocuments((current) => [uploaded, ...current]);
    setUploadOpen(false);
    setFile(null);
    toast(language === "pt" ? "Documento enviado com sucesso." : language === "en" ? "Document uploaded successfully." : "文件上传成功。");
  };

  const selectedShip = selected ? shipMap.get(selected.shipId) : null;
  const selectedIsImage = selected?.mimeType?.startsWith("image/");
  const canViewSensitiveDocs = current
    ? ["gestor_porto", "admin_portuaria", "admin", "fiscal_receita", "policia_federal"].includes(current)
    : false;

  const isSensitiveDocument = (doc: LocalDocument) => doc.type === "Lista de Tripulação" || doc.type === "Manifesto";
  const isRestricted = (doc: LocalDocument) => isSensitiveDocument(doc) && !canViewSensitiveDocs;

  const openMaybeRestricted = (doc: LocalDocument) => {
    if (isRestricted(doc)) {
      toast(language === "pt" ? "Conteúdo restrito ao seu perfil institucional." : language === "en" ? "Content restricted for your institutional profile." : "该内容受您的机构身份限制。");
      return;
    }
    openDocument(doc);
  };

  const downloadMaybeRestricted = (doc: LocalDocument) => {
    if (isRestricted(doc)) {
      toast(language === "pt" ? "Download restrito ao seu perfil institucional." : language === "en" ? "Download restricted for your institutional profile." : "下载受您的机构身份限制。");
      return;
    }
    downloadDocument(doc);
  };

  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-8 animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary mb-1">
            {language === "pt" ? "Gestão documental integrada" : language === "en" ? "Integrated document control" : "集成文档管理"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{language === "pt" ? "Documentos" : language === "en" ? "Documents" : "文件"}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {language === "pt"
              ? "Envio, consulta, validação e visualização de arquivos vinculados a navios e operações, com fluxo pensado para agentes, terminais e órgãos anuentes."
              : language === "en"
                ? "Upload, lookup, validation and preview of files linked to vessels and operations, designed for agents, terminals and public agencies."
                : "用于船舶与作业文件的上传、查询、校验和预览，面向代理、码头和监管机构。"}
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="primary-action inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
        >
          <Upload className="h-4 w-4" /> {language === "pt" ? "Enviar documento" : language === "en" ? "Upload document" : "上传文件"}
        </button>
      </div>

      <SummaryMetricsPanel>
        {[
          { label: language === "pt" ? "Total" : language === "en" ? "Total" : "总计", value: stats.total, detail: language === "pt" ? "documentos rastreados" : language === "en" ? "tracked documents" : "已跟踪文件", surface: "border-primary/20 bg-primary/[0.04]", icon: FileText, text: "text-primary" },
          { label: language === "pt" ? "Validados" : language === "en" ? "Validated" : "已验证", value: stats.validado, detail: language === "pt" ? "prontos para uso" : language === "en" ? "ready for use" : "可直接使用", surface: "border-success/25 bg-success/5", icon: CheckCircle2, text: "text-success" },
          { label: language === "pt" ? "Pendentes" : language === "en" ? "Pending" : "待处理", value: stats.pendente, detail: language === "pt" ? "aguardando análise" : language === "en" ? "awaiting review" : "等待审核", surface: "border-warning/25 bg-warning/5", icon: Clock, text: "text-warning" },
          { label: language === "pt" ? "Rejeitados" : language === "en" ? "Rejected" : "已拒绝", value: stats.rejeitado, detail: language === "pt" ? "requerem ajuste" : language === "en" ? "need adjustment" : "需要调整", surface: "border-destructive/25 bg-destructive/5", icon: XCircle, text: "text-destructive" },
        ].map((item) => (
          <SummaryMetricCard key={item.label} className={item.surface}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#405672]">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-[#102a4c]">{item.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.detail}</div>
              </div>
              <item.icon className={`h-5 w-5 ${item.text}`} />
            </div>
          </SummaryMetricCard>
        ))}
      </SummaryMetricsPanel>

      <div className="premium-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-sm font-semibold">{language === "pt" ? "Repositório operacional" : language === "en" ? "Operational repository" : "运营文档库"}</div>
            <div className="text-xs text-muted-foreground">
              {language === "pt" ? "Clique em um documento para visualizar ou baixar o arquivo." : language === "en" ? "Click a document to preview or download the file." : "点击文件可预览或下载。"}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              <tr>
                <th className="text-left px-5 py-3">{language === "pt" ? "Documento" : language === "en" ? "Document" : "文件"}</th>
                <th className="text-left px-3 py-3">{language === "pt" ? "Tipo" : language === "en" ? "Type" : "类型"}</th>
                <th className="text-left px-3 py-3">{language === "pt" ? "Navio" : language === "en" ? "Vessel" : "船舶"}</th>
                <th className="text-left px-3 py-3">{language === "pt" ? "Enviado por" : language === "en" ? "Uploaded by" : "上传人"}</th>
                <th className="text-left px-3 py-3">{language === "pt" ? "Status" : language === "en" ? "Status" : "状态"}</th>
                <th className="text-right px-3 py-3">{language === "pt" ? "Tamanho" : language === "en" ? "Size" : "大小"}</th>
                <th className="text-right px-5 py-3">{language === "pt" ? "Ações" : language === "en" ? "Actions" : "操作"}</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const ship = shipMap.get(doc.shipId);
                const restricted = isRestricted(doc);

                return (
                  <tr key={doc.id} className="border-b border-border/60 hover:bg-secondary/30">
                    <td className="px-5 py-4">
                      <button onClick={() => openMaybeRestricted(doc)} className="flex items-center gap-3 text-left">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground hover:text-primary">
                            {restricted ? (language === "pt" ? "Conteúdo restrito" : language === "en" ? "Restricted content" : "受限内容") : doc.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {doc.id} · {new Date(doc.uploadedAt).toLocaleString(locale)}
                          </div>
                          {restricted && <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-destructive">{language === "pt" ? "Visível apenas para perfis autorizados" : language === "en" ? "Visible only to authorized profiles" : "仅授权身份可见"}</div>}
                        </div>
                      </button>
                    </td>
                    <td className="px-3 py-4 text-xs text-muted-foreground">
                      {restricted ? (
                        <span className="inline-flex min-h-[1.75rem] items-center justify-center gap-1.5 rounded-[0.52rem] border border-red-200 bg-red-50/85 px-2.5 py-1 text-[0.72rem] font-semibold leading-none tracking-[-0.01em] text-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                          {language === "pt" ? "Restrito" : language === "en" ? "Restricted" : "受限"}
                        </span>
                      ) : doc.type}
                    </td>
                    <td className="px-3 py-4 text-xs">
                      {ship ? (
                        <ShipLink shipId={ship.id} className="text-foreground no-underline hover:text-primary">
                          {ship.flag} {ship.name}
                        </ShipLink>
                      ) : null}
                    </td>
                    <td className="px-3 py-4 text-xs text-muted-foreground">{doc.uploadedBy}</td>
                    <td className="px-3 py-4">
                      <DocumentStatusBadge status={doc.status} compact />
                    </td>
                    <td className="px-3 py-4 text-right text-xs text-muted-foreground font-mono">{doc.size}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openMaybeRestricted(doc)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {language === "pt" ? "Ver" : language === "en" ? "View" : "查看"}
                        </button>
                        <button
                          onClick={() => downloadMaybeRestricted(doc)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {language === "pt" ? "Baixar" : language === "en" ? "Download" : "下载"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl rounded-[1.75rem] border-border p-0 overflow-hidden">
          <div className="document-grid bg-secondary/70 p-7">
            <DialogHeader>
              <DialogTitle>{language === "pt" ? "Enviar documento" : language === "en" ? "Upload document" : "上传文件"}</DialogTitle>
              <DialogDescription>
                {language === "pt"
                  ? "Vincule o arquivo ao navio e ao tipo documental correspondente para manter a trilha operacional organizada."
                  : language === "en"
                    ? "Link the file to the vessel and matching document type to keep the operational trail organized."
                    : "请将文件关联到船舶和对应的文件类型，以保持作业链路有序。"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-5 p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">{language === "pt" ? "Navio vinculado" : language === "en" ? "Linked vessel" : "关联船舶"}</span>
                <select
                  value={shipId}
                  onChange={(event) => setShipId(event.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"
                >
                  {ships.map((ship) => (
                    <option key={ship.id} value={ship.id}>
                      {ship.flag} {ship.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">{language === "pt" ? "Tipo documental" : language === "en" ? "Document type" : "文件类型"}</span>
                <select
                  value={docType}
                  onChange={(event) => setDocType(event.target.value as DocumentItem["type"])}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"
                >
                  {DOC_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block rounded-[1.5rem] border border-dashed border-border bg-secondary/40 p-5 transition hover:border-primary/35">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-primary">
                  <Paperclip className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{language === "pt" ? "Selecionar arquivo" : language === "en" ? "Select file" : "选择文件"}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {language === "pt" ? "Suporta PDF, XML e imagens de apoio operacional." : language === "en" ? "Supports PDF, XML and operational support images." : "支持 PDF、XML 和辅助作业图片。"}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.xml,.png,.jpg,.jpeg,.webp"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="mt-4 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-[#0759ce] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-95"
                  />
                  {file && (
                    <div className="mt-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground">
                      <div className="font-medium">{file.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{formatSize(file.size)}</div>
                    </div>
                  )}
                </div>
              </div>
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setUploadOpen(false)}
                className="rounded-2xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                {language === "pt" ? "Cancelar" : language === "en" ? "Cancel" : "取消"}
              </button>
              <button
                onClick={handleUpload}
                className="primary-action rounded-2xl px-5 py-3 text-sm font-semibold"
              >
                {language === "pt" ? "Confirmar envio" : language === "en" ? "Confirm upload" : "确认上传"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-6xl rounded-[1.75rem] border-border p-0 overflow-hidden">
          {selected && (
            <>
              <div className="document-grid bg-secondary/70 px-7 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <DialogHeader>
                      <DialogTitle>{selected.name}</DialogTitle>
                      <DialogDescription>
                        {selectedShip?.flag} {selectedShip?.name} · {selected.type} · {language === "pt" ? "enviado por" : language === "en" ? "uploaded by" : "上传人"} {selected.uploadedBy}
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadDocument(selected)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
                    >
                      <Download className="h-4 w-4" />
                      {language === "pt" ? "Baixar arquivo" : language === "en" ? "Download file" : "下载文件"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
                <div className="bg-[#eef4f9] p-5">
                  <div className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm">
                    {selected && isRestricted(selected) ? (
                      <div className="grid min-h-[50vh] place-items-center rounded-[1rem] border border-dashed border-destructive/25 bg-destructive/5 p-6 text-center">
                        <div>
                          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div className="mt-4 text-lg font-semibold text-foreground">{language === "pt" ? "Conteúdo restrito pelo perfil" : language === "en" ? "Profile-restricted content" : "内容受身份限制"}</div>
                          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                            {profile
                              ? language === "pt"
                                ? `${profile.name} não possui visibilidade para este arquivo sensível.`
                                : language === "en"
                                  ? `${profile.name} does not have visibility for this sensitive file.`
                                  : `${profile.name} 无权查看此敏感文件。`
                              : language === "pt"
                                ? "Seu perfil não possui visibilidade para este arquivo sensível."
                                : language === "en"
                                  ? "Your profile does not have visibility for this sensitive file."
                                  : "您的身份无权查看此敏感文件。"}
                          </p>
                        </div>
                      </div>
                    ) : selectedIsImage ? (
                      <img src={selected.previewUrl} alt={selected.name} className="max-h-[70vh] w-full rounded-[1rem] object-contain bg-white" />
                    ) : (
                      <object data={selected.previewUrl} type={selected.mimeType} className="h-[70vh] w-full rounded-[1rem] bg-white">
                        <iframe title={selected.name} src={selected.previewUrl} className="h-[70vh] w-full rounded-[1rem] bg-white" />
                      </object>
                    )}
                  </div>
                </div>

                <aside className="border-l border-border bg-white p-5">
                  <div className="rounded-[1.5rem] border border-border bg-secondary/35 p-4">
                    <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{language === "pt" ? "Metadados" : language === "en" ? "Metadata" : "元数据"}</div>
                    <div className="mt-4 space-y-4 text-sm">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">{language === "pt" ? "Status" : language === "en" ? "Status" : "状态"}</div>
                        <div className="mt-2">
                          <DocumentStatusBadge status={selected.status} />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">{language === "pt" ? "Navio" : language === "en" ? "Vessel" : "船舶"}</div>
                        <div className="mt-1 font-medium">
                          {selectedShip ? (
                            <ShipLink shipId={selectedShip.id} className="text-foreground no-underline hover:text-primary">
                              {selectedShip.flag} {selectedShip.name}
                            </ShipLink>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">{language === "pt" ? "Enviado por" : language === "en" ? "Uploaded by" : "上传人"}</div>
                        <div className="mt-1 font-medium">{selected.uploadedBy}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">{language === "pt" ? "Data" : language === "en" ? "Date" : "日期"}</div>
                        <div className="mt-1 font-medium">{new Date(selected.uploadedAt).toLocaleString(locale)}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">{language === "pt" ? "Tamanho" : language === "en" ? "Size" : "大小"}</div>
                        <div className="mt-1 font-medium">{selected.size}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">{language === "pt" ? "Visibilidade" : language === "en" ? "Visibility" : "可见性"}</div>
                        <div className="mt-1 font-medium">{selected && isRestricted(selected) ? (language === "pt" ? "Restrita" : language === "en" ? "Restricted" : "受限") : (language === "pt" ? "Completa" : language === "en" ? "Full" : "完整")}</div>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
