import { useState } from 'react';
import { FileText, LayoutGrid, List, Upload, Trash2 } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentTable } from '@/components/documents/DocumentTable';
import type { DocRecord } from '@/types';

export function MyDocuments() {
  const { docs, navigate, renameDoc, deleteDoc, toast } = useApp();
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const [renameTarget, setRenameTarget] = useState<DocRecord | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DocRecord | null>(null);

  let filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase()),
  );
  if (statusFilter !== 'all') filtered = filtered.filter((d) => d.status === statusFilter);
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
    if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const confirmRename = () => {
    if (renameTarget && renameValue.trim()) {
      renameDoc(renameTarget.id, renameValue.trim());
      toast({ title: 'Document renamed', variant: 'success' });
    }
    setRenameTarget(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteDoc(deleteTarget.id);
      toast({ title: 'Document deleted', description: deleteTarget.name, variant: 'success' });
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">My Documents</h1>
        <p className="text-[14px] text-slate-400">{docs.length} documents · {docs.filter((d) => d.hasAudio).length} with audio</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search documents…" className="flex-1" />
        <div className="flex items-center gap-2">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'ready', label: 'Ready' },
              { value: 'processing', label: 'Processing' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
          <FilterDropdown
            label="Sort"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'date-desc', label: 'Newest first' },
              { value: 'date-asc', label: 'Oldest first' },
              { value: 'name-asc', label: 'Name A-Z' },
              { value: 'name-desc', label: 'Name Z-A' },
            ]}
          />
          <div className="flex items-center rounded-xl border border-white/5 bg-ink-800 p-0.5">
            <button
              onClick={() => setView('list')}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${view === 'list' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-500 hover:text-white'}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${view === 'grid' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-500 hover:text-white'}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText size={28} />}
            title={search || statusFilter !== 'all' ? 'No matching documents' : 'No documents yet'}
            description={search || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Upload your first PDF to start learning.'}
            action={<Button onClick={() => navigate('create')} leftIcon={<Upload size={16} />}>Upload PDF</Button>}
          />
        </Card>
      ) : view === 'list' ? (
        <DocumentTable
          docs={filtered}
          onRename={(doc) => { setRenameTarget(doc); setRenameValue(doc.name); }}
          onDelete={(doc) => setDeleteTarget(doc)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onRename={() => { setRenameTarget(doc); setRenameValue(doc.name); }}
              onDelete={() => setDeleteTarget(doc)}
            />
          ))}
        </div>
      )}

      {/* Rename modal */}
      <Modal
        open={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title="Rename Document"
        description="Enter a new name for your document."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={confirmRename}>Save</Button>
          </>
        }
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-800 p-3">
          <FileText size={18} className="text-brand-300" />
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-white focus:outline-none"
            autoFocus
          />
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Document?"
        description={deleteTarget ? `"${deleteTarget.name}" will be permanently deleted. This cannot be undone.` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} leftIcon={<Trash2 size={15} />}>Delete</Button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-xl border border-bad-500/20 bg-bad-500/5 p-3">
          <Trash2 size={18} className="mt-0.5 shrink-0 text-bad-400" />
          <p className="text-[13px] text-slate-300">
            Any generated audio for this document will also be removed from your library.
          </p>
        </div>
      </Modal>
    </div>
  );
}
