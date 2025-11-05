'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DealFormModal } from '@/components/deals/deal-form-modal';
import { useToast } from '@/components/ui/toast';
import { convertToCSV, downloadCSV, formatDateForCSV, formatCurrencyForCSV, CSVColumn } from '@/lib/utils/csv';

export default function DealsPage() {
  const { showToast } = useToast();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/deals?${params}`);
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
      showToast('Failed to load deals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      const response = await fetch(`/api/deals/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete deal');
      }

      showToast('Deal deleted successfully', 'success');
      fetchDeals();
    } catch (error) {
      console.error('Error deleting deal:', error);
      showToast('Failed to delete deal', 'error');
    }
  };

  const handleExportCSV = () => {
    const columns: CSVColumn[] = [
      { key: 'creator.name', header: 'Creator Name' },
      { key: 'creator.email', header: 'Creator Email' },
      { key: 'campaign.title', header: 'Campaign Title' },
      { key: 'campaign.brand', header: 'Brand' },
      { key: 'value', header: 'Deal Value', formatter: formatCurrencyForCSV },
      { key: 'status', header: 'Status' },
      { key: 'signedAt', header: 'Signed Date', formatter: formatDateForCSV },
      { key: 'createdAt', header: 'Created Date', formatter: formatDateForCSV },
      { key: 'notes', header: 'Notes' },
    ];

    const csvContent = convertToCSV(deals, columns);
    const filename = `deals-export-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: 'outline',
      NEGOTIATING: 'secondary',
      SIGNED: 'success',
      ACTIVE: 'success',
      COMPLETED: 'secondary',
      CANCELLED: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Deals</h1>
            <p className="text-muted-foreground">
              Manage deals and agreements between campaigns and creators
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={deals.length === 0}
            >
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setEditingDeal(null);
                setModalOpen(true);
              }}
            >
              + Create Deal
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="NEGOTIATING">Negotiating</option>
            <option value="SIGNED">Signed</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading deals...
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No deals found. Create your first deal to get started.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signed Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deal.creator.name}</p>
                        {deal.creator.email && (
                          <p className="text-sm text-muted-foreground">
                            {deal.creator.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deal.campaign.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {deal.campaign.brand}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(deal.value)}
                    </TableCell>
                    <TableCell>{getStatusBadge(deal.status)}</TableCell>
                    <TableCell>{formatDate(deal.signedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingDeal(deal);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(deal.id)}
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

      <DealFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        deal={editingDeal}
      />
    </AppLayout>
  );
}
