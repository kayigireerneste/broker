/* eslint-disable react/no-unescaped-entities */
'use client';

import { useMemo, useState } from 'react';
import DashboardLayout from '@/components/ui/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function ClientDashboard() {
  const [selectedAction, setSelectedAction] = useState('');
  const { user } = useAuth();

  const { displayName, email, dashboardRole } = useMemo(() => {
    const first = (user?.firstName as string | undefined) ?? '';
    const last = (user?.lastName as string | undefined) ?? '';
    const fullName = `${first} ${last}`.trim();
    const fallbackName = user?.email ? user.email.split('@')[0] : 'Client';
    const role = user?.role?.toLowerCase();
    return {
      displayName: fullName || fallbackName,
      email: user?.email ?? 'Not provided',
  dashboardRole: (role === 'client' || role === 'agent' || role === 'admin' ? role : 'client') as "client" | "agent" | "admin",
    };
  }, [user?.email, user?.firstName, user?.lastName, user?.role]);

  const handleAction = (action: string) => {
    setSelectedAction(action);
    console.log(`${action} clicked`);
  };

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {displayName}!</h1>
          <p className="text-sm text-gray-600">Here's your investment overview today.</p>
        </div>

        {/* <UserInfoCard name={displayName} email={email} role={dashboardRole} /> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Portfolio Value</p>
                <p className="text-xl font-bold text-gray-900">$24,580</p>
                <p className="text-xs text-green-600">+5.2%</p>
              </div>
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Wallet Balance</p>
                <p className="text-xl font-bold text-gray-900">$3,420</p>
                <p className="text-xs text-blue-600">Available</p>
              </div>
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Today's P&L</p>
                <p className="text-xl font-bold text-green-600">+$127</p>
                <p className="text-xs text-gray-600">+0.52%</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Active Orders</p>
                <p className="text-xl font-bold text-gray-900">3</p>
                <p className="text-xs text-orange-600">2 pending</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Market Updates</h3>
            <div className="space-y-2">
              {[
                { name: 'BK Group', price: '$85.50', change: '+2.5%', positive: true },
                { name: 'Equity Bank', price: '$42.30', change: '+1.8%', positive: true },
                { name: 'MTN Rwanda', price: '$28.75', change: '-0.3%', positive: false },
                { name: 'I&M Bank', price: '$156.20', change: '+3.1%', positive: true },
                { name: 'KCB Group', price: '$67.80', change: '+0.9%', positive: true }
              ].map((stock, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                  <span className="font-medium">{stock.name}</span>
                  <div className="text-right">
                    <p className="font-semibold">{stock.price}</p>
                    <p className={stock.positive ? 'text-green-600' : 'text-red-600'}>
                      {stock.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Portfolio Performance</h2>
                <select className="px-2 py-1 border border-gray-300 rounded text-xs">
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>3 months</option>
                </select>
              </div>
              <div className="h-48 relative bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#004F64" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#004F64" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="#004F64"
                    strokeWidth="2"
                    points="20,160 60,140 100,120 140,100 180,90 220,85 260,80 300,75 340,70 380,65"
                  />
                  <polygon
                    fill="url(#chartGradient)"
                    points="20,160 60,140 100,120 140,100 180,90 220,85 260,80 300,75 340,70 380,65 380,180 20,180"
                  />
                  <circle cx="380" cy="65" r="4" fill="#004F64"/>
                </svg>
                <div className="absolute bottom-2 left-2 text-xs text-gray-600">
                  <span className="font-semibold text-green-600">↗ +8.4%</span> this period
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                className="w-full text-xs py-2" 
                variant="outline"
                onClick={() => handleAction('Buy Shares')}
              >
                Buy Shares
              </Button>
              <Button 
                className="w-full text-xs py-2" 
                variant="outline"
                onClick={() => handleAction('Sell Shares')}
              >
                Sell Shares
              </Button>
              <Button 
                className="w-full text-xs py-2" 
                variant="outline"
                onClick={() => handleAction('Add Funds')}
              >
                Add Funds
              </Button>
              <Button 
                className="w-full text-xs py-2" 
                variant="outline"
                onClick={() => handleAction('Withdraw')}
              >
                Withdraw
              </Button>
            </div>
            {selectedAction && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                {selectedAction} action triggered
              </div>
            )}
          </Card>
        </div>

        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Holdings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Company</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Shares</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Value</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">P&L</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-blue-600 font-semibold text-xs">BK</span>
                      </div>
                      <span className="font-medium">BK Group</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">150</td>
                  <td className="py-2 px-3">$85.50</td>
                  <td className="py-2 px-3">$12,825</td>
                  <td className="py-2 px-3 text-green-600">+$325 (+2.6%)</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-green-600 font-semibold text-xs">EQ</span>
                      </div>
                      <span className="font-medium">Equity Bank</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">75</td>
                  <td className="py-2 px-3">$42.30</td>
                  <td className="py-2 px-3">$3,172</td>
                  <td className="py-2 px-3 text-green-600">+$127 (+4.2%)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-yellow-600 font-semibold text-xs">MT</span>
                      </div>
                      <span className="font-medium">MTN Rwanda</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">200</td>
                  <td className="py-2 px-3">$28.75</td>
                  <td className="py-2 px-3">$5,750</td>
                  <td className="py-2 px-3 text-red-600">-$50 (-0.9%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}