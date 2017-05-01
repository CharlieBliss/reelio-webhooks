export const event = "label"

export const addWIP = {
  "action":"labeled",
  "label":{
    "name":"WIP",
    "color":"ff0000"
  },
	"pull_request": {
		"issue_url": "https://api.github.com/repos/Kyle-Mendes/public-repo/issues/1",
	}
}

export const removeWIP = {
  "action":"unlabeled",
  "label":{
    "name":"WIP",
    "color":"ff0000"
  },
	"pull_request": {
	"issue_url": "https://api.github.com/repos/Kyle-Mendes/public-repo/issues/1",
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
	"url": 'https://api.github.com/repos/Kyle-Mendes/public-repo/pulls/2',
	"issue_url": "https://api.github.com/repos/Kyle-Mendes/public-repo/issues/1",
	},
}
