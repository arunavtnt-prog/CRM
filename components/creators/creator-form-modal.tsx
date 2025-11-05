'use client';

import { useState } from 'react';
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

interface CreatorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator?: any;
}

export function CreatorFormModal({
  open,
  onOpenChange,
  creator,
}: CreatorFormModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: creator?.name || '',
    email: creator?.email || '',
    phone: creator?.phone || '',
    instagramHandle: creator?.instagramHandle || '',
    tiktokHandle: creator?.tiktokHandle || '',
    youtubeHandle: creator?.youtubeHandle || '',
    twitterHandle: creator?.twitterHandle || '',
    status: creator?.status || 'ACTIVE',
    notes: creator?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = creator
        ? `/api/creators/${creator.id}`
        : '/api/creators';
      const method = creator ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save creator');
      }

      router.refresh();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {creator ? 'Edit Creator' : 'Create New Creator'}
          </DialogTitle>
          <DialogDescription>
            {creator
              ? 'Update the creator information below.'
              : 'Add a new creator to the system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={loading}
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Social Handles</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-sm text-muted-foreground">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="@username"
                  value={formData.instagramHandle}
                  onChange={(e) =>
                    setFormData({ ...formData, instagramHandle: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok" className="text-sm text-muted-foreground">
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  placeholder="@username"
                  value={formData.tiktokHandle}
                  onChange={(e) =>
                    setFormData({ ...formData, tiktokHandle: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="text-sm text-muted-foreground">
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  placeholder="@channel"
                  value={formData.youtubeHandle}
                  onChange={(e) =>
                    setFormData({ ...formData, youtubeHandle: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-sm text-muted-foreground">
                  Twitter/X
                </Label>
                <Input
                  id="twitter"
                  placeholder="@username"
                  value={formData.twitterHandle}
                  onChange={(e) =>
                    setFormData({ ...formData, twitterHandle: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
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
              {loading ? 'Saving...' : creator ? 'Update Creator' : 'Create Creator'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
