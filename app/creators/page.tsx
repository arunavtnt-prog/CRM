'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreatorFormModal } from '@/components/creators/creator-form-modal';

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState(null);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/creators?${params}`);
      const data = await response.json();
      setCreators(data);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this creator?')) return;

    try {
      await fetch(`/api/creators/${id}`, { method: 'DELETE' });
      fetchCreators();
    } catch (error) {
      console.error('Error deleting creator:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: 'success',
      INACTIVE: 'secondary',
      PENDING: 'outline',
      ARCHIVED: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Creators</h1>
            <p className="text-muted-foreground">
              Manage your creators and influencers
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingCreator(null);
              setModalOpen(true);
            }}
          >
            + Create Creator
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading creators...
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No creators found. Create your first creator to get started.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Social Handles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((creator) => (
                  <TableRow key={creator.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{creator.name}</p>
                        {creator.email && (
                          <p className="text-sm text-muted-foreground">
                            {creator.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {creator.instagramHandle && (
                          <div>📷 {creator.instagramHandle}</div>
                        )}
                        {creator.tiktokHandle && (
                          <div>🎵 {creator.tiktokHandle}</div>
                        )}
                        {creator.youtubeHandle && (
                          <div>📺 {creator.youtubeHandle}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(creator.status)}</TableCell>
                    <TableCell>{creator.deals?.length || 0}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {creator.owner?.name || creator.owner?.email || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCreator(creator);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(creator.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CreatorFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        creator={editingCreator}
      />
    </AppLayout>
  );
}
