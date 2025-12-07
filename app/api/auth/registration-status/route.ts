import { NextResponse } from 'next/server'

export async function GET() {
  // Verificar se registro público está habilitado
  const enablePublicRegistration = process.env.ENABLE_PUBLIC_REGISTRATION === 'true'
  
  return NextResponse.json({ 
    enabled: enablePublicRegistration 
  })
}







