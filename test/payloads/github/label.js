export const event = "label"

export const addWIP = {
  "action":"labeled",
  "label":{
    "name":"WIP",
    "color":"ff0000"
  },
	"pull_request": {
		"issue_url": "https://api.github.com/repos/test/test/issues/1",
	},
	"repository": {
		"full_name": "test/test",
	},
}

export const removeWIP = {
	"action": "unlabeled",
	"label":{
		"name":"WIP",
		"color":"ff0000"
	},
	"pull_request": {
    "url": "https://api.github.com/repos/test/test/pulls/1",
    "id": 34778301,
    "html_url": "https://github.com/test/test/pull/1",
		"issue_url": "https://api.github.com/repos/test/test/issues/1",
    "state": "open",
    "title": "Update the README with new information",
    "user": {
      "login": "Kyle-Mendes",
      "id": 6752317,
      "url": "https://api.github.com/users/Kyle-Mendes",
      "html_url": "https://github.com/Kyle-Mendes",
    },
    "body": "This is a pretty simple change that we need to pull into staging. XYZ-2",
    "head": {
      "label": "Kyle-Mendes:changes",
      "ref": "feature-changes",
      "sha": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
      "user": {
        "login": "Kyle-Mendes",
        "id": 6752317,
        "url": "https://api.github.com/users/Kyle-Mendes",
        "html_url": "https://github.com/Kyle-Mendes",
      },
      "repo": {
        "id": 35129377,
        "name": "test/test",
        "full_name": "test/test",
        "owner": {
          "login": "Kyle-Mendes",
          "id": 6752317,
          "url": "https://api.github.com/users/Kyle-Mendes",
          "html_url": "https://github.com/Kyle-Mendes",
        },
        "html_url": "https://github.com/test/test",
        "description": "",
        "url": "https://api.github.com/repos/test/test",
        "default_branch": "staging"
      }
    },
    "base": {
      "label": "Kyle-Mendes:staging",
      "ref": "staging",
      "sha": "9049f1265b7d61be4a8904a9a27120d2064dab3b",
      "user": {
        "login": "Kyle-Mendes",
        "id": 6752317,
        "url": "https://api.github.com/users/Kyle-Mendes",
        "html_url": "https://github.com/Kyle-Mendes",
      },
      "repo": {
        "id": 35129377,
        "name": "test/test",
        "full_name": "test/test",
        "owner": {
          "login": "Kyle-Mendes",
          "id": 6752317,
          "url": "https://api.github.com/users/Kyle-Mendes",
          "html_url": "https://github.com/Kyle-Mendes",
        },
        "html_url": "https://github.com/test/test",
        "url": "https://api.github.com/repos/test/test",
        "default_branch": "staging"
      }
    },
  },
  "repository": {
    "id": 35129377,
    "name": "test/test",
    "full_name": "test/test",
    "owner": {
      "login": "Kyle-Mendes",
      "id": 6752317,
      "url": "https://api.github.com/users/Kyle-Mendes",
      "html_url": "https://github.com/Kyle-Mendes",
    },
    "html_url": "https://github.com/test/test",
    "url": "https://api.github.com/repos/test/test",
  },
}

export const removeChanges = {
  "action":"unlabeled",
  "label":{
    "name":"changes requested",
    "color":"ff0000"
  },
	"pull_request": {
	"user": {
		"id": "7416637",
	},
	"repository": {
		"full_name": "test/test",
	},
	"url": 'https://api.github.com/repos/test/test/pulls/1',
	"issue_url": "https://api.github.com/repos/test/test/issues/1",
	},
}
