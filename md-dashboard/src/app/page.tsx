// 26.08.04 수정 (민) 26.08.05 UI 변경에 따른 코드 변경 추가
// 26.08.10 역할별 접근 제어(CEO/MD/재고담당자) 추가

'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import OverviewTab from '@/components/tabs/OverviewTab';
import HubInventory from '@/components/dashboard/HubInventory';
import ProductInventory from '@/components/dashboard/ProductInventory';
import ForecastInventory from '@/components/dashboard/ForecastInventory';
import AccessGate from '@/components/layout/AccessGate';
import { DashboardView } from '@/types/dashboard';

// 역할별로 볼 수 있는 화면 정의
const ROLE_ACCESS: Record<string, DashboardView[]> = {
  ceo: ['overview', 'hub', 'product', 'forecast'],
  md: ['overview', 'product', 'forecast'],
  stock: ['hub', 'forecast'],
};

export default function Home() {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  // 사이드바 열림/닫힘 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // 새로고침해도 세션 동안은 다시 안 물어봄
    const savedRole = sessionStorage.getItem('dashboard_role');
    if (savedRole) {
      setRole(savedRole);
      const firstAllowed = ROLE_ACCESS[savedRole]?.[0];
      if (firstAllowed) setCurrentView(firstAllowed);
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!role) {
    return (
      <AccessGate
        onUnlock={(newRole) => {
          if (!newRole) return;
          setRole(newRole);
          const firstAllowed = ROLE_ACCESS[newRole]?.[0];
          if (firstAllowed) setCurrentView(firstAllowed);
        }}
      />
    );
  }

  const allowedViews = ROLE_ACCESS[role] || [];

  return (
    // max-w-[1620px] 제거 후 w-full로 넓히고 여백을 조정해 화면에 꽉 차게 변경
    <div className="w-full p-4 sm:p-6 flex gap-6 min-h-screen">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        allowedViews={allowedViews}
      />

      <main className="main flex-1 min-w-0 transition-all duration-300">
        <Header />

        {currentView === 'overview' && allowedViews.includes('overview') && <OverviewTab />}
        {currentView === 'hub' && allowedViews.includes('hub') && <HubInventory />}
        {currentView === 'product' && allowedViews.includes('product') && <ProductInventory />}
        {currentView === 'forecast' && allowedViews.includes('forecast') && <ForecastInventory />}
      </main>
    </div>
  );
}