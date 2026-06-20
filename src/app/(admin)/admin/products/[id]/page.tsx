'use client'

import { useParams } from 'next/navigation'
import AdminProductForm from '../ProductForm'

export default function EditProductPage() {
  const params = useParams()
  return <AdminProductForm productId={params.id as string} />
}
