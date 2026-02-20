import {useClient} from 'sanity'
import {CopyIcon} from '@sanity/icons'
import {useCallback, useState} from 'react'
import type {DocumentActionComponent} from 'sanity'

export const duplicateAction: DocumentActionComponent = (props) => {
  const {type, draft, published} = props
  const client = useClient({apiVersion: '2025-01-01'})
  const [isRunning, setIsRunning] = useState(false)

  const onHandle = useCallback(async () => {
    const source = draft || published
    if (!source) return

    setIsRunning(true)
    try {
      const newId = crypto.randomUUID().replace(/-/g, '').slice(0, 24)

      // Clone the document, strip system fields
      const {_id, _rev, _createdAt, _updatedAt, ...rest} = source as any

      const newDoc = {
        ...rest,
        _id: `drafts.${newId}`,
        _type: type,
      }

      // Append "(másolat)" to name field
      if (newDoc.name) {
        newDoc.name = `${newDoc.name} (másolat)`
      }

      // Generate a new slug if present
      if (newDoc.slug?.current) {
        newDoc.slug = {
          ...newDoc.slug,
          current: `${newDoc.slug.current}-masolat-${newId.slice(0, 6)}`,
        }
      }

      // Clear SKU suffix to avoid duplicates
      if (newDoc.sku) {
        newDoc.sku = `${newDoc.sku}-COPY`
      }

      await client.create(newDoc)

      alert(`"${newDoc.name}" létrehozva vázlatként!`)
    } catch (err: any) {
      alert(`Hiba a duplikálás során: ${err.message}`)
    } finally {
      setIsRunning(false)
    }
  }, [client, draft, published, type])

  return {
    label: isRunning ? 'Duplikálás...' : 'Duplikálás',
    icon: CopyIcon,
    disabled: isRunning || (!draft && !published),
    onHandle,
  }
}
