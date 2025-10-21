import { NextResponse } from 'next/server';

const staticMarketData = [
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
  },
  {
    security: 'EGTV',
    closing: '500',
    previous: '900',
    change: '0.00',
    volume: '0.00',
    value: '0.00'
  },
  {
    security: 'KCB',
    closing: '500',
    previous: '900',
    change: '0.00',
    volume: '0.00',
    value: '0.00'
  },
  {
    security: 'BOK',
    closing: '332',
    previous: '332',
    change: '0.00',
    volume: '0.00',
    value: '0.00'
  },
  {
    security: 'UDL',
    closing: '104',
    previous: '104',
    change: '0.00',
    volume: '0.00',
    value: '0.00'
  },
  {
    security: 'NMG',
    closing: '1,200',
    previous: '1,200',
    change: '0.00',
    volume: '0.00',
    value: '0.00'
  },
  {
    security: 'DHB',
    closing: '536',
    previous: '536',
    change: '0.00',
    volume: '0.00',
    value: '0.00'
  },
  {
    security: 'CNR',
    closing: '153',
    previous: '153',
    change: '0.00',
    volume: '0.00',
    value: '0.00'
  },
  {
    security: 'IMR',
    closing: '70',
    previous: '70',
    change: '0.00',
    volume: '0.00',
    value: '0.00'
  },
  {
    security: 'ELE',
    closing: '325',
    previous: '325',
    change: '0.00',
    volume: '0.00',
    value: '0.00'
  }
];

export async function GET() {
  try {
    return NextResponse.json(staticMarketData);
  } catch (error) {
    console.error('Error in market data API:', error);
    return NextResponse.json(staticMarketData);
  }
}