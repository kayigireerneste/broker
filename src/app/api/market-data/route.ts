import { NextResponse } from 'next/server';

interface MarketData {
  security: string;
  closing: string;
  previous: string;
  change: string;
  volume: string;
  value: string;
}

const getDemoData = (): MarketData[] => [
  {
    security: 'RELIN/2023/2018',
    closing: '101',
    previous: '1.01',
    change: '+0.00',
    volume: '5,500,000',
    value: '5,599,000'
  },
  {
    security: 'P207/2024/2019 (Re-opened)',
    closing: '105',
    previous: '1.02',
    change: '+2.00',
    volume: '2,000,000',
    value: '2,100,000'
  },
  {
    security: 'P207/2023/2026 (Re-opened)',
    closing: '103.5',
    previous: '103.35',
    change: '+0.15',
    volume: '100,000,000',
    value: '103,500,000'
  },
  {
    security: 'MTNB',
    closing: '120',
    previous: '1.00',
    change: '0.00',
    volume: '0.00',
    value: '0.00'
  }
];

export async function GET() {
  try {
    // In a real application, you would fetch this data from an external API or database
    const data = getDemoData();
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
