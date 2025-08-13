'use client'

import GroupPageClient from "@/components/ui/GroupPageClient";
import { use } from 'react';

export default function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params); 

  return <GroupPageClient groupId={groupId} />;
}
