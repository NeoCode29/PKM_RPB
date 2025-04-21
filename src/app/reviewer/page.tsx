import { headers } from 'next/headers';
import ReviewerDashboardContent from './ReviewerDashboardContent';

export default async function ReviewerDashboard() {
  const headersList = await headers();
  const userId = headersList.has('pkm-user-id') ? headersList.get('pkm-user-id') as string : '';

  return <ReviewerDashboardContent userId={userId} />;
}
  