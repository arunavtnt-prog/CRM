'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';

interface DealFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: any;
}

export function DealFormModal({
  open,
  onOpenChange,
  deal,
}: DealFormModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    campaignId: deal?.campaignId || '',
    creatorId: deal?.creatorId || '',
    value: deal?.value || '',
    status: deal?.status || 'PENDING',
    signedAt: deal?.signedAt ? new Date(deal.signedAt).toISOString().split('T')[0] : '',
    notes: deal?.notes || '',
  });

  // Fetch campaigns and creators for dropdowns
  useEffect(() => {
    if (open) {
      Promise.all([
        fetch('/api/campaigns').then(r => r.json()),
        fetch('/api/creators').then(r => r.json()),
      ]).then(([campaignsData, creatorsData]) => {
        setCampaigns(campaignsData);
        setCreators(creatorsData);
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = deal
        ? `/api/deals/${deal.id}`
        : '/api/deals';
      const method = deal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save deal');
      }

      showToast(
        deal ? 'Deal updated successfully' : 'Deal created successfully',
        'success'
      );

      router.refresh();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {deal ? 'Edit Deal' : 'Create New Deal'}
          </DialogTitle>
          <DialogDescription>
            {deal
              ? 'Update the deal information below.'
              : 'Create a new deal between a campaign and a creator.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaignId">
                Campaign <span className="text-destructive">*</span>
              </Label>
              <select
                id="campaignId"
                value={formData.campaignId}
                onChange={(e) =>
                  setFormData({ ...formData, campaignId: e.target.value })
                }
                required
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select campaign...</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title} - {campaign.brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorId">
                Creator <span className="text-destructive">*</span>
              </Label>
              <select
                id="creatorId"
                value={formData.creatorId}
                onChange={(e) =>
                  setFormData({ ...formData, creatorId: e.target.value })
                }
                required
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select creator...</option>
                {creators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">
                Deal Value ($) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                required
                disabled={loading}
                placeholder="5000.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="PENDING">Pending</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="SIGNED">Signed</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signedAt">Signed Date</Label>
            <Input
              id="signedAt"
              type="date"
              value={formData.signedAt}
              onChange={(e) =>
                setFormData({ ...formData, signedAt: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={loading}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Additional notes about the deal..."
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : deal ? 'Update Deal' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
