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
  "action":"unlabeled",
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
