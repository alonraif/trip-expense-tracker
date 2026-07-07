import { Badge } from '@/components/ui/badge';
import { AddMemberForm } from '@/components/add-member-form';
import { RemoveMemberButton } from '@/components/remove-member-button';
import { EmptyStateIllustration } from '@/components/illustrations/empty-state';
import { createClient } from '@/lib/supabase/server';

export default async function MembersPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const supabase = await createClient();

  const [{ data: members }, { data: expenses }] = await Promise.all([
    supabase
      .from('trip_members')
      .select('id, name')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true }),
    supabase.from('expenses').select('payer_id').eq('trip_id', tripId),
  ]);

  const payerIds = new Set(expenses?.map((e) => e.payer_id));

  return (
    <div className="flex flex-col gap-4">
      <AddMemberForm tripId={tripId} />

      {!members?.length ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <EmptyStateIllustration className="size-28" />
          <p className="text-sm text-muted-foreground">
            No members yet. Add everyone on the trip so expenses can be split.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <Badge variant="secondary">{member.name}</Badge>
              {!payerIds.has(member.id) ? (
                <RemoveMemberButton tripId={tripId} memberId={member.id} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
