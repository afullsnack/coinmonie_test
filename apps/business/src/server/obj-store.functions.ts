import { env } from "#/env"
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"
import { createServerFn } from "@tanstack/react-start";
import z from "zod";


export const bucket = env.R2_BUCKET || '';

export const r2 = new S3Client({
	region: "auto",
	endpoint: `https://${env.R2_ACCOUNT_ID || ''}.r2.cloudflarestorage.com`,
	credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: env.R2_SECRET_ACCESS_KEY || '',
  },
})


const UPLOAD_KEY = `uploads`
export const getUploadUrl = createServerFn({ method: "POST" })
	.validator(z.object({
		filename: z.string().min(1),
		contentType: z.string().min(1),
		category: z.string().optional(),
	}))
	.handler(async ({data}) => {
		const key = `${UPLOAD_KEY}/${data.category || 'default'}/${data.filename}-${crypto.randomUUID().substring(0, 12)}`

		const url = await getSignedUrl(
			r2,
			new PutObjectCommand({
				Bucket: env.R2_BUCKET,
				Key: key,
				ContentType: data.contentType,
			}),
			{ expiresIn: 600 } // 10 minutes
		)

		return {url, key}
	})

export const getDownloadUrl = createServerFn({ method: "POST" })
	.validator(z.object({
		key: z.string(),
	}))
	.handler(async ({data}) => {
		// Authorize: confirm this user may read this key before signing.
    const url = await getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: bucket, Key: data.key }),
      { expiresIn: 3600 }, // 1 hour TODO: look into setting dynamic `exp` based on the category the key is in
    );
    return { url };
	})
