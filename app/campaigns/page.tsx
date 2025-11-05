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
import { CampaignFormModal } from '@/components/campaigns/campaign-form-modal';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';
import { convertToCSV, downloadCSV, formatDateForCSV, formatCurrencyForCSV, CSVColumn } from '@/lib/utils/csv';

export default function CampaignsPage() {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/campaigns?${params}`);
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      showToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [search, statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${title}"?`)) return;

    try {
      const response = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      showToast('Campaign deleted successfully', 'success');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      showToast('Failed to delete campaign', 'error');
    }
  };

  const handleExportCSV = () => {
    const columns: CSVColumn[] = [
      { key: 'title', header: 'Campaign Title' },
      { key: 'brand', header: 'Brand' },
      { key: 'description', header: 'Description' },
      { key: 'startDate', header: 'Start Date', formatter: formatDateForCSV },
      { key: 'endDate', header: 'End Date', formatter: formatDateForCSV },
      { key: 'budget', header: 'Budget', formatter: formatCurrencyForCSV },
      { key: 'status', header: 'Status' },
      { key: '_count.deals', header: 'Deals Count', formatter: (count) => count || '0' },
    ];

    const csvContent = convertToCSV(campaigns, columns);
    const filename = `campaigns-export-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PLANNING: 'outline',
      ACTIVE: 'success',
      COMPLETED: 'secondary',
      CANCELLED: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage your marketing campaigns and brand partnerships
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={campaigns.length === 0}
            >
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setEditingCampaign(null);
                setModalOpen(true);
              }}
            >
              + Create Campaign
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search campaigns..."
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
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No campaigns found. Create your first campaign to get started.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{campaign.title}</p>
                        {campaign.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {campaign.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{campaign.brand}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(campaign.startDate)}</div>
                        <div className="text-muted-foreground">
                          to {formatDate(campaign.endDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(campaign.budget)}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="text-primary hover:underline"
                      >
                        {campaign._count?.deals || 0} deals
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCampaign(campaign);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(campaign.id, campaign.title)}
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

      <CampaignFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        campaign={editingCampaign}
      />
    </AppLayout>
  );
}
