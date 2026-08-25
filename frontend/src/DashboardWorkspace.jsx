import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  FileBarChart,
  FileImage,
  FileText,
  GitBranch,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Maximize2,
  MessageSquare,
  Moon,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  Send,
  Sparkles,
  Sun,
  UploadCloud,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { DotField } from './components/DotField';
import { SpotlightCard } from './components/SpotlightCard';
import { supabase } from './lib/supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const ACCEPTED_TYPES = '.pdf,.docx,.png,.jpg,.jpeg,.xlsx,.csv,.txt,.pptx';

const getWorkspaceTheme = (isLightMode) => ({
  bg: isLightMode ? '#FAFAF8' : '#0B0B0C',
  surface: isLightMode ? '#FFFFFF' : '#131416',
  card: isLightMode ? '#F5F5F4' : '#1A1B1E',
  accent: isLightMode ? '#D97706' : '#F59E0B',
  text: isLightMode ? '#18181B' : '#FAFAF9',
  secondary: isLightMode ? '#71717A' : '#A1A1AA',
  border: isLightMode ? 'rgba(24,24,27,0.10)' : 'rgba(250,250,249,0.10)',
  softBorder: isLightMode ? 'rgba(24,24,27,0.07)' : 'rgba(250,250,249,0.07)',
  dotFrom: isLightMode ? 'rgba(217,119,6,0.12)' : 'rgba(245,158,11,0.14)',
  dotTo: isLightMode ? 'rgba(217,119,6,0.05)' : 'rgba(245,158,11,0.05)',
});

const getFileIcon = (name) => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg'].includes(ext)) return FileImage;
  if (['xlsx', 'csv'].includes(ext)) return FileBarChart;
  return FileText;
};

const shortName = (name) => (name.length > 24 ? `${name.slice(0, 16)}...${name.slice(-5)}` : name);

const INGESTION_STAGES = ['Uploading', 'Parsing', 'OCR', 'Entity Extraction', 'Knowledge Graph Construction', 'Embedding Generation', 'Ready'];
const RESPONSE_STEPS = ['Reading document...', 'Finding evidence...', 'Cross-referencing sources...', 'Building response...', 'Generating answer...'];

const parseSseChunk = (chunk) => {
  const events = [];
  for (const block of chunk.split('\n\n')) {
    if (!block.trim()) continue;
    let event = 'message';
    const dataLines = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event: ')) event = line.substring(7).trim();
      if (line.startsWith('data: ')) dataLines.push(line.substring(6).trim());
    }
    if (!dataLines.length) continue;
    try {
      events.push({ event, data: JSON.parse(dataLines.join('')) });
    } catch {
      // The next network chunk will complete partial SSE frames.
    }
  }
  return events;
};

const normalizeSourceType = (source = {}) => {
  const type = String(source.content_type || '').toLowerCase();
  const content = String(source.content || source.snippet || '').toLowerCase();
  const title = String(source.title || '').toLowerCase();
  const tableLike = /\|[-:\s|]+\|/.test(content) || /\n\|/.test(content) || /<table\b/i.test(content) || /<tr\b/i.test(content) || /<td\b/i.test(content);
  if (type.includes('table') || tableLike) return 'table';
  const hasImagePlaceholder = /<!--\s*image\s*-->/.test(content) || /<!--\s*figure\s*-->/.test(content) || /<img\b/i.test(content);
  const hasChartPlaceholder = /<!--\s*chart\s*-->/.test(content) || /<!--\s*graph\s*-->/.test(content) || /<svg\b/.test(content);
  const chartLike = type.includes('chart') || type.includes('figure') || title.match(/\b(chart|graph|figure)\b/) || content.match(/\b(chart|graph|figure)\b/) || content.includes('chart/image file') || hasChartPlaceholder;
  const imageLike = type.includes('image') || source.metadata?.image_file || title.match(/\.(png|jpg|jpeg)$/i) || content.match(/\.(png|jpg|jpeg)/i) || hasImagePlaceholder;
  if (chartLike) return 'chart';
  if (imageLike) return 'image';
  return 'text';
};

const citationLabel = (source = {}) => {
  const title = String(source.title || '').trim();
  const content = String(source.content || source.snippet || '').trim();
  if (source.page) return String(source.page).toLowerCase().includes('page') ? source.page : `Page ${source.page}`;
  const tableMatch = title.match(/table\s*([\w.-]+)/i) || content.match(/table\s*([\w.-]+)/i);
  if (tableMatch && tableMatch[1]) return `Table ${tableMatch[1]}`;
  const graphMatch = title.match(/\b(?:graph|figure|chart)\s*([\w.-]+)/i) || content.match(/\b(?:graph|figure|chart)\s*([\w.-]+)/i);
  if (graphMatch && graphMatch[0]) return graphMatch[0].trim();
  if (source.sequence) return `Section ${source.sequence}`;
  if (/annual|report/i.test(`${title} ${source.source || ''}`)) return 'Annual Report';
  if (/financial statement/i.test(`${title} ${content}`)) return 'Financial Statement';
  const sourceName = String(source.source || '').trim();
  if (sourceName && sourceName.toLowerCase() !== 'document') return sourceName.length > 26 ? `${sourceName.slice(0, 23)}...` : sourceName;
  if (title && title.toLowerCase() !== 'document') return title.length > 26 ? `${title.slice(0, 23)}...` : title;
  if (source.marker) return source.marker;
  return 'Source';
};

