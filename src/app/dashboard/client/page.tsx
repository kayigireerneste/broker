'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/ui/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle } from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();

  const profileReminder = useMemo(() => {
    if (!user) {
      return { needed: false, tasks: [] as string[] };
    }

    const record = user as Record<string, unknown>;
    const isEmpty = (value: unknown) =>
      value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0);

    const requirements = [
      {
        id: 'verify-email',
        message: 'verify your email',
        optional: false,
        isComplete: () => record.isVerified !== false,
      },
      {
        id: 'phone',
        message: 'add a phone number',
        optional: false,
        isComplete: () => !isEmpty(record.phone) && !isEmpty(record.phoneCountryCode),
      },
      {
        id: 'address',
        message: 'confirm your address',
        optional: false,
        isComplete: () => !isEmpty(record.country) && !isEmpty(record.city),
      },
      {
        id: 'id-document',
        message: 'upload your ID document',
        optional: true,
        isComplete: () => !isEmpty(record.idDocument),
      },
      {
        id: 'passport-photo',
        message: 'add a passport photo',
        optional: true,
        isComplete: () => !isEmpty(record.passportPhoto),
      },
    ];

    const missingEssentials = requirements.filter((item) => !item.optional && !item.isComplete());
    const missingOptional = requirements.filter((item) => item.optional && !item.isComplete());

    const tasks = missingEssentials.length > 0
      ? [...missingEssentials, ...missingOptional].map((item) => item.message)
      : [];

    return {
      needed: missingEssentials.length > 0,
      tasks,
    };
  }, [user]);

  const { displayName, email, dashboardRole } = useMemo(() => {
    const fullName = (user?.fullName as string | undefined)?.trim() ?? '';
    const fallbackName = user?.email ? user.email.split('@')[0] : 'Client';
    const role = user?.role?.toLowerCase();
    const dashboardRole =
      role === 'client' || role === 'teller' || role === 'admin' ? (role as 'client' | 'teller' | 'admin') : 'client';
    return {
      displayName: fullName || fallbackName,
      email: user?.email ?? 'Not provided',
      dashboardRole,
    };
  }, [user?.email, user?.fullName, user?.role]);

  const formatTaskList = (tasks: string[]) => {
    if (tasks.length <= 1) return tasks[0] ?? '';
    const leading = tasks.slice(0, -1).join(', ');
    const last = tasks[tasks.length - 1];
    return `${leading} and ${last}`;
  };

  return (
    <DashboardLayout userRole={dashboardRole} userName={displayName} userEmail={email}>
      <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
        {profileReminder.needed && (
          <div className="flex flex-col gap-3 md:gap-4 rounded-xl md:rounded-2xl border border-amber-200 bg-amber-50 p-3 md:p-5 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-2 md:gap-3 min-w-0">
              <AlertCircle className="mt-0.5 h-4 w-4 md:h-5 md:w-5 shrink-0 text-amber-500" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs md:text-sm">Complete your profile</p>
                <p className="text-amber-800 text-xs md:text-sm">
                  Finish setting up your account: {formatTaskList(profileReminder.tasks)}.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/client/settings"
              className="inline-flex items-center justify-center rounded-full border border-[#004F64] px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-[#004F64] transition hover:bg-[#004F64] hover:text-white whitespace-nowrap shrink-0"
            >
              Update profile
            </Link>
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Welcome back, {displayName}!</h1>
          <p className="text-sm text-gray-600">Here&apos;s your investment overview today.</p>
        </div>

        {/* <UserInfoCard name={displayName} email={email} role={dashboardRole} /> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <Link href="/dashboard/client/investments">
            <Card className="p-3 md:p-5 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-[10px] md:text-xs font-medium text-gray-600 truncate">Portfolio Value</p>
                  <p className="text-base md:text-xl font-bold text-gray-900">Rwf 24,580</p>
                  <p className="text-xs text-green-600">+5.2%</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 gradient-primary rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/client/wallet">
            <Card className="p-3 md:p-5 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-[10px] md:text-xs font-medium text-gray-600 truncate">Wallet Balance</p>
                  <p className="text-base md:text-xl font-bold text-gray-900">Rwf 3,420</p>
                  <p className="text-xs text-blue-600">Available</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 gradient-primary rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/client/investments">
            <Card className="p-3 md:p-5 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-[10px] md:text-xs font-medium text-gray-600 truncate">Total Shares Bought</p>
                  <p className="text-base md:text-xl font-bold text-green-600">1,200</p>
                  <p className="text-xs text-gray-600">3 companies</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/client/history">
            <Card className="p-3 md:p-5 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-[10px] md:text-xs font-medium text-gray-600 truncate">Total Shares Sold</p>
                  <p className="text-base md:text-xl font-bold text-gray-900">500</p>
                  <p className="text-xs text-orange-600">2 companies</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4">
          <Card className="p-3 md:p-5 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Market Updates</h3>
            <div className="space-y-2">
              {[
                { name: 'BK Group', price: 'Rwf 85.50', change: '+2.5%', positive: true },
                { name: 'Equity Bank', price: 'Rwf 42.30', change: '+1.8%', positive: true },
                { name: 'MTN Rwanda', price: 'Rwf 28.75', change: '-0.3%', positive: false },
                { name: 'I&M Bank', price: 'Rwf 156.20', change: '+3.1%', positive: true },
                { name: 'KCB Group', price: 'Rwf 67.80', change: '+0.9%', positive: true }
              ].map((stock, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                  <span className="font-medium truncate mr-2">{stock.name}</span>
                  <div className="text-right shrink-0">
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
            <Card className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Portfolio Performance</h2>
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

          <Card className="p-4 md:p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/dashboard/client/trade">
                <Button 
                  className="w-full text-xs py-2" 
                  variant="outline"
                >
                  Buy Shares
                </Button>
              </Link>
              <Link href="/dashboard/client/trade">
                <Button 
                  className="w-full text-xs py-2" 
                  variant="outline"
                >
                  Sell Shares
                </Button>
              </Link>
              <Link href="/dashboard/client/wallet">
                <Button 
                  className="w-full text-xs py-2" 
                  variant="outline"
                >
                  Add Funds
                </Button>
              </Link>
              <Link href="/dashboard/client/wallet">
                <Button 
                  className="w-full text-xs py-2" 
                  variant="outline"
                >
                  Withdraw
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <Card className="p-3 md:p-5 overflow-hidden">
          <h2 className="text-sm md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Your Holdings</h2>
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <div className="inline-block min-w-full align-middle px-3 md:px-0">
              <div className="overflow-hidden">
                <table className="min-w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-1.5 md:px-3 font-semibold text-gray-700">Company</th>
                      <th className="text-left py-2 px-1.5 md:px-3 font-semibold text-gray-700">Shares</th>
                      <th className="text-left py-2 px-1.5 md:px-3 font-semibold text-gray-700">Price</th>
                      <th className="text-left py-2 px-1.5 md:px-3 font-semibold text-gray-700 hidden sm:table-cell">Value</th>
                      <th className="text-left py-2 px-1.5 md:px-3 font-semibold text-gray-700">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-1.5 md:px-3">
                        <div className="flex items-center">
                          <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 rounded-full flex items-center justify-center mr-1.5 md:mr-2 shrink-0">
                            <span className="text-blue-600 font-semibold text-[10px] md:text-xs">BK</span>
                          </div>
                          <span className="font-medium text-xs md:text-sm truncate">BK Group</span>
                        </div>
                      </td>
                      <td className="py-2 px-1.5 md:px-3">150</td>
                      <td className="py-2 px-1.5 md:px-3 whitespace-nowrap">Rwf 85.50</td>
                      <td className="py-2 px-1.5 md:px-3 whitespace-nowrap hidden sm:table-cell">Rwf 12,825</td>
                      <td className="py-2 px-1.5 md:px-3 text-green-600 whitespace-nowrap text-[10px] md:text-sm">+Rwf 325 (+2.6%)</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-1.5 md:px-3">
                        <div className="flex items-center">
                          <div className="w-5 h-5 md:w-6 md:h-6 bg-green-100 rounded-full flex items-center justify-center mr-1.5 md:mr-2 shrink-0">
                            <span className="text-green-600 font-semibold text-[10px] md:text-xs">EQ</span>
                          </div>
                          <span className="font-medium text-xs md:text-sm truncate">Equity Bank</span>
                        </div>
                      </td>
                      <td className="py-2 px-1.5 md:px-3">75</td>
                      <td className="py-2 px-1.5 md:px-3 whitespace-nowrap">Rwf 42.30</td>
                      <td className="py-2 px-1.5 md:px-3 whitespace-nowrap hidden sm:table-cell">Rwf 3,172</td>
                      <td className="py-2 px-1.5 md:px-3 text-green-600 whitespace-nowrap text-[10px] md:text-sm">+Rwf 127 (+4.2%)</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-1.5 md:px-3">
                        <div className="flex items-center">
                          <div className="w-5 h-5 md:w-6 md:h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-1.5 md:mr-2 shrink-0">
                            <span className="text-yellow-600 font-semibold text-[10px] md:text-xs">MT</span>
                          </div>
                          <span className="font-medium text-xs md:text-sm truncate">MTN Rwanda</span>
                        </div>
                      </td>
                      <td className="py-2 px-1.5 md:px-3">200</td>
                      <td className="py-2 px-1.5 md:px-3 whitespace-nowrap">Rwf 28.75</td>
                      <td className="py-2 px-1.5 md:px-3 whitespace-nowrap hidden sm:table-cell">Rwf 5,750</td>
                      <td className="py-2 px-1.5 md:px-3 text-red-600 whitespace-nowrap text-[10px] md:text-sm">-Rwf 50 (-0.9%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}