import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/actions/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const tenantId = formData.get('tenantId') as string

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 400 })
    }

    // Verificar se o usuário tem acesso ao tenant
    if ((user as any).tenant_id !== tenantId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const supabase = createAdminClient() as any

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${tenantId}/logo.${fileExt}`

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Fazer upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true, // Substituir se já existir
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      
      // Se o bucket não existir, tentar criar
      if (uploadError.message?.includes('not found')) {
        // Criar bucket
        const { error: bucketError } = await supabase.storage.createBucket('logos', {
          public: true,
        })
        
        if (bucketError && !bucketError.message?.includes('already exists')) {
          console.error('Bucket creation error:', bucketError)
          return NextResponse.json({ error: 'Erro ao criar storage' }, { status: 500 })
        }

        // Tentar upload novamente
        const { data: retryData, error: retryError } = await supabase.storage
          .from('logos')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          })

        if (retryError) {
          console.error('Retry upload error:', retryError)
          return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
      }
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName)

    // Adicionar timestamp para evitar cache
    const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`

    // Atualizar logo_url no tenant
    const { error: updateError } = await supabase
      .from('tenants')
      .update({ logo_url: urlWithTimestamp } as any)
      .eq('id', tenantId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar logo' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      url: urlWithTimestamp 
    })
  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { tenantId } = await request.json()

    // Verificar se o usuário tem acesso ao tenant
    if ((user as any).tenant_id !== tenantId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const supabase = createAdminClient() as any

    // Remover arquivo do storage (tentar com diferentes extensões)
    const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp']
    for (const ext of extensions) {
      await supabase.storage
        .from('logos')
        .remove([`${tenantId}/logo.${ext}`])
    }

    // Atualizar tenant para remover logo_url
    const { error: updateError } = await supabase
      .from('tenants')
      .update({ logo_url: null } as any)
      .eq('id', tenantId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Erro ao remover logo' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logo delete error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

