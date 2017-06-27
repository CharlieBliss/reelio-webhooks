export const failure = JSON.stringify(
	{
		"repository": {
			"html_url": "https://github.com/test/test",
			"full_name": "test/test",
		},
	  "name": "test/test",
	  "context": "ci/circleci",
	  "state": "failure",
		"commit":
		{
			"author": { "id": '6400039' },
			"html_url": "https://github.com/test/test/commit/9049f1265b7d61be4a8904a9a27120d2064dab3b",
		},
	})

export const success = JSON.stringify(
	{
	  "name": "test/test",
		"repository": {
			"html_url": "https://github.com/test/test",
			"full_name": "test/test",
		},
	  "context": "ci/circleci",
	  "state": "success",
		"commit":
		{
			"author": { "id": '6400039' },
			"html_url": "https://github.com/test/test/commit/9049f1265b7d61be4a8904a9a27120d2064dab3b",
		},
	})

export const qaCircleSuccess = JSON.stringify(
	{
		state: 'success',
		description: 'All tickets marked as complete.',
		context: 'ci/qa-team',
	}
)

export const qaWaitingOn2 = JSON.stringify(
	{
		state: 'failure',
		description: 'Waiting on two tickets to be marked as "done".',
		context: 'ci/qa-team',
	}
)

export const qaWaitingOn1 = JSON.stringify(
	{
		state: 'success',
		description: 'Waiting on 1 ticket to be marked as "done".',
		context: 'ci/qa-team',
	}
)