const cleanEvidenceText = (text = '') => text
  .replace(/^\s*#+\s*/gm, '')
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/\[S\d+\]/g, '')
  .trim();

const parseMarkdownTable = (text = '') => {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const tableLines = lines.filter((line) => line.includes('|'));
  if (tableLines.length < 2) return null;
  const rows = tableLines
    .filter((line) => !/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(line))
    .map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cleanEvidenceText(cell)));
  if (rows.length < 2) return null;
  return { headers: rows[0], rows: rows.slice(1) };
};

const parseHtmlTable = (text = '') => {
  const html = text.replace(/\n/g, ' ');
  const tableMatch = html.match(/<table[\s\S]*?<\/table>/i);
  if (!tableMatch) return null;

  const rowMatches = Array.from(tableMatch[0].matchAll(/<tr[\s\S]*?<\/tr>/gi));
  if (!rowMatches.length) return null;

  const rows = rowMatches
    .map((rowMatch) => {
      const cellMatches = Array.from(rowMatch[0].matchAll(/<(th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi));
      return cellMatches.map(([, , cell]) => cleanEvidenceText(cell.replace(/<[^>]+>/g, '')));
    })
    .filter((row) => row.length > 0);

  if (rows.length < 2) return null;
  return { headers: rows[0], rows: rows.slice(1) };
};

const confidenceLabel = (value) => {
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0) return null;
  if (score <= 1) return `${Math.round(score * 100)}%`;
  if (score <= 100) return `${Math.round(score)}%`;
  return null;
};

const pageLabel = (page) => {
  if (!page) return null;
  return String(page).toLowerCase().includes('page') ? String(page) : `Page ${page}`;
};

const pageCountFromRange = (range) => {
  if (!range) return null;
  const [start, end] = String(range).split('-').map((value) => Number(value));
  if (!Number.isFinite(start)) return null;
  if (!Number.isFinite(end)) return start;
  return Math.max(start, end);
};

