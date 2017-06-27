export const masterPR = JSON.stringify([
  {
    "body": "I'm having a problem with this.",
    "repository": {
      "html_url": "https://github.com/octocat/Hello-World",
			"full_name": "test/test",
		}
  }
])

export const genericIssue = JSON.stringify([
  {
    "body": "I'm having a problem with this.",
    "repository": {
      "html_url": "https://github.com/octocat/Hello-World",
			"full_name": "test/test",
		}
  }
])

export const approvedIssue = JSON.stringify([
	{
		"body": "I'm having a problem with this.",
		"repository": {
			"html_url": "https://github.com/octocat/Hello-World",
			"full_name": "test/test",
		},
		"labels": ['approved']
	}
])
