import { env } from '#/env'
import { getDownloadUrl, getUploadUrl } from '#/server/obj-store.functions'
import { mutationOptions, useMutation } from '@tanstack/react-query'

const uploadOptions = mutationOptions({
  mutationKey: ['file:upload-ack'],
  mutationFn: async ({
    file,
    category,
  }: {
    file: File
    category?: `default` | string
  }) => {
    // 1. Ask our server for a signed URL
    const { url, key } = await getUploadUrl({
      data: { filename: file.name, contentType: file.type, category },
    })

    // 2. Upload the bytes directly to R2
    // TOOD: update fetch function with better-fetch
    const res = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    if (!res.ok) throw new Error('Upload failed')

    return { key }
  },
})

const downloadOptions = mutationOptions({
	mutationKey: ['file:read-ack'],
	mutationFn: async ({ key }: { key: string }) =>
		await getDownloadUrl({ data: { key } })
})

type PropType = {category?: string}
export function useFile(props: PropType) {
	const upload = useMutation(uploadOptions)
  const download = useMutation(downloadOptions)

  const handleFileUpload = async (file: File) => {
    const { key } = await upload.mutateAsync({
			file,
      category: props.category
    })
    // 3. Persist `key` in your DB against the user/record
    return key
	}

	const handleFileRead = async (key: string, accessType: "public" | "private" = "private") => {
		if (accessType === "public") {
			return {url: `${env.VITE_R2_PUBLIC_URL}/${key}`}
		}
		return await download.mutateAsync({key})
	}

  return {
		handleFileUpload,
		handleFileRead,
		isUploading: upload.isPending,
		isDownloading: download.isPending,
		uploadError: upload.error,
    downloadError: download.error,
  }
}
