import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'

interface Props { workspaceId: string; onClose: () => void }

export default function InviteMemberModal({ workspaceId, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post(`/members/workspace/${workspaceId}/invite`, { email, role }),
    onSuccess: () => { toast.success(`Invite sent to ${email}`); onClose() },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to send invite')
  })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-dark-200 animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Invite Member</h2>
            <p className="text-sm text-gray-400 mt-0.5">Send an invite link via email</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full border border-gray-200 dark:border-dark-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-200 dark:border-dark-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="MEMBER">Member — can create and edit tasks</option>
              <option value="ADMIN">Admin — can manage members</option>
              <option value="VIEWER">Viewer — read only</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 dark:border-dark-200 text-gray-600 dark:text-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-200 transition">
            Cancel
          </button>
          <button
            onClick={() => mutate()}
            disabled={isPending || !email}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {isPending ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  )
}