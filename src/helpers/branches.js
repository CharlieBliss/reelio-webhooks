import rp from 'request-promise'

import Github from './github'
import { githubApiBase } from '../consts/api'

class Branches {
	getBranch(project, name) {
		return rp(Github.get(`${githubApiBase}/repos/${project}/branches/${name}`))
	}

	/**
	 * @param project {string} The project, e.g. "hangarunderground/reelio"
	 * @param ref     {string} The ref for the new branch e.g. feature-ra-123
	 * @param sha     {string} The sha to be branched from
	 *
	 * @returns {Promise}
	 */
	createBranch(project, ref, sha) {
		const payload = {
			sha,
			ref: `refs/heads/${ref}`,
		}

		return rp(Github.post(`https://api.github.com/repos/${project}/git/refs`, payload))
	}

	deleteBranch() {}
}

export default new Branches()
