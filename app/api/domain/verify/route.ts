import { NextResponse } from 'next/server'
import * as dns from 'dns'
import { promisify } from 'util'

// Force Node.js runtime (not Edge) for DNS operations
export const runtime = 'nodejs'

const resolveCname = promisify(dns.resolveCname)
const resolve4 = promisify(dns.resolve4)

interface DNSVerificationResult {
  status: 'configured' | 'pending' | 'invalid' | 'error'
  message: string
  details?: {
    type: 'CNAME' | 'A'
    value: string
  }
}

export async function POST(request: Request) {
  try {
    const { domain } = await request.json()

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Domínio é obrigatório' },
        { status: 400 }
      )
    }

    // Limpar domínio (remover http/https/www)
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .trim()

    const result: DNSVerificationResult = {
      status: 'pending',
      message: 'Verificando DNS...',
    }

    try {
      // Tentar resolver CNAME primeiro
      try {
        const cnameRecords = await resolveCname(cleanDomain)
        if (cnameRecords && cnameRecords.length > 0) {
          const cnameValue = cnameRecords[0]
          
          // Verificar se aponta para Vercel
          if (cnameValue.includes('vercel') || cnameValue.includes('cname.vercel-dns.com')) {
            result.status = 'configured'
            result.message = 'DNS configurado corretamente!'
            result.details = {
              type: 'CNAME',
              value: cnameValue,
            }
            return NextResponse.json(result)
          } else {
            result.status = 'invalid'
            result.message = `CNAME encontrado mas não aponta para Vercel. Valor atual: ${cnameValue}`
            result.details = {
              type: 'CNAME',
              value: cnameValue,
            }
            return NextResponse.json(result)
          }
        }
      } catch (cnameError: any) {
        // Se não tem CNAME, verificar A record
        if (cnameError.code !== 'ENODATA' && cnameError.code !== 'ENOTFOUND') {
          console.error('CNAME error:', cnameError)
        }
      }

      // Tentar resolver A record
      try {
        const aRecords = await resolve4(cleanDomain)
        if (aRecords && aRecords.length > 0) {
          result.status = 'invalid'
          result.message = 'Registro A encontrado. Use CNAME apontando para cname.vercel-dns.com'
          result.details = {
            type: 'A',
            value: aRecords[0],
          }
          return NextResponse.json(result)
        }
      } catch (aError: any) {
        // Sem registros A também
        if (aError.code !== 'ENODATA' && aError.code !== 'ENOTFOUND') {
          console.error('A record error:', aError)
        }
      }

      // Se chegou aqui, não encontrou registros
      result.status = 'pending'
      result.message = 'Nenhum registro DNS encontrado. Configure o CNAME apontando para cname.vercel-dns.com'
      return NextResponse.json(result)

    } catch (error: any) {
      if (error.code === 'ENOTFOUND') {
        result.status = 'error'
        result.message = 'Domínio não encontrado. Verifique se o domínio está correto.'
        return NextResponse.json(result, { status: 404 })
      }

      throw error
    }

  } catch (error: any) {
    console.error('DNS verification error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erro ao verificar DNS: ' + (error.message || 'Erro desconhecido'),
      },
      { status: 500 }
    )
  }
}

