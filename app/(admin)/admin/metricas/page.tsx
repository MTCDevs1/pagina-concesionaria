export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getDashboardMetrics } from '@/lib/db/metrics'

// La métrica completa vive en el dashboard — redirigir
export default async function MetricasPage() {
  const metrics = await getDashboardMetrics()
  void metrics
  redirect('/admin')
}
