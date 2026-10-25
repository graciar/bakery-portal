import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { SubmissionsTable } from '../components/SubmissionsTable'
import type { Submission } from '../types'
import { getSubmissions, type GetSubmissionsParams } from '../services/apiService'

export interface SubmissionsPageProps {
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void
}

export const SubmissionsPage: FC<SubmissionsPageProps> = ({ onNotify }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  const loadSubmissions = useCallback(
    async (params?: GetSubmissionsParams) => {
      setLoading(true)
      try {
        const data = await getSubmissions(params)
        setSubmissions(data)
      } catch (err: any) {
        console.error('Failed to load submissions', err)
        onNotify('error', 'Submissions Sync Failed', 'Could not fetch submitted records.')
      } finally {
        setLoading(false)
      }
    },
    [onNotify]
  )

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Submissions Table Component (API Search & Filter Driven) */}
        <SubmissionsTable
          submissions={submissions}
          loading={loading}
          onFetch={loadSubmissions}
          onNotify={onNotify}
        />
      </div>
    </div>
  )
}

export default SubmissionsPage