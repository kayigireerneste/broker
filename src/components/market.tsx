"use client";

import { JSX, useEffect, useState } from "react";

interface MarketData {
  security: string;
  closing: string;
  previous: string;
  change: string;
  volume: string;
  value: string;
}

interface ExchangeRow {
  country?: string;
  code: string;
  buying: string;
  average: string;
  selling: string;
}

interface BondRow {
  no: number;
  tbondNo: string;
  issueDate: string;
  maturityDate: string;
  couponRate: string;
  yieldTM: string;
}

const TABS = [
  "DAILY MARKET SNAPSHOT",
  "MARKET STATISTICS",
  "EXCHANGE RATE",
  "OUTSTANDING BONDS",
];

export default function MarketSummary(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>(TABS[0]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Use the exact demo data you provided for Daily Market Snapshot
  const getDemoData = (): MarketData[] => [
    { security: "BSLB1/2023/7YRS", closing: "101", previous: "101", change: "+0.0", volume: "5,900,000", value: "5,959,000" },
    { security: "FXD7/2024/3Yrs (Re-opened)", closing: "105", previous: "102", change: "+3.0", volume: "2,000,000", value: "2,100,000" },
    { security: "FXD1/2023/20Yrs (Re-opened)", closing: "103.5", previous: "103.35", change: "+0.15", volume: "100,000,000", value: "103,500,000" },
    { security: "MTNR", closing: "120", previous: "120", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "EQTY", closing: "500", previous: "500", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "KCB", closing: "500", previous: "500", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "BOK", closing: "332", previous: "332", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "USL", closing: "104", previous: "104", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "NMG", closing: "1,200", previous: "1,200", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "RHB", closing: "526", previous: "526", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "CMR", closing: "153", previous: "153", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "IMR", closing: "70", previous: "70", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "BLR", closing: "325", previous: "325", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "KCB", closing: "500", previous: "500", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "BOK", closing: "332", previous: "332", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "USL", closing: "104", previous: "104", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "NMG", closing: "1,200", previous: "1,200", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "RHB", closing: "526", previous: "526", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "CMR", closing: "153", previous: "153", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "IMR", closing: "70", previous: "70", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "BLR", closing: "325", previous: "325", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "KCB", closing: "500", previous: "500", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "BOK", closing: "332", previous: "332", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "USL", closing: "104", previous: "104", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "NMG", closing: "1,200", previous: "1,200", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "RHB", closing: "526", previous: "526", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "CMR", closing: "153", previous: "153", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "IMR", closing: "70", previous: "70", change: "0.0", volume: "0.0", value: "0.0" },
    { security: "BLR", closing: "325", previous: "325", change: "0.0", volume: "0.0", value: "0.0" },
  ];

  // Exchange demo data (based on your first image)
  const exchangeDemo: ExchangeRow[] = [
    { country: "United States", code: "USD", buying: "1,443.96", average: "1,448.96", selling: "1,453.96" },
    { country: "Tanzania", code: "TZS", buying: "0.58", average: "0.58", selling: "0.59" },
    { country: "Uganda", code: "UGS", buying: "0.41", average: "0.41", selling: "0.42" },
    { country: "Kenya", code: "KES", buying: "11.18", average: "11.21", selling: "11.25" },
    { country: "Burundi", code: "BIF", buying: "0.49", average: "0.49", selling: "0.49" },
    { country: "South Africa", code: "ZAR", buying: "83.22", average: "83.50", selling: "83.79" },
  ];

  // Outstanding bonds demo data (based on your second image)
  const bondsDemo: BondRow[] = [
    { no: 1, tbondNo: "FXD 2/2016/15Yrs", issueDate: "25-May-2016", maturityDate: "09-May-2031", couponRate: "13.500%", yieldTM: "13.500%" },
    { no: 2, tbondNo: "FXD 2/2018/10Yrs (Re-opened)", issueDate: "23-Jan-2019", maturityDate: "12-May-2028", couponRate: "12.500%", yieldTM: "12.250%" },
    { no: 3, tbondNo: "FXD 3/2018/15Yrs (Re-opened)", issueDate: "23-Oct-2019", maturityDate: "05-Aug-2033", couponRate: "12.900%", yieldTM: "12.680%" },
    { no: 4, tbondNo: "FXD 3/2019/20Yrs (Re-opened)", issueDate: "18-Dec-2019", maturityDate: "29-Jul-2039", couponRate: "13.250%", yieldTM: "13.200%" },
    { no: 5, tbondNo: "FXD 5/2019/7Yrs (Re-opened)", issueDate: "25-Mar-2020", maturityDate: "13-Nov-2026", couponRate: "11.550%", yieldTM: "11.450%" },
    { no: 6, tbondNo: "FXD 2/2020/15Yrs (Re-opened)", issueDate: "20-Jan-2021", maturityDate: "02-Feb-2035", couponRate: "12.550%", yieldTM: "12.350%" },
    { no: 7, tbondNo: "FXD 4/2020/10Yrs (Re-opened)", issueDate: "22-Jul-2020", maturityDate: "10-May-2030", couponRate: "12.150%", yieldTM: "12.100%" },
    { no: 8, tbondNo: "FXD 6/2020/20Yrs (Re-opened)", issueDate: "24-Mar-2021", maturityDate: "27-Jul-2040", couponRate: "13.150%", yieldTM: "13.050%" },
    { no: 9, tbondNo: "FXD 7/2020/7Yrs (Re-opened)", issueDate: "21-Apr-2021", maturityDate: "12-Nov-2027", couponRate: "11.435%", yieldTM: "11.425%" },
    { no: 10, tbondNo: "FXD 1/2021/5Yrs", issueDate: "17-Feb-2021", maturityDate: "13-Feb-2026", couponRate: "11.000%", yieldTM: "11.000%" },
  ];

  // pagination for daily snapshot
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(marketData.length / rowsPerPage));
  const paginatedData = marketData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    setLoading(true);
    // Using local demo data only
    setTimeout(() => {
      setMarketData(getDemoData());
      setLoading(false);
    }, 300); // small delay to emulate loading
  }, []);

  useEffect(() => {
    // reset page when switching to other tabs or data changes
    setPage(1);
    // scroll to top of component when tab changes (nice UX)
    const el = document.getElementById("market-summary-root");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#f8f9fa] text-gray-600">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mr-2" />
        Loading market data...
      </div>
    );
  }

  return (
    <div id="market-summary-root" className="min-h-[50vh] bg-[#f8f9fa] py-8 flex flex-col items-center">
      <div className="text-center mb-6 max-w-6xl w-full px-4">
        <h1 className="text-2xl font-bold text-gray-800">MARKET SUMMARY</h1>
        <p className="text-sm text-gray-600 mt-1">As of {new Date().toLocaleDateString()}</p>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mt-5 gap-x-6 gap-y-2 border-b border-gray-200 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 text-sm font-semibold transition ${
                activeTab === tab
                  ? "text-[#004B5B] border-b-2 border-[#004B5B]"
                  : "text-gray-600 hover:text-[#004B5B]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content container */}
      <div className="w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {/* DAILY MARKET SNAPSHOT */}
        {activeTab === "DAILY MARKET SNAPSHOT" && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Security</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Closing</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Previous</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Change (%)</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Volume</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, idx) => (
                    <tr
                      key={`${item.security}-${idx}`}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-[#004B5B]/30 hover:bg-[#004B5B]/5 transition`}
                    >
                      <td className="px-6 py-4 font-semibold text-white bg-[#004B5B] whitespace-nowrap rounded-l-md">
                        {item.security}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{item.closing}</td>
                      <td className="px-6 py-4 text-gray-900">{item.previous}</td>
                      <td
                        className={`px-6 py-4 ${
                          item.change.startsWith("+")
                            ? "text-[#004B5B]"
                            : item.change.startsWith("-")
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {item.change}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{item.volume}</td>
                      <td className="px-6 py-4 text-gray-900">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {marketData.length > rowsPerPage && (
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded ${page === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-[#004B5B] text-white hover:bg-[#006373]"}`}
                >
                  Previous
                </button>

                <div className="text-sm text-gray-700">Page {page} of {totalPages}</div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded ${page === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-[#004B5B] text-white hover:bg-[#006373]"}`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* MARKET STATISTICS - placeholder structure (you can replace with real fields later) */}
        {activeTab === "MARKET STATISTICS" && (
          <div className="p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Market Statistics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded text-center">
                <div className="text-sm text-gray-500">Total Market Cap</div>
                <div className="text-xl font-bold text-gray-800">RWF 1,234,567</div>
              </div>
              <div className="p-4 border rounded text-center">
                <div className="text-sm text-gray-500">Total Volume</div>
                <div className="text-xl font-bold text-gray-800">123,456,789</div>
              </div>
              <div className="p-4 border rounded text-center">
                <div className="text-sm text-gray-500">Average Change</div>
                <div className="text-xl font-bold text-gray-800">+0.65%</div>
              </div>
            </div>
          </div>
        )}

        {/* EXCHANGE RATE */}
        {activeTab === "EXCHANGE RATE" && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Country</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Code</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Buying Value</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Average Value</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Selling Value</th>
                  </tr>
                </thead>
                <tbody>
                  {exchangeDemo.map((row, idx) => (
                    <tr key={row.code} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-[#004B5B]/30`}>
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">{row.country}</td>
                      <td className="px-6 py-4 text-gray-900">{row.code}</td>
                      <td className="px-6 py-4 text-gray-900">{row.buying}</td>
                      <td className="px-6 py-4 text-gray-900">{row.average}</td>
                      <td className="px-6 py-4 text-gray-900">{row.selling}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* OUTSTANDING BONDS */}
        {activeTab === "OUTSTANDING BONDS" && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">No</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">T-BONDS No</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Issue Date</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Maturity Date</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Coupon rate</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Yield TM</th>
                  </tr>
                </thead>
                <tbody>
                  {bondsDemo.map((b) => (
                    <tr key={b.no} className="bg-white border-b border-[#004B5B]/30">
                      <td className="px-6 py-4 text-gray-800">{b.no}</td>
                      <td className="px-6 py-4 text-gray-800">{b.tbondNo}</td>
                      <td className="px-6 py-4 text-gray-800">{b.issueDate}</td>
                      <td className="px-6 py-4 text-gray-800">{b.maturityDate}</td>
                      <td className="px-6 py-4 text-gray-800">{b.couponRate}</td>
                      <td className="px-6 py-4 text-gray-800">{b.yieldTM}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded">
          {error}
        </div>
      )}
    </div>
  );
}
