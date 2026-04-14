import { NextResponse } from 'next/server';
import { lwaAuthorizeUrl } from '../../../lib/auth';

export async function GET() {
  return NextResponse.redirect(lwaAuthorizeUrl());
}
