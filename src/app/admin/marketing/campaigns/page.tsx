import { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminPageHeader from '@/components/admin/page-header';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campaigns — Admin',
};

type Campaign = {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'scheduled' | 'active' | 'ended' | 'archived';
  featured: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

const statusConfig: Record<
  Campaign['status'],
  { label: string; classes: string }
> = {
  draft: {
    label: 'Draft',
    classes: 'bg-gray-100 text-gray-700',
  },
  scheduled: {
    label: 'Scheduled',
    classes: 'bg-amber-100 text-amber-700',
  },
  active: {
    label: 'Active',
    classes: 'bg-emerald-100 text-emerald-700',
  },
  ended: {
    label: 'Ended',
    classes: 'bg-slate-100 text-slate-600',
  },
  archived: {
    label: 'Archived',
    classes: 'bg-red-100 text-red-700',
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function CampaignsPage() {
  const supabase = createAdminClient();

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  const allCampaigns: Campaign[] = campaigns ?? [];

  const totalCount = allCampaigns.length;
  const activeCount = allCampaigns.filter((c) => c.status === 'active').length;
  const featuredCount = allCampaigns.filter((c) => c.featured).length;
  const endedCount = allCampaigns.filter((c) => c.status === 'ended').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <AdminPageHeader
          title="Campaigns"
          description="Manage marketing campaigns, competitions, and promotions"
        />
        <Link
          href="/admin/marketing/campaigns/new"
          className="shrink-0 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{totalCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Active</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Featured</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{featuredCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Ended</p>
          <p className="mt-1 text-2xl font-semibold text-slate-500">{endedCount}</p>
        </div>
      </div>

      {/* Campaigns table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
            Failed to load campaigns: {error.message}
          </div>
        )}

        {allCampaigns.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-900">No campaigns yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first marketing campaign.
            </p>
            <Link
              href="/admin/marketing/campaigns/new"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              New Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Campaign
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Start Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    End Date
                  </th>
                  <th scope="col" className="relative px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {allCampaigns.map((campaign) => {
                  const status = statusConfig[campaign.status] ?? statusConfig.draft;
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.classes}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {campaign.title}
                          </span>
                          {campaign.featured && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 capitalize">
                        {campaign.type ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {formatDate(campaign.start_date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {formatDate(campaign.end_date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Link
                          href={`/admin/marketing/campaigns/${campaign.id}/edit`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
