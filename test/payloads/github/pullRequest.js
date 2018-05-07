import { GITHUB_BOT_ID } from '../../../src/consts'

export const pullRequestOpenedStaging = {
  "action": "opened",
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

export const pullRequestOpenedMaster = {
  "action": "opened",
  "pull_request": {
    "url": "https://api.github.com/repos/test/test/pulls/1",
    "id": 34778301,
    "html_url": "https://github.com/test/test/pull/1",
		"issue_url": "https://api.github.com/repos/test/test/issues/1",
    "state": "open",
    "title": "Update the README with new information",
    "user": {
      "login": "Kyle-Mendes",
      "id": GITHUB_BOT_ID,
      "url": "https://api.github.com/users/Kyle-Mendes",
      "html_url": "https://github.com/Kyle-Mendes",
    },
    "body": "This is a pretty simple change that we need to pull into master. XYZ-2",
    "head": {
      "label": "Kyle-Mendes:changes",
      "ref": "feature-bugfix",
      "sha": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
      "user": {
        "login": "Kyle-Mendes",
        "id": GITHUB_BOT_ID,
        "url": "https://api.github.com/users/Kyle-Mendes",
        "html_url": "https://github.com/Kyle-Mendes",
      },
      "repo": {
        "id": 35129377,
        "name": "test/test",
        "full_name": "test/test",
        "owner": {
          "login": "Kyle-Mendes",
          "id": GITHUB_BOT_ID,
          "url": "https://api.github.com/users/Kyle-Mendes",
          "html_url": "https://github.com/Kyle-Mendes",
        },
        "html_url": "https://github.com/test/test",
        "url": "https://api.github.com/repos/test/test",
      }
    },
    "base": {
      "label": "Kyle-Mendes:master",
      "ref": "master",
      "sha": "9049f1265b7d61be4a8904a9a27120d2064dab3b",
      "user": {
        "login": "Kyle-Mendes",
        "id": GITHUB_BOT_ID,
        "url": "https://api.github.com/users/Kyle-Mendes",
        "html_url": "https://github.com/Kyle-Mendes",
      },
      "repo": {
        "id": 35129377,
        "name": "test/test",
        "full_name": "test/test",
        "owner": {
          "login": "Kyle-Mendes",
          "id": GITHUB_BOT_ID,
          "url": "https://api.github.com/users/Kyle-Mendes",
          "html_url": "https://github.com/Kyle-Mendes",
        },
        "html_url": "https://github.com/test/test",
        "url": "https://api.github.com/repos/test/test",
        "default_branch": "master"
      }
    },
  },
  "repository": {
    "id": 35129377,
    "name": "test/test",
    "full_name": "test/test",
    "private": false,
    "html_url": "https://github.com/test/test",
    "description": "",
    "fork": false,
    "url": "https://api.github.com/repos/test/test",
  },
}


export const pullRequestOpenedMasterDevops = {
  "action": "opened",
  "pull_request": {
    "url": "https://api.github.com/repos/test/test/pulls/1",
    "id": 34778301,
    "html_url": "https://github.com/test/test/pull/1",
		"issue_url": "https://api.github.com/repos/test/test/issues/1",
    "state": "open",
    "title": "Update the README with new information",
    "user": {
      "login": "reelio-devops",
      "id": GITHUB_BOT_ID,
      "url": "https://api.github.com/users/Kyle-Mendes",
      "html_url": "https://github.com/Kyle-Mendes",
    },
    "body": "This is a pretty simple change that we need to pull into master.",
    "head": {
      "label": "Kyle-Mendes:changes",
      "ref": "staging",
      "sha": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
      "user": {
        "login": "reelio-devops",
        "id": GITHUB_BOT_ID,
        "url": "https://api.github.com/users/Kyle-Mendes",
        "html_url": "https://github.com/Kyle-Mendes",
      },
      "repo": {
        "id": 35129377,
        "name": "test/test",
        "full_name": "test/test",
        "owner": {
          "login": "reelio-devops",
          "id": GITHUB_BOT_ID,
          "url": "https://api.github.com/users/Kyle-Mendes",
          "html_url": "https://github.com/Kyle-Mendes",
        },
        "html_url": "https://github.com/test/test",
        "url": "https://api.github.com/repos/test/test",
      }
    },
    "base": {
      "label": "Kyle-Mendes:master",
      "ref": "master",
      "sha": "9049f1265b7d61be4a8904a9a27120d2064dab3b",
      "user": {
        "login": "reelio-devops",
        "id": GITHUB_BOT_ID,
        "url": "https://api.github.com/users/Kyle-Mendes",
        "html_url": "https://github.com/Kyle-Mendes",
      },
      "repo": {
        "id": 35129377,
        "name": "test/test",
        "full_name": "test/test",
        "owner": {
          "login": "reelio-devops",
          "id": GITHUB_BOT_ID,
          "url": "https://api.github.com/users/Kyle-Mendes",
          "html_url": "https://github.com/Kyle-Mendes",
        },
        "html_url": "https://github.com/test/test",
        "url": "https://api.github.com/repos/test/test",
        "default_branch": "master"
      }
    },
  },
  "repository": {
    "id": 35129377,
    "name": "test/test",
    "full_name": "test/test",
    "private": false,
    "html_url": "https://github.com/test/test",
    "description": "",
    "fork": false,
    "url": "https://api.github.com/repos/test/test",
  },
}

export const pullRequestEdited = {
  "action": "edited",
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
    "body": "This is a pretty simple change that we need to pull into staging. XYZ-2 XYZ-3",
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

export const stagingMultiTicketsPR = {
  "action": "opened",
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
    "body": "This is a pretty simple change that we need to pull into staging. XYZ-2 XYZ-3",
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

export const pullRequestTicketless = {
  "action": "opened",
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
    "body": "This is a pretty simple change that we need to pull into staging",
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

export const pullRequestFeatureless = {
  "action": "opened",
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
    "body": "This is a pretty simple change that we need to pull into staging XYZ-2",
    "head": {
      "label": "Kyle-Mendes:changes",
      "ref": "changes",
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

export const ticketAndFeatureless = {
  "action": "opened",
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
    "body": "This is a pretty simple change that we need to pull into staging",
    "head": {
      "label": "Kyle-Mendes:changes",
      "ref": "changes",
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

export const pullRequestMultiTickets = {
  "action": "opened",
  "number": 1,
	"repository": {
		"full_name": "test/test",
	},
  "pull_request": {
		"body": "This is a pretty simple change that we need to pull into staging. XYZ-3 XYZ-2",
    "url": "https://api.github.com/repos/test/test/pulls/1",
		"issue_url": "https://api.github.com/repos/test/test/issues/1",
    "head": {
      "sha": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
      "repo": {
        "url": "https://api.github.com/repos/test/test",
			}
    },
  },
}

export const pullRequestMultiTicketsUnapproved = {
  "action": "opened",
  "number": 1,
	"repository": {
		"full_name": "test/test",
	},
  "pull_request": {
		"body": "This is a pretty simple change that we need to pull into staging. XYZ-5 XYZ-2",
    "url": "https://api.github.com/repos/test/test/pulls/1",
		"issue_url": "https://api.github.com/repos/test/test/issues/1",
    "head": {
      "sha": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
      "repo": {
        "url": "https://api.github.com/repos/test/test",
			}
    },
  },
}

export const pullRequestBadAction = {
  "action": "closed",
	"repository": {
		"full_name": "test/test",
	},
	"pull_request": {
		"user": "test",
		"base": {
			"ref": "test",
		},
	},
}

export const pullRequestMergedStaging = {
	"action": "closed",
	"pull_request": {
		"url": "https://api.github.com/repos/test/test/pulls/1",
		"id": 34778301,
		"html_url": "https://github.com/test/test/pull/1",
		"issue_url": "https://api.github.com/repos/test/test/issues/1",
		"state": "open",
		"merged_at": "2016-10-03T23:39:09Z",
		"title": "Update the README with new information",
		"user": {
			"login": "Kyle-Mendes",
			"id": 7416637,
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

export const pullRequestMergedMaster = {
	"action": "closed",
	"pull_request": {
		"url": "https://api.github.com/repos/test/test/pulls/1",
		"id": 34778301,
		"html_url": "https://github.com/test/test/pull/1",
		"issue_url": "https://api.github.com/repos/test/test/issues/1",
		"state": "open",
		"merged_at": "2016-10-03T23:39:09Z",
		"title": "Update the README with new information",
		"user": {
			"login": "Kyle-Mendes",
			"id": 6400039,
			"url": "https://api.github.com/users/Kyle-Mendes",
			"html_url": "https://github.com/Kyle-Mendes",
		},
		"body": "This is a pretty simple change that we need to pull into staging. XYZ-2, XYZ-3",
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
				"default_branch": "master"
			}
		},
		"base": {
			"label": "Kyle-Mendes:staging",
			"ref": "master",
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
				"default_branch": "master"
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

export const singlePull = [{
		"repository": {
			"url": "https://api.github.com/users/test/test",
		},
		"head": {
			"ref": "schema-test-1"
		},
		"base": {
			"ref": "feature-test-2"
		},
		"url": "https://api.github.com/repos/test/test/pulls/1",
}]

export const multiplePulls =
[
	{
		"repository": {
			"url": "https://api.github.com/users/test/test",
		},
		"url": "https://api.github.com/repos/test/test/pulls/1",
	},
	{
		"repository": {
			"url": "https://api.github.com/users/test/test",
		},
		"url": "https://api.github.com/repos/test/test/pulls/2",
	},
]

export const pullRequestWithConflicts = {
	"mergeable_state": "dirty",
	"number": 123,
	"html_url": "https://api.github.com/repos/test/test/pulls/1",
	"issue_url": "https://api.github.com/repos/test/test/issues/1",
	"user": {
		"id": 7416637,
	},
}

export const pullRequestWithConflicts2 = {
	"mergeable_state": "dirty",
	"number": 123,
	"html_url": "https://api.github.com/repos/test/test/pulls/2",
	"issue_url": "https://api.github.com/repos/test/test/issues/2",
	"user": {
		"id": 7416637,
	},
}

export const pullRequestMergeable = {
	"mergeable_state": "clean",
	"issue_url": "https://api.github.com/repos/test/test/issues/1",

}
