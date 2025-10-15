import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'
import { CheckCircle, XCircle, Clock, Send, Loader2 } from 'lucide-react'

export function RemindersPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<any>(null)

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*, employees(name_en, name_ar, email)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const handleSendReminders = async () => {
    setIsSending(true)
    setSendResult(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reminders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      )

      const result = await response.json()
      setSendResult(result)
      
      // Refresh the reminders list
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    } catch (error) {
      console.error('Error sending reminders:', error)
      setSendResult({ error: 'Failed to send reminders' })
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return <div>{t('common.loading')}</div>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('reminders.title')}</h1>
        <Button 
          onClick={handleSendReminders} 
          disabled={isSending}
          className="gap-2"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Reminders Now
            </>
          )}
        </Button>
      </div>

      {sendResult && (
        <Card className={sendResult.error ? 'border-red-500' : 'border-green-500'}>
          <CardContent className="pt-6">
            {sendResult.error ? (
              <div className="text-red-600">
                <p className="font-bold">Error sending reminders</p>
                <p>{sendResult.error}</p>
              </div>
            ) : (
              <div className="text-green-600">
                <p className="font-bold">✅ Success!</p>
                <p>Processed {sendResult.processed} reminder(s)</p>
                {sendResult.results && sendResult.results.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {sendResult.results.map((r: any, i: number) => (
                      <li key={i} className="text-sm">
                        • {r.employee} - {r.document} - {r.status}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('reminders.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">{t('reminders.employee')}</th>
                  <th className="text-left p-3">{t('reminders.type')}</th>
                  <th className="text-left p-3">{t('reminders.targetDate')}</th>
                  <th className="text-left p-3">{t('reminders.status')}</th>
                  <th className="text-left p-3">{t('reminders.sentAt')}</th>
                </tr>
              </thead>
              <tbody>
                {reminders?.map((reminder: any) => (
                  <tr key={reminder.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3">
                      {i18n.language === 'ar'
                        ? reminder.employees?.name_ar
                        : reminder.employees?.name_en}
                    </td>
                    <td className="p-3 capitalize">{reminder.type.replace('_', ' ')}</td>
                    <td className="p-3">{dayjs(reminder.target_date).format('MMM D, YYYY')}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(reminder.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            reminder.status
                          )}`}
                        >
                          {t(`reminders.${reminder.status}`)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {reminder.sent_at
                        ? dayjs(reminder.sent_at).format('MMM D, YYYY h:mm A')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
