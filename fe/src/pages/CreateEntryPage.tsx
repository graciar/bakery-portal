import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SubmissionForm } from '../components/SubmissionForm'
import type { Store } from '../types'
import { getStores } from '../services/apiService'
import { Croissant, Sparkles } from 'lucide-react'

export interface CreateEntryPageProps {
  onNotify: (type: 'success' | 'error', title: string, message?: string) => void
}

export const CreateEntryPage: FC<CreateEntryPageProps> = ({ onNotify }) => {
  const navigate = useNavigate()
  const [stores, setStores] = useState<Store[]>([])
  const [loadingStores, setLoadingStores] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoadingStores(true)
    getStores()
      .then((data) => {
        if (isMounted) setStores(data)
      })
      .catch((err) => {
        console.error('Failed to load stores', err)
        if (isMounted) {
          onNotify('error', 'Store Connection Issue', 'Could not load stores from backend.')
        }
      })
      .finally(() => {
        if (isMounted) setLoadingStores(false)
      })

    return () => {
      isMounted = false
    }
  }, [onNotify])

  const handleEntrySuccess = () => {
    navigate('/submissions')
  }

  return (
    <div className="py-8 sm:py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Page Top Heading */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Retail Data Entry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Data Input Form
          </h1>
        </div>

        {/* Centered Elevated Form Card */}
        <SubmissionForm
          stores={stores}
          loadingStores={loadingStores}
          onSuccess={handleEntrySuccess}
          onNotify={onNotify}
        />

        {/* Brand footer note */}
        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Croissant className="w-4 h-4 text-amber-500" />
          <span>Innocean Bakery © 2026</span>
        </div>
      </div>
    </div>
  )
}

export default CreateEntryPage