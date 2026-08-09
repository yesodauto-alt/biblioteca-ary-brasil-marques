import pb from '@/lib/pocketbase/client'

export async function getExistingCadastroNumbers(collection: string): Promise<Set<string>> {
  const records = await pb.collection(collection).getFullList({ fields: 'numero_cadastro' })
  return new Set(records.map((r: any) => r.numero_cadastro))
}

export async function createImportedRecord(
  collection: string,
  data: Record<string, any>,
): Promise<boolean> {
  try {
    await pb.collection(collection).create(data)
    return true
  } catch {
    return false
  }
}