const formatEvidenceBlocks = (text = '') => text
  .split(/\n{2,}/)
  .map((block) => block.trim())
  .filter(Boolean)
  .map((block) => {
    const heading = block.match(/^(#{1,6})\s+(.+)$/);
    return heading
      ? { type: 'heading', text: cleanEvidenceText(heading[2]) }
      : { type: 'paragraph', text: cleanEvidenceText(block) };
  });

const answerSections = (text = '') => {
  const sections = ['Summary', 'Key Findings', 'Evidence', 'Sources'];
  const found = {};
  sections.forEach((section, idx) => {
    const current = new RegExp(`${section}\\s*:?`, 'i');
    const match = text.match(current);
    if (!match) return;
    const start = (match.index || 0) + match[0].length;
    const nextMatches = sections.slice(idx + 1).map((next) => {
      const nextMatch = text.slice(start).match(new RegExp(`${next}\\s*:?`, 'i'));
      return nextMatch ? start + (nextMatch.index || 0) : null;
    }).filter((value) => value !== null);
    const end = nextMatches.length ? Math.min(...nextMatches) : text.length;
    found[section] = text.slice(start, end).trim();
  });
  return Object.keys(found).length ? found : { Summary: text };
};

const IconButton = ({ title, children, className = '', style, ...props }) => (
  <button
    title={title}
    className={`group relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${className}`}
    style={style}
    {...props}
  >
    {children}
  </button>
);

const SidebarItem = ({ icon: Icon, label, collapsed, active, theme }) => (
  <button
    title={collapsed ? label : undefined}
    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
    style={{
      color: active ? theme.text : theme.secondary,
      background: active ? `${theme.accent}16` : 'transparent',
    }}
  >
    <Icon size={18} style={{ color: active ? theme.accent : theme.secondary }} />
    {!collapsed && <span className="truncate">{label}</span>}
  </button>
);

const AnswerView = ({ text, theme }) => {
  const sections = answerSections(text);
  return (
    <div className="space-y-4 text-left">
      {Object.entries(sections).map(([heading, value]) => (
        <section key={heading}>
          <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: theme.accent }}>{heading}</h3>
          <div className="space-y-1">
            {cleanEvidenceText(value).split('\n').filter(Boolean).map((line, index) => (
              <p key={`${heading}-${index}`}>{line.replace(/^\s*[-*]\s*/, '')}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

const CitationButton = ({ citation, theme, onClick }) => (
  <span className="group relative inline-flex">
    <button
      onClick={onClick}
      className="rounded-full border px-3 py-1 text-xs font-semibold"
      style={{ borderColor: `${theme.accent}35`, color: theme.accent, background: `${theme.accent}10` }}
    >
      {citation.label || citation.id}
    </button>
    <span
      className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-64 rounded-2xl border p-3 text-left text-xs shadow-xl group-hover:block"
      style={{ borderColor: theme.softBorder, background: theme.surface, color: theme.text }}
    >
      <span className="block font-semibold">{citation.title || citation.source || citation.id}</span>
      <span className="mt-1 block" style={{ color: theme.secondary }}>
        {[citation.source, pageLabel(citation.page), citation.title, citation.chunkId].filter(Boolean).join(' · ')}
      </span>
      <span className="mt-1 line-clamp-4 block leading-5" style={{ color: theme.secondary }}>{cleanEvidenceText(citation.snippet || citation.content || 'Preview unavailable.')}</span>
    </span>
  </span>
);

const SourceViewer = ({ citation, theme }) => {
  const [zoom, setZoom] = useState(1);
  const [fitToContainer, setFitToContainer] = useState(true);
  if (!citation) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center" style={{ color: theme.secondary }}>
        <FileText size={34} className="mb-3 opacity-60" />
        <p className="text-sm">Select a citation to inspect source evidence.</p>
      </div>
    );
  }

  const type = citation.type || normalizeSourceType(citation);
  const content = citation.content || citation.snippet || '';
  const table = parseMarkdownTable(content) || parseHtmlTable(content);
  const hasTable = Boolean(table);
  const imageFile = citation.metadata?.image_file;
  const imageSrc = imageFile ? `${API_BASE}/uploads/${encodeURIComponent(imageFile)}` : null;
  const confidence = confidenceLabel(citation.confidence);
  const metadata = [
    ['Document', citation.source || citation.title],
    ['Page Number', pageLabel(citation.page)],
    ['Section Name', citation.title],
    ['Chunk ID', citation.chunkId],
    ['Confidence', confidence],
    ['Type', type],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border p-4" style={{ borderColor: theme.softBorder, background: theme.card }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{citation.title || citation.source || 'Extracted Source'}</p>
            <p className="mt-1 text-xs" style={{ color: theme.secondary }}>{citation.label || citation.marker} evidence source</p>
          </div>
          {(type === 'image' || type === 'chart') && (
            <div className="flex gap-1">
              <IconButton title="Zoom out" onClick={() => setZoom((value) => Math.max(0.5, value - 0.2))} style={{ borderColor: theme.softBorder, color: theme.secondary }}><ZoomOut size={15} /></IconButton>
              <IconButton title="Zoom in" onClick={() => setZoom((value) => Math.min(2.5, value + 0.2))} style={{ borderColor: theme.softBorder, color: theme.secondary }}><ZoomIn size={15} /></IconButton>
              <IconButton title="Fit to container" onClick={() => setFitToContainer((value) => !value)} style={{ borderColor: theme.softBorder, color: theme.secondary }}><Maximize2 size={15} /></IconButton>
            </div>
          )}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2">
          {metadata.map(([key, value]) => (
            <div key={key} className="rounded-xl border px-2.5 py-2" style={{ borderColor: theme.softBorder, background: theme.surface }}>
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: theme.secondary }}>{key}</dt>
              <dd className="mt-1 truncate text-xs font-semibold">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border p-3" style={{ borderColor: theme.softBorder, background: theme.surface }}>
        {hasTable ? (
          <div className="max-h-[520px] overflow-auto">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead>
                <tr>{table.headers.map((header) => <th key={header} className="sticky top-0 border-b px-2 py-2 font-semibold" style={{ borderColor: theme.softBorder, background: theme.surface }}>{header}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`} className="border-b px-2 py-2" style={{ borderColor: theme.softBorder, color: theme.secondary }}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : imageSrc ? (
          <div className="overflow-auto rounded-2xl border" style={{ borderColor: theme.softBorder }}>
            <img
              src={imageSrc}
              alt={citation.title || 'Source image'}
              className="w-full"
              style={{
                transform: fitToContainer ? 'none' : `scale(${zoom})`,
                transformOrigin: 'top left',
                maxWidth: '100%',
              }}
            />
          </div>
        ) : type === 'chart' ? (
          <div className="space-y-3">
            <div className="h-40 rounded-xl border p-3" style={{ borderColor: theme.softBorder }}>
              <div className="flex h-full w-full items-center justify-center text-xs text-center" style={{ color: theme.secondary }}>
                Chart preview unavailable. Refer to the source caption below.
              </div>
            </div>
            <p className="text-sm leading-6" style={{ color: theme.secondary }}>{cleanEvidenceText(content)}</p>
          </div>
        ) : (
          <div className="space-y-3 text-sm leading-7" style={{ color: theme.secondary }}>
            {formatEvidenceBlocks(content).map((block, index) => (
              block.type === 'heading'
                ? <h3 key={index} className="text-sm font-semibold" style={{ color: theme.text }}>{block.text}</h3>
                : <p key={index}>{block.text}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WorkspaceGraph = ({ graphData, theme }) => {
  const [layout, setLayout] = useState('hierarchical');
  const [query, setQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [collapsed, setCollapsed] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!graphData?.nodes?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center" style={{ color: theme.secondary }}>
        <Network size={34} className="mb-3 opacity-60" />
        <p className="text-sm">Ask a question to generate a knowledge graph.</p>
      </div>
    );
  }

  const width = 860;
  const height = 620;
  const typeOrder = ['organization', 'person', 'document', 'financial entity', 'location', 'event', 'entity', 'chunk', 'other'];
  const visibleNodes = graphData.nodes.filter((node) => {
    const haystack = `${node.label || ''} ${node.entity_type || ''} ${node.node_type || ''}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    return !collapsed.has(node.entity_type || node.node_type || 'other');
  });
  const visibleIds = new Set(visibleNodes.map((node) => node.node_id));
  const visibleEdges = (graphData.edges || []).filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  const nodePositions = new Map();

  if (layout === 'hierarchical') {
    const groups = typeOrder.map((type) => visibleNodes.filter((node) => (node.entity_type || node.node_type || 'other').toLowerCase() === type)).filter(Boolean);
    groups.forEach((nodes, col) => {
      nodes.forEach((node, row) => {
        nodePositions.set(node.node_id, {
          x: 90 + col * 105,
          y: 80 + row * Math.max(56, 430 / Math.max(nodes.length, 1)),
        });
      });
    });
  } else {
    const centerX = width / 2;
    const centerY = height / 2;
    visibleNodes.forEach((node, i) => {
      const ring = 105 + Math.floor(i / 12) * 82;
      const angle = (i * 137.5 * Math.PI) / 180;
      nodePositions.set(node.node_id, {
        x: centerX + Math.cos(angle) * ring,
        y: centerY + Math.sin(angle) * ring,
      });
    });
  }

  const nodeColor = (node) => {
    const type = (node.entity_type || node.node_type || '').toLowerCase();
    if (type.includes('organization')) return '#2563EB';
    if (type.includes('person')) return '#059669';
    if (type.includes('document') || type.includes('chunk')) return '#D97706';
    if (type.includes('financial')) return '#7C3AED';
    if (type.includes('location')) return '#0891B2';
    if (type.includes('event')) return '#DC2626';
    return theme.accent;
  };

  const groups = Array.from(new Set(graphData.nodes.map((node) => node.entity_type || node.node_type || 'other'))).filter(Boolean);
  const connectedEdges = selectedNode ? (graphData.edges || []).filter((edge) => edge.source === selectedNode.node_id || edge.target === selectedNode.node_id) : [];
  const connectedEntities = connectedEdges
    .map((edge) => graphData.nodes.find((node) => node.node_id === (edge.source === selectedNode?.node_id ? edge.target : edge.source)))
    .filter(Boolean);
  const graphBody = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-2 py-1.5" style={{ borderColor: theme.softBorder }}>
          <Search size={15} style={{ color: theme.secondary }} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search node" className="min-w-0 flex-1 bg-transparent text-sm outline-none" style={{ color: theme.text }} />
        </div>
        {['hierarchical', 'force'].map((mode) => (
          <button key={mode} onClick={() => setLayout(mode)} className="rounded-xl border px-3 py-2 text-xs font-semibold capitalize" style={{ borderColor: theme.softBorder, background: layout === mode ? `${theme.accent}16` : 'transparent', color: layout === mode ? theme.accent : theme.secondary }}>
            {mode}
          </button>
        ))}
        <IconButton title="Zoom out" onClick={() => setZoom((value) => Math.max(0.45, value - 0.15))} style={{ borderColor: theme.softBorder, color: theme.secondary }}><ZoomOut size={16} /></IconButton>
        <IconButton title="Zoom in" onClick={() => setZoom((value) => Math.min(2.2, value + 0.15))} style={{ borderColor: theme.softBorder, color: theme.secondary }}><ZoomIn size={16} /></IconButton>
        <IconButton title="Fit view" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={{ borderColor: theme.softBorder, color: theme.secondary }}><Maximize2 size={16} /></IconButton>
        <IconButton title="Reset view" onClick={() => { setQuery(''); setZoom(1); setPan({ x: 0, y: 0 }); setCollapsed(new Set()); setSelectedNode(null); }} style={{ borderColor: theme.softBorder, color: theme.secondary }}><RotateCcw size={16} /></IconButton>
        <IconButton title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => setIsFullscreen((value) => !value)} style={{ borderColor: theme.softBorder, color: theme.secondary }}><Maximize2 size={16} /></IconButton>
      </div>
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setCollapsed((prev) => {
              const next = new Set(prev);
              if (next.has(group)) next.delete(group);
              else next.add(group);
              return next;
            })}
            className="rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize"
            style={{ borderColor: theme.softBorder, color: collapsed.has(group) ? theme.secondary : theme.text, opacity: collapsed.has(group) ? 0.55 : 1 }}
          >
            {group}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border" style={{ borderColor: theme.softBorder, background: theme.surface }}>
        <svg
          className="h-full w-full cursor-grab"
          viewBox={`0 0 ${width} ${height}`}
          onWheel={(event) => {
            event.preventDefault();
            setZoom((value) => Math.max(0.45, Math.min(2.2, value + (event.deltaY > 0 ? -0.08 : 0.08))));
          }}
          onMouseMove={(event) => {
            if (event.buttons !== 1) return;
            setPan((value) => ({ x: value.x + event.movementX / zoom, y: value.y + event.movementY / zoom }));
          }}
        >
          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            {visibleEdges.map((edge, i) => {
              const source = nodePositions.get(edge.source);
              const target = nodePositions.get(edge.target);
              if (!source || !target) return null;
              return <line key={`${edge.source}-${edge.target}-${i}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke={theme.accent} strokeOpacity="0.28" strokeWidth="1.5" />;
            })}
            {visibleNodes.map((node) => {
              const pos = nodePositions.get(node.node_id) || { x: 0, y: 0 };
              const label = node.label || node.node_id || 'Node';
              const active = selectedNode?.node_id === node.node_id;
              return (
                <g key={node.node_id} onClick={() => setSelectedNode(node)} className="cursor-pointer">
                  <circle cx={pos.x} cy={pos.y} r={active ? 15 : 11} fill={theme.card} stroke={nodeColor(node)} strokeWidth={active ? 3 : 2} />
                  <text x={pos.x} y={pos.y + 28} fill={theme.text} fontSize="10" textAnchor="middle" fontWeight="700">{label.length > 22 ? `${label.slice(0, 22)}...` : label}</text>
                  <text x={pos.x} y={pos.y + 42} fill={theme.secondary} fontSize="8" textAnchor="middle">{node.entity_type || node.node_type || 'entity'}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      {selectedNode && (
        <div className="rounded-2xl border p-3" style={{ borderColor: theme.softBorder, background: theme.surface }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{selectedNode.label || selectedNode.node_id}</p>
              <p className="mt-1 text-xs capitalize" style={{ color: theme.secondary }}>{selectedNode.description || selectedNode.entity_type || selectedNode.node_type || 'entity'}</p>
            </div>
            <button onClick={() => setSelectedNode(null)} style={{ color: theme.secondary }}><X size={15} /></button>
          </div>
          {selectedNode.source_documents && <p className="mt-2 text-xs leading-5" style={{ color: theme.secondary }}>Related Sources: {Array.isArray(selectedNode.source_documents) ? selectedNode.source_documents.join(', ') : selectedNode.source_documents}</p>}
          {connectedEntities.length > 0 && <p className="mt-2 text-xs leading-5" style={{ color: theme.secondary }}>Connected Entities: {connectedEntities.map((node) => node.label || node.node_id).slice(0, 8).join(', ')}</p>}
        </div>
      )}
    </>
  );

  return (
    <div
      className={`flex h-full min-h-[520px] flex-col gap-3 ${isFullscreen ? 'fixed inset-4 z-50 rounded-3xl border p-4 shadow-2xl' : ''}`}
      style={isFullscreen ? { borderColor: theme.border, background: theme.card } : undefined}
    >
      {graphBody}
    </div>
  );
};

export const DashboardWorkspace = ({ setView, session, isLightMode, setIsLightMode }) => {
  const theme = getWorkspaceTheme(isLightMode);
  const [activeTab, setActiveTab] = useState('source');
  const [activeCitation, setActiveCitation] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [docs, setDocs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [processingDetailsOpen, setProcessingDetailsOpen] = useState({});
  const [leftCollapsed, setLeftCollapsed] = useState(() => localStorage.getItem('EvidentAI-left-collapsed') === 'true');
  const [rightCollapsed, setRightCollapsed] = useState(() => {
    const stored = localStorage.getItem('EvidentAI-right-collapsed');
    if (stored) return stored === 'true';
    return window.innerWidth < 1100;
  });
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('EvidentAI-left-collapsed', String(leftCollapsed));
  }, [leftCollapsed]);

  useEffect(() => {
    localStorage.setItem('EvidentAI-right-collapsed', String(rightCollapsed));
  }, [rightCollapsed]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = '0px';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
  }, [input]);

  const activeCitationData = useMemo(() => {
    if (!activeCitation) return null;
    for (const msg of messages) {
      const found = msg.citations?.find((citation) => citation.id === activeCitation);
      if (found) return found;
    }
    return null;
  }, [activeCitation, messages]);

  const citations = useMemo(() => messages.flatMap((msg) => msg.citations || []), [messages]);

  const uploadFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    for (const file of files) {
      const Icon = getFileIcon(file.name);
      const docId = `${Date.now()}-${file.name}`;
      const newDoc = {
        id: docId,
        name: file.name,
        status: 'Uploading',
        stage: 'Uploading',
        progress: 10,
        stages: INGESTION_STAGES.map((stage, index) => ({ stage, state: index === 0 ? 'active' : 'pending' })),
        iconName: Icon.name,
      };
      setDocs((prev) => [newDoc, ...prev]);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${API_BASE}/api/ingest`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        
        if (!res.ok) {
          setDocs((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, status: data.detail ? `Error: ${data.detail}` : 'Error', progress: 100 } : doc)));
          continue;
        }

        setDocs((prev) => prev.map((doc) => (doc.id === docId ? {
          ...doc,
          status: 'Ready',
          stage: 'Ready',
          progress: 100,
          chunks: data.chunks,
          stages: INGESTION_STAGES.map((stage) => ({ stage, state: 'done' })),
        } : doc)));
      } catch (err) {
        console.error(err);
        setDocs((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, status: 'Error', progress: 100 } : doc)));
      }
    }
  }, []);
  const handleSend = async (overrideText) => {
    const query = (overrideText || input).trim();
    if (!query || isProcessing) return;

    const messageIndex = messages.length + 1;
    setMessages((prev) => [...prev, { sender: 'user', text: query }, { sender: 'ai', text: '', status: 'Connecting to document intelligence...', citations: null }]);
    setInput('');
    setIsProcessing(true);
    let hasAnswerStarted = false;
    let loadingStep = 0;
    const loadingTimer = window.setInterval(() => {
      if (hasAnswerStarted) return;
      loadingStep = Math.min(loadingStep + 1, RESPONSE_STEPS.length - 1);
      setMessages((prev) => {
        const next = [...prev];
        if (next[messageIndex]?.status) {
          next[messageIndex] = { ...next[messageIndex], status: RESPONSE_STEPS[loadingStep] };
        }
        return next;
      });
    }, 900);
    setMessages((prev) => {
      const next = [...prev];
      next[messageIndex] = { ...next[messageIndex], status: RESPONSE_STEPS[0] };
      return next;
    });

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      hasAnswerStarted = true;
      window.clearInterval(loadingTimer);
      
      const mappedCitations = (data.sources || []).map((source, i) => ({
        id: `S${i+1}`,
        label: `Source ${i+1}`,
        type: 'text',
        title: `Chunk ${i+1}`,
        snippet: source,
        content: source,
      }));

      setMessages((prev) => {
        const next = [...prev];
        next[messageIndex] = { ...next[messageIndex], text: data.answer, status: null, citations: mappedCitations };
        return next;
      });

    } catch (err) {
      console.error(err);
      window.clearInterval(loadingTimer);
      setMessages((prev) => {
        const next = [...prev];
        next[messageIndex] = { ...next[messageIndex], text: 'Failed to connect to backend.', status: null };
        return next;
      });
    } finally {
      window.clearInterval(loadingTimer);
      setIsProcessing(false);
    }
  };

  const handleWorkspaceDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    uploadFiles(event.dataTransfer.files);
  };

  const quickActions = [
    ['Analyze a Research Paper', '/analyze research paper'],
    ['Summarize a Contract', '/summary contract'],
    ['Extract Key Insights', '/extract key insights'],
    ['Build a Knowledge Graph', '/graph uploaded documents'],
  ];

  const commands = ['/summary', '/extract', '/graph', '/analyze'];
  const recentDocs = docs.slice(0, 5);

  const renderDocIcon = (name) => {
    const Icon = getFileIcon(name);
    return <Icon size={16} />;
  };

  return (
    <div
      className="relative flex h-screen w-full overflow-hidden font-sans"
      style={{ background: theme.bg, color: theme.text }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setIsDragging(false);
      }}
      onDrop={handleWorkspaceDrop}
    >
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.12]">
        <DotField
          glowColor={theme.bg}
          gradientFrom={theme.dotFrom}
          gradientTo={theme.dotTo}
          dotRadius={1.35}
          dotSpacing={22}
          cursorRadius={300}
          cursorForce={0.03}
          bulgeStrength={18}
        />
      </div>

      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-3 z-50 flex items-center justify-center rounded-[28px] border border-dashed backdrop-blur-sm"
            style={{ borderColor: theme.accent, background: `${theme.bg}CC`, color: theme.text }}
          >
            <div className="text-center">
              <UploadCloud size={34} className="mx-auto mb-3" style={{ color: theme.accent }} />
              <p className="text-lg font-semibold">Drop files to add them to this workspace</p>
              <p className="mt-1 text-sm" style={{ color: theme.secondary }}>PDF, DOCX, images, spreadsheets, CSV, TXT, and PPTX</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: leftCollapsed ? 56 : 280 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex shrink-0 flex-col border-r"
        style={{ background: theme.surface, borderColor: theme.border }}
      >
        <div className="flex h-16 items-center justify-between px-3">
          <button onClick={() => setView('landing')} className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${theme.accent}16`, color: theme.accent }}>
              <BrainCircuit size={19} />
            </span>
            {!leftCollapsed && <span className="truncate text-sm font-semibold">EvidentAI</span>}
          </button>
          {!leftCollapsed && (
            <IconButton
              title="Collapse sidebar"
              onClick={() => setLeftCollapsed(true)}
              style={{ borderColor: theme.softBorder, color: theme.secondary }}
            >
              <PanelLeftClose size={17} />
            </IconButton>
          )}
        </div>

        {leftCollapsed && (
          <button
            title="Expand sidebar"
            onClick={() => setLeftCollapsed(false)}
            className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-xl border"
            style={{ borderColor: theme.softBorder, color: theme.secondary }}
          >
            <PanelLeftOpen size={17} />
          </button>
        )}

        <div className="space-y-1 px-2">
          <SidebarItem icon={LayoutDashboard} label="Workspace" collapsed={leftCollapsed} active theme={theme} />
          <SidebarItem icon={Search} label="Recent Documents" collapsed={leftCollapsed} theme={theme} />
          <SidebarItem icon={Archive} label="Upload History" collapsed={leftCollapsed} theme={theme} />
          <SidebarItem icon={BookOpen} label="Knowledge Library" collapsed={leftCollapsed} theme={theme} />
        </div>

        {!leftCollapsed && (
          <>
            <div className="mt-6 px-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: theme.secondary }}>Recent</p>
                <button onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold" style={{ color: theme.accent }}>Upload</button>
              </div>
              <div className="space-y-2">
                {recentDocs.length === 0 ? (
                  <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: theme.softBorder, color: theme.secondary, background: theme.card }}>
                    No documents yet.
                  </div>
                ) : recentDocs.map((doc) => (
                  <div key={doc.id} className="rounded-2xl border p-3" style={{ borderColor: theme.softBorder, background: theme.card }}>
                    <div className="flex items-center gap-3">
                      <span style={{ color: theme.accent }}>{renderDocIcon(doc.name)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: theme.secondary }}>
                          {doc.status === 'Ready' ? <CheckCircle2 size={12} style={{ color: theme.accent }} /> : doc.status === 'Error' || doc.status?.startsWith('Error') ? <X size={12} /> : <Loader2 size={12} className="animate-spin" />}
                          {doc.status}
                        </div>
                      </div>
                    </div>
                    {doc.status !== 'Ready' && !doc.status?.startsWith('Error') && (
                      <div className="mt-3 h-1 overflow-hidden rounded-full" style={{ background: `${theme.accent}18` }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${doc.progress || 0}%`, background: theme.accent }} />
                      </div>
                    )}
                    {doc.status === 'Ready' ? (
                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold" style={{ color: theme.accent }}>
                        <CheckCircle2 size={13} /> Ready
                      </div>
                    ) : null}
                    {(doc.pages || doc.chunks || doc.nodes || doc.edges) && (
                      <div className="mt-3 grid grid-cols-2 gap-1 text-[10px]" style={{ color: theme.secondary }}>
                        <span>Pages: {doc.pages || 0}</span>
                        <span>Chunks: {doc.indexed || doc.chunks || 0}</span>
                        <span>Entities: {doc.entities || doc.nodes || 0}</span>
                        <span>Relationships: {doc.edges || 0}</span>
                      </div>
                    )}
                    {doc.stages?.length > 0 && doc.status === 'Ready' && (
                      <button
                        onClick={() => setProcessingDetailsOpen((prev) => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                        className="mt-3 text-[11px] font-semibold"
                        style={{ color: theme.secondary }}
                      >
                        {processingDetailsOpen[doc.id] ? '▼' : '▶'} Processing Details
                      </button>
                    )}
                    {doc.stages?.length > 0 && (doc.status !== 'Ready' || processingDetailsOpen[doc.id]) && (
                      <div className="mt-3 space-y-1.5">
                        {doc.stages.map((item) => (
                          <div key={item.stage} className="flex items-center gap-2 text-[11px]" style={{ color: item.state === 'pending' ? theme.secondary : theme.text }}>
                            {item.state === 'done' ? <CheckCircle2 size={11} style={{ color: theme.accent }} /> : item.state === 'active' ? <Loader2 size={11} className="animate-spin" style={{ color: theme.accent }} /> : <span className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: theme.softBorder }} />}
                            <span>{item.stage}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t p-4" style={{ borderColor: theme.softBorder }}>
              <div className="flex items-center gap-3 rounded-2xl border p-3" style={{ borderColor: theme.softBorder, background: theme.card }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold" style={{ background: `${theme.accent}18`, color: theme.accent }}>
                  {(session?.user?.email || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">Analyst User</p>
                  <p className="truncate text-xs" style={{ color: theme.secondary }}>{session?.user?.email || 'analyst@enterprise.com'}</p>
                </div>
                <button
                  title="Log out"
                  onClick={async () => {
                    if (supabase) await supabase.auth.signOut();
                    setView('landing');
                  }}
                  style={{ color: theme.secondary }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.aside>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-5" style={{ borderColor: theme.border, background: `${theme.bg}E6` }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold">Document Intelligence Workspace</h1>
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${theme.accent}14`, color: theme.accent }}>Reasoning</span>
            </div>
            <p className="mt-0.5 text-xs" style={{ color: theme.secondary }}>Upload, ask, cite, and map evidence in one flow.</p>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              title="Toggle theme"
              onClick={() => setIsLightMode(!isLightMode)}
              style={{ borderColor: theme.softBorder, color: theme.secondary, background: theme.surface }}
            >
              {isLightMode ? <Moon size={17} /> : <Sun size={17} />}
            </IconButton>
            <IconButton
              title="Home"
              onClick={() => setView('landing')}
              style={{ borderColor: theme.softBorder, color: theme.secondary, background: theme.surface }}
            >
              <Home size={17} />
            </IconButton>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden px-5">
            <div className="flex-1 overflow-y-auto py-8">
              {messages.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-full items-center justify-center">
                  <div className="w-full max-w-2xl text-center">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${theme.accent}14`, color: theme.accent }}>
                      <Sparkles size={26} />
                    </div>
                    <h2 className="text-3xl font-semibold tracking-tight">What would you like to understand?</h2>
                    <p className="mx-auto mt-3 max-w-xl text-base leading-7" style={{ color: theme.secondary }}>
                      Upload documents or start with a command. EvidentAI will connect sources, citations, and reasoning as the conversation develops.
                    </p>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {quickActions.map(([label, command]) => (
                        <button
                          key={label}
                          onClick={() => setInput(command)}
                          className="rounded-2xl border p-4 text-left text-sm font-semibold transition-transform hover:-translate-y-0.5"
                          style={{ borderColor: theme.softBorder, background: theme.surface, color: theme.text }}
                        >
                          {label}
                          <p className="mt-1 text-xs font-medium" style={{ color: theme.secondary }}>{command}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[82%] ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: theme.secondary }}>
                          {msg.sender === 'user' ? 'You' : 'EvidentAI'}
                        </div>
                        <div
                          className="rounded-3xl border px-5 py-4 text-[15px] leading-7 shadow-sm"
                          style={{
                            background: msg.sender === 'user' ? `${theme.accent}18` : theme.surface,
                            borderColor: msg.sender === 'user' ? `${theme.accent}40` : theme.softBorder,
                            color: theme.text,
                          }}
                        >
                          {msg.status ? (
                            <div className="flex items-center gap-2" style={{ color: theme.secondary }}>
                              <Loader2 size={16} className="animate-spin" style={{ color: theme.accent }} />
                              <AnimatePresence mode="wait">
                                <motion.span
                                  key={msg.status}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  transition={{ duration: 0.18 }}
                                >
                                  {msg.status}
                                </motion.span>
                              </AnimatePresence>
                            </div>
                          ) : msg.sender === 'ai' ? <AnswerView text={msg.text} theme={theme} /> : msg.text}
                          {msg.citations?.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: theme.softBorder }}>
                              {msg.citations.map((citation) => (
                                <CitationButton
                                  key={citation.id}
                                  citation={citation}
                                  theme={theme}
                                  onClick={() => {
                                    setActiveCitation(citation.id);
                                    setActiveTab('source');
                                    setRightCollapsed(false);
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="pb-5">
              {docs.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {docs.slice(0, 6).map((doc) => (
                    <span key={doc.id} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: theme.softBorder, background: theme.surface, color: theme.text }}>
                      <span style={{ color: theme.accent }}>{renderDocIcon(doc.name)}</span>
                      {shortName(doc.name)}
                      {doc.status !== 'Ready' && !doc.status?.startsWith('Error') && <Loader2 size={12} className="animate-spin" style={{ color: theme.accent }} />}
                      <button onClick={() => setDocs((prev) => prev.filter((docItem) => docItem.id !== doc.id))} style={{ color: theme.secondary }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <SpotlightCard className="rounded-[26px] border shadow-xl shadow-black/5" style={{ borderColor: theme.border, background: theme.surface }}>
                <div className="p-3">
                  <div className="mb-2 flex flex-wrap gap-2 px-2">
                    {commands.map((command) => (
                      <button
                        key={command}
                        onClick={() => setInput(command)}
                        className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
                        style={{ borderColor: theme.softBorder, color: theme.secondary }}
                      >
                        {command}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-1 flex h-10 shrink-0 items-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition-colors"
                      style={{ borderColor: `${theme.accent}38`, color: theme.accent, background: `${theme.accent}10` }}
                    >
                      <Plus size={17} /> Upload
                    </button>
                    <textarea
                      ref={textareaRef}
                      value={input}
                      rows={1}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Ask anything about your documents... Use /commands or @mentions"
                      className="max-h-[180px] min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-[15px] outline-none"
                      style={{ color: theme.text }}
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isProcessing}
                      className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-opacity disabled:opacity-45"
                      style={{ background: theme.accent, color: isLightMode ? '#FFFFFF' : '#0B0B0C' }}
                    >
                      {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={17} />}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_TYPES}
                    className="hidden"
                    onChange={(event) => {
                      uploadFiles(event.target.files);
                      event.target.value = '';
                    }}
                  />
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>
      </main>

      <motion.aside
        animate={{ width: rightCollapsed ? 56 : 320 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex shrink-0 flex-col border-l"
        style={{ background: theme.surface, borderColor: theme.border }}
      >
        <div className="flex h-16 items-center justify-between px-3">
          {!rightCollapsed && <p className="text-sm font-semibold">Context</p>}
          <IconButton
            title={rightCollapsed ? 'Expand context panel' : 'Collapse context panel'}
            onClick={() => setRightCollapsed(!rightCollapsed)}
            style={{ borderColor: theme.softBorder, color: theme.secondary }}
          >
            {rightCollapsed ? <PanelRightOpen size={17} /> : <PanelRightClose size={17} />}
          </IconButton>
        </div>

        {rightCollapsed ? (
          <div className="flex flex-col items-center gap-2 px-2">
            {[
              ['source', FileText, 'Source Viewer'],
              ['graph', GitBranch, 'Knowledge Graph'],
              ['citations', MessageSquare, 'Citations'],
            ].map(([tab, Icon, label]) => (
              <button
                key={tab}
                title={label}
                onClick={() => {
                  setActiveTab(tab);
                  setRightCollapsed(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border"
                style={{ borderColor: activeTab === tab ? `${theme.accent}50` : theme.softBorder, color: activeTab === tab ? theme.accent : theme.secondary }}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1 px-3 pb-3">
              {[
                ['source', FileText, 'Source'],
                ['graph', GitBranch, 'Graph'],
                ['citations', MessageSquare, 'Citations'],
              ].map(([tab, Icon, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="rounded-xl px-2 py-2 text-xs font-semibold transition-colors"
                  style={{ background: activeTab === tab ? `${theme.accent}16` : 'transparent', color: activeTab === tab ? theme.accent : theme.secondary }}
                >
                  <Icon size={15} className="mx-auto mb-1" />
                  {label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <AnimatePresence mode="wait">
                {activeTab === 'source' && (
                  <motion.div key="source" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="h-full">
                    <SourceViewer citation={activeCitationData} theme={theme} />
                  </motion.div>
                )}

                {activeTab === 'graph' && (
                  <motion.div key="graph" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="h-full rounded-3xl border p-3" style={{ borderColor: theme.softBorder, background: theme.card }}>
                    <WorkspaceGraph graphData={graphData} theme={theme} />
                  </motion.div>
                )}

                {activeTab === 'citations' && (
                  <motion.div key="citations" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-2">
                    {citations.length === 0 ? (
                      <div className="flex min-h-[360px] flex-col items-center justify-center text-center" style={{ color: theme.secondary }}>
                        <MessageSquare size={34} className="mb-3 opacity-60" />
                        <p className="text-sm">Citations will appear after grounded answers.</p>
                      </div>
                    ) : citations.map((citation) => (
                      <button
                        key={citation.id}
                        onClick={() => {
                          setActiveCitation(citation.id);
                          setActiveTab('source');
                        }}
                        className="w-full rounded-2xl border p-3 text-left"
                        style={{ borderColor: theme.softBorder, background: theme.card }}
                      >
                        <p className="text-sm font-semibold">{citation.title || citation.id}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5" style={{ color: theme.secondary }}>{citation.snippet || 'Source excerpt available.'}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.aside>
    </div>
  );
};
