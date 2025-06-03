import { NextResponse } from 'next/server';
import { carService } from '@/services/carService';

export async function POST() {
  try {
    await carService.updateAllSearchTerms();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update search terms:', error);
    return NextResponse.json({ error: 'Failed to update search terms' }, { status: 500 });
  }
}
