import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import dayjs from 'dayjs'

interface Employee {
  id: string
  employee_no: string
  name_en: string
  name_ar: string
  nationality: string
  company_id: string
  department_id: string
  job_id: string
  passport_no: string | null
  passport_expiry: string | null
  card_no: string | null
  card_expiry: string | null
  emirates_id: string | null
  emirates_id_expiry: string | null
  residence_no: string | null
  residence_expiry: string | null
  email: string | null
  phone: string | null
}

export function EmployeesPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*, companies(name_en, name_ar), departments(name_en, name_ar), jobs(name_en, name_ar)')
        .order('employee_no')
      if (error) throw error
      return data
    },
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data } = await supabase.from('companies').select('*').order('name_en')
      return data || []
    },
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await supabase.from('departments').select('*').order('name_en')
      return data || []
    },
  })

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await supabase.from('jobs').select('*').order('name_en')
      return data || []
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employees').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  const filteredEmployees = employees?.filter((emp: any) =>
    emp.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.name_ar.includes(searchTerm) ||
    emp.employee_no.includes(searchTerm) ||
    emp.passport_no?.includes(searchTerm) ||
    emp.emirates_id?.includes(searchTerm)
  )

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingEmployee(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm(t('employees.deleteConfirm'))) {
      deleteMutation.mutate(id)
    }
  }

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return 'text-gray-500'
    const daysUntilExpiry = dayjs(expiryDate).diff(dayjs(), 'day')
    if (daysUntilExpiry < 0) return 'text-red-600 font-bold'
    if (daysUntilExpiry <= 30) return 'text-yellow-600 font-bold'
    return 'text-green-600'
  }

  if (isLoading) {
    return <div>{t('common.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('employees.title')}</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          {t('employees.addEmployee')}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees?.map((employee: any) => (
          <Card key={employee.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">
                  {i18n.language === 'ar' ? employee.name_ar : employee.name_en}
                </h3>
                <p className="text-sm text-muted-foreground">{employee.employee_no}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(employee)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(employee.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">{t('employees.company')}:</span>{' '}
                {i18n.language === 'ar' ? employee.companies?.name_ar : employee.companies?.name_en}
              </p>
              <p>
                <span className="font-medium">{t('employees.department')}:</span>{' '}
                {i18n.language === 'ar' ? employee.departments?.name_ar : employee.departments?.name_en}
              </p>
              <p>
                <span className="font-medium">{t('employees.job')}:</span>{' '}
                {i18n.language === 'ar' ? employee.jobs?.name_ar : employee.jobs?.name_en}
              </p>
              <p>
                <span className="font-medium">{t('employees.passportNo')}:</span>{' '}
                {employee.passport_no || 'N/A'}
              </p>
              <p>
                <span className="font-medium">{t('employees.cardExpiry')}:</span>{' '}
                <span className={getExpiryStatus(employee.card_expiry)}>
                  {employee.card_expiry ? dayjs(employee.card_expiry).format('DD/MM/YYYY') : 'N/A'}
                </span>
              </p>
              <p>
                <span className="font-medium">{t('employees.emiratesIdExpiry')}:</span>{' '}
                <span className={getExpiryStatus(employee.emirates_id_expiry)}>
                  {employee.emirates_id_expiry ? dayjs(employee.emirates_id_expiry).format('DD/MM/YYYY') : 'N/A'}
                </span>
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Employee Dialog */}
      <EmployeeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        employee={editingEmployee}
        companies={companies || []}
        departments={departments || []}
        jobs={jobs || []}
      />
    </div>
  )
}

interface EmployeeDialogProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
  companies: any[]
  departments: any[]
  jobs: any[]
}

function EmployeeDialog({ isOpen, onClose, employee, companies, departments, jobs }: EmployeeDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<any>(employee || {})

  React.useEffect(() => {
    setFormData(employee || {})
  }, [employee])

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Validate required fields
      if (!data.company_id || !data.department_id || !data.job_id) {
        throw new Error('Company, Department, and Job are required fields')
      }

      // Clean data: remove nested objects and keep only valid columns
      const cleanData = {
        employee_no: data.employee_no,
        name_en: data.name_en,
        name_ar: data.name_ar,
        nationality: data.nationality,
        company_id: data.company_id,
        department_id: data.department_id,
        job_id: data.job_id,
        passport_no: data.passport_no || null,
        passport_expiry: data.passport_expiry || null,
        card_no: data.card_no || null,
        card_expiry: data.card_expiry || null,
        emirates_id: data.emirates_id || null,
        emirates_id_expiry: data.emirates_id_expiry || null,
        residence_no: data.residence_no || null,
        residence_expiry: data.residence_expiry || null,
        email: data.email || null,
        phone: data.phone || null,
      }

      if (employee) {
        const { error } = await supabase
          .from('employees')
          .update(cleanData)
          .eq('id', employee.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('employees').insert([cleanData])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      onClose()
    },
    onError: (error: any) => {
      alert(error.message || 'An error occurred while saving the employee')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? t('employees.editEmployee') : t('employees.addEmployee')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('employees.employeeNo')}</Label>
              <Input
                value={formData.employee_no || ''}
                onChange={(e) => setFormData({ ...formData, employee_no: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t('employees.nameEn')}</Label>
              <Input
                value={formData.name_en || ''}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t('employees.nameAr')}</Label>
              <Input
                value={formData.name_ar || ''}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t('employees.nationality')}</Label>
              <Input
                value={formData.nationality || ''}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t('employees.company')} <span className="text-red-500">*</span></Label>
              <Select
                value={formData.company_id || ''}
                onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('employees.department')} <span className="text-red-500">*</span></Label>
              <Select
                value={formData.department_id || ''}
                onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('employees.job')} <span className="text-red-500">*</span></Label>
              <Select
                value={formData.job_id || ''}
                onValueChange={(value) => setFormData({ ...formData, job_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job..." />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('employees.passportNo')}</Label>
              <Input
                value={formData.passport_no || ''}
                onChange={(e) => setFormData({ ...formData, passport_no: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('employees.passportExpiry')}</Label>
              <Input
                type="date"
                value={formData.passport_expiry || ''}
                onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('employees.cardNo')}</Label>
              <Input
                value={formData.card_no || ''}
                onChange={(e) => setFormData({ ...formData, card_no: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('employees.cardExpiry')}</Label>
              <Input
                type="date"
                value={formData.card_expiry || ''}
                onChange={(e) => setFormData({ ...formData, card_expiry: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('employees.emiratesId')}</Label>
              <Input
                value={formData.emirates_id || ''}
                onChange={(e) => setFormData({ ...formData, emirates_id: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('employees.emiratesIdExpiry')}</Label>
              <Input
                type="date"
                value={formData.emirates_id_expiry || ''}
                onChange={(e) => setFormData({ ...formData, emirates_id_expiry: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('employees.residenceNo')}</Label>
              <Input
                value={formData.residence_no || ''}
                onChange={(e) => setFormData({ ...formData, residence_no: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('employees.residenceExpiry')}</Label>
              <Input
                type="date"
                value={formData.residence_expiry || ''}
                onChange={(e) => setFormData({ ...formData, residence_expiry: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('employees.email')}</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('employees.phone')}</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
