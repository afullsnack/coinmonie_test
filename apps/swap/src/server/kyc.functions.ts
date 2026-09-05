import { env } from '#/env'
import { betterFetch } from '@better-fetch/fetch'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {format} from "date-fns"

interface IDCheckResponse<T> {
	success: boolean;
	data: T | null;
	error: any | null;
	request_id: string
	timestamp?: string
}

interface KYCVerificationResponse {
	verdict: string;
	api_type: string;
	session_id: string;
	cost_kobo: string;
	environment: string;
	data: {
		match_confidence: number | string;
	};
	call_id: string;
}

interface LicenseInput {
	licence_number: string;
	date_of_birth: string;
	selfie_image: string;
	subject_reference?: string;
}

interface PassportInput {
	passport_number: string;
	date_of_birth: string;
	selfie_image: string;
	subject_reference?: string
}

interface NINInput {
	nin: string;
	selfie_image: string
	subject_reference?: string;
}

interface BVNInput {
	bvn: string;
	selfie_image: string;
	subject_reference?: string;
}

type BodyInput = BVNInput | NINInput | PassportInput | LicenseInput

const inputSchema = z.object({
	idType: z.enum(['bvn', 'nin', 'passport', 'drivers-license']),
	idNumber: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	gender: z.enum(['male', 'female']),
	nationality: z.string().default('nigeria'),
	dob: z.string(),
	phone: z.string().startsWith('+'),
	email: z.string(),
	imageUrl: z.string(),
});
export type KYCInputSchema = z.infer<typeof inputSchema>

export const verifyKYC = createServerFn({ method: 'POST' }).validator(
	inputSchema,
).handler(async ({ data }) => {
	const apiUrl = `${env.ID_CHECK_API_URL}/v1`
	const body = buildRequestBody(data)

	const { data: response, error } = await betterFetch<IDCheckResponse<KYCVerificationResponse>>(`${apiUrl}/identity/bvn/advance`, {
		method: "post",
		headers: {
			"content-type": "application/json",
			authorization: `Bearer ${env.ID_CHECK_SK}`,
			"Idempotency-Key": crypto.randomUUID()
		},
		body: {
			...body,
			subject_reference: crypto.randomUUID()
		}
	})

	if (error) {
		console.log(`Failed to verify KYC data`, { error })
		throw error;
	}

	console.log(`Response from verification`, {response})

	if (!response.success) {
		console.log(`Failed to verify KYC data`, { error: response.error })
		throw new Error(`Failed to verify KYC data`, {cause: response.error})
	}

	// TODO: Persist to DB after matching verification

	return response
})


function buildRequestBody(data: KYCInputSchema): BodyInput {
	const formattedDOB = format(new Date(data.dob), "yyyy-MM-dd")
	console.log(`Formatted DOB`, {formattedDOB})
	switch (data.idType) {
		case "bvn":
			return {
				bvn: data.idNumber,
				selfie_image: data.imageUrl,
			}
		case "nin":
			return {
				nin: data.idNumber,
				selfie_image: data.imageUrl,
			}
		case "passport":
			return {
				passport_number: data.idNumber,
				date_of_birth: formattedDOB, // TOOD: transform dob into YYYY-MM-DD format
				selfie_image: data.imageUrl,
			}
		case "drivers-license":
			return {
				licence_number: data.idNumber,
				date_of_birth: formattedDOB,
				selfie_image: data.imageUrl,
			}
		default:
			throw new Error(`No valid ID type to compute request body: (bvn|nin|passport|drivers-license)`)
	}
}
