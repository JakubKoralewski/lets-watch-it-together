import nodeFetch, {Response, RequestInit} from 'node-fetch'

export default async function fetchMock(
	url: string,
	options: RequestInit
): Promise<Response> {
	return await nodeFetch(
		`${process.env.NEXTAUTH_URL}${url}`,
		{
			...options,
			// https://stackoverflow.com/questions/34815845/how-to-send-cookies-with-node-fetch
			headers: {

			}
		}
	)

}