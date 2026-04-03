export const dynamic = 'force-dynamic'

import AvailabilityManager from '@/components/admin/AvailabilityManager'

export default function DisponibilidadPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6">Mi disponibilidad</h1>
      <AvailabilityManager />
    </div>
  )
}
