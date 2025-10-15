// @ts-nocheck: Supabase type generation issue with relations
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileX, AlertTriangle, Clock } from 'lucide-react'
import dayjs from 'dayjs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export function Dashboard() {
  const { t } = useTranslation()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get total employees
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })

      // Get employees with missing passports
      const { count: missingPassports } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .is('passport_no', null)

      // Get expired cards
      const { count: expiredCards } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .lt('card_expiry', dayjs().format('YYYY-MM-DD'))

      // Get documents expiring in 30 days
      const thirtyDaysFromNow = dayjs().add(30, 'day').format('YYYY-MM-DD')
      const today = dayjs().format('YYYY-MM-DD')

      const { data: expiringDocs } = await supabase
        .from('employees')
        .select('card_expiry, passport_expiry, emirates_id_expiry, residence_expiry')
        .or(
          `card_expiry.gte.${today},card_expiry.lte.${thirtyDaysFromNow},passport_expiry.gte.${today},passport_expiry.lte.${thirtyDaysFromNow},emirates_id_expiry.gte.${today},emirates_id_expiry.lte.${thirtyDaysFromNow},residence_expiry.gte.${today},residence_expiry.lte.${thirtyDaysFromNow}`
        )

      // Count employees by company
      const { data: companyCounts } = await supabase
        .from('employees')
        .select('company_id, companies(name_en)')
        .order('company_id')

      interface CompanyStat {
        name: string
        count: number
      }

      const companyStats = companyCounts?.reduce((acc: CompanyStat[], emp: { companies?: { name_en?: string } }) => {
        const companyName = emp.companies?.name_en || 'Unknown'
        const existing = acc.find((item) => item.name === companyName)
        if (existing) {
          existing.count += 1
        } else {
          acc.push({ name: companyName, count: 1 })
        }
        return acc
      }, [] as CompanyStat[])

      return {
        totalEmployees: totalEmployees || 0,
        missingPassports: missingPassports || 0,
        expiredCards: expiredCards || 0,
        expiringDocuments: expiringDocs?.length || 0,
        companyStats: companyStats || [],
      }
    },
  })

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('activity_log')
        .select('*, employees(name_en)')
        .order('timestamp', { ascending: false })
        .limit(5)
      return data || []
    },
  })

  if (isLoading) {
    return <div>{t('common.loading')}</div>
  }

  const statCards = [
    {
      title: t('dashboard.totalEmployees'),
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: t('dashboard.missingPassports'),
      value: stats?.missingPassports || 0,
      icon: FileX,
      color: 'text-red-600',
    },
    {
      title: t('dashboard.expiredCards'),
      value: stats?.expiredCards || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
    {
      title: t('dashboard.expiringDocuments'),
      value: stats?.expiringDocuments || 0,
      icon: Clock,
      color: 'text-yellow-600',
    },
  ]

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employees by Company</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.companyStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.companyStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                {stats?.companyStats?.map((_: unknown, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity?.map((activity: { 
              id: string
              action: string
              timestamp: string
              employees?: { name_en?: string }
            }) => (
              <div key={activity.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{activity.employees?.name_en}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dayjs(activity.timestamp).format('MMM D, YYYY h:mm A')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
