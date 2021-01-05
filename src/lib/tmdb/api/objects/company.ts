/* eslint-disable camelcase */
import { TmdbCompanyId } from '../id'

export interface Company {
	id: TmdbCompanyId;
	logo_path: string;
	name: string;
}
