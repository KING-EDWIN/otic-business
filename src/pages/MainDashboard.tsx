import React from 'react'
import { Outlet } from 'react-router-dom'
import ProfessionalDashboardLayout from '@/components/ProfessionalDashboardLayout'
import DashboardOverview from '@/components/DashboardOverview'

const MainDashboard: React.FC = () => {
  return (
    <ProfessionalDashboardLayout>
      <DashboardOverview />
    </ProfessionalDashboardLayout>
  )
}

export default MainDashboard

