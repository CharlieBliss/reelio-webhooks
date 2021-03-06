/* eslint-disable */

export const event = 'pull_request_review'
export const approved = JSON.stringify({
	"action": "submitted",
	"review": {
		"id": 2626884,
		"user": {
			"login": "Kyle-Mendes",
			"id": 6752317,
		},
		"body": "Looks great!",
		"submitted_at": "2016-10-03T23:39:09Z",
		"state": "approved",
		"html_url": "https://github.com/test/test/pull/1#pullrequestreview-2626884",
		"pull_request_url": "https://api.github.com/repos/test/test/pulls/1",
	},
	"pull_request": {
		"url": "https://api.github.com/repos/test/test/pulls/1",
		"issue_url": "https://api.github.com/repos/test/test/issues/1",
		"html_url": "https://github.com/repos/test/test/pulls/1",
		"id": 87811438,
		"number": 8,
		"state": "open",
		"locked": false,
		"title": "Add a README description",
		"user": {
			"login": "Kyle-Mendes",
			"id": 6400039,
			"avatar_url": "https://avatars.githubusercontent.com/u/2546?v=3",
			"gravatar_id": "",
			"url": "https://api.github.com/users/Kyle-Mendes",
			"type": "User",
			"site_admin": true
		},
		"body": "Just a few more details",
		"created_at": "2016-10-03T23:37:43Z",
		"updated_at": "2016-10-03T23:39:09Z",
		"closed_at": null,
		"merged_at": null,
		"merge_commit_sha": "faea154a7decef6819754aab0f8c0e232e6c8b4f",
		"assignee": null,
		"assignees": [],
		"milestone": null,
		"head": {
			"label": "Kyle-Mendes:patch-2",
			"ref": "patch-2",
			"sha": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
			"user": {
				"login": "Kyle-Mendes",
				"id": 2546,
				"avatar_url": "https://avatars.githubusercontent.com/u/2546?v=3",
				"gravatar_id": "",
				"url": "https://api.github.com/users/Kyle-Mendes",
				"type": "User",
				"site_admin": true
			},
			"repo": {
				"id": 69919152,
				"name": "test/test",
				"full_name": "test/test",
				"owner": {
					"login": "Kyle-Mendes",
					"id": 2546,
					"avatar_url": "https://avatars.githubusercontent.com/u/2546?v=3",
					"gravatar_id": "",
					"type": "User",
					"site_admin": true
				},
				"private": false,
				"html_url": "https://github.com/test/test",
				"description": null,
				"fork": true,
				"url": "https://api.github.com/repos/test/test",
				"created_at": "2016-10-03T23:23:31Z",
				"updated_at": "2016-08-15T17:19:01Z",
				"pushed_at": "2016-10-03T23:36:52Z",
				"git_url": "git://github.com/test/test.git",
				"ssh_url": "git@github.com:test/test.git",
				"clone_url": "https://github.com/test/test.git",
				"svn_url": "https://github.com/test/test",
				"homepage": null,
				"size": 233,
				"stargazers_count": 0,
				"watchers_count": 0,
				"language": null,
				"has_issues": false,
				"has_downloads": true,
				"has_wiki": true,
				"has_pages": false,
				"forks_count": 0,
				"mirror_url": null,
				"open_issues_count": 0,
				"forks": 0,
				"open_issues": 0,
				"watchers": 0,
				"default_branch": "master"
			}
		},
		"base": {
			"label": "Kyle-Mendes:master",
			"ref": "staging",
			"sha": "9049f1265b7d61be4a8904a9a27120d2064dab3b",
			"user": {
				"login": "Kyle-Mendes",
				"id": 6752317,
				"avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
				"gravatar_id": "",
				"url": "https://api.github.com/users/Kyle-Mendes",
				"type": "User",
				"site_admin": false
			},
			"repo": {
				"id": 35129377,
				"name": "test/test",
				"full_name": "test/test",
				"owner": {
					"login": "Kyle-Mendes",
					"id": 6752317,
					"avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
					"gravatar_id": "",
					"url": "https://api.github.com/users/Kyle-Mendes",
					"type": "User",
					"site_admin": false
				},
				"private": false,
				"html_url": "https://github.com/test/test",
				"description": "",
				"fork": false,
				"url": "https://api.github.com/repos/test/test",
				"created_at": "2015-05-05T23:40:12Z",
				"updated_at": "2016-08-15T17:19:01Z",
				"pushed_at": "2016-10-03T23:37:43Z",
				"git_url": "git://github.com/test/test.git",
				"ssh_url": "git@github.com:test/test.git",
				"clone_url": "https://github.com/test/test.git",
				"svn_url": "https://github.com/test/test",
				"homepage": null,
				"size": 233,
				"stargazers_count": 2,
				"watchers_count": 2,
				"language": null,
				"has_issues": true,
				"has_downloads": true,
				"has_wiki": true,
				"has_pages": true,
				"forks_count": 2,
				"mirror_url": null,
				"open_issues_count": 5,
				"forks": 2,
				"open_issues": 5,
				"watchers": 2,
				"default_branch": "master"
			}
		},
	},
	"repository": {
		"html_url": "https://github.com/test/test",
		"full_name": "test/test",
	},
})

export const denied = JSON.stringify({
	"action": "submitted",
	"repository": {
		"html_url": "https://github.com/test/test",
		"full_name": "test/test",
	},
	"review": {
		"id": 2626884,
		"user": {
			"login": "Kyle-Mendes",
			"id": 6752317,
		},
		"body": "Looks terrible!",
		"submitted_at": "2016-10-03T23:39:09Z",
		"state": "changes_requested",
		"html_url": "https://github.com/test/test/pull/1#pullrequestreview-2626884",
		"pull_request_url": "https://api.github.com/repos/test/test/pulls/1",
	},
	"pull_request": {
		"url": "https://api.github.com/repos/test/test/pulls/1",
		"issue_url": "https://api.github.com/repos/test/test/issues/1",
		"id": 87811438,
		"number": 8,
		"state": "open",
		"locked": false,
		"title": "Add a README description",
		"user": {
			"login": "Kyle-Mendes",
			"id": 6400039,
			"avatar_url": "https://avatars.githubusercontent.com/u/2546?v=3",
			"gravatar_id": "",
			"url": "https://api.github.com/users/Kyle-Mendes",
			"type": "User",
			"site_admin": true
		},
		"body": "Just a few more details",
		"created_at": "2016-10-03T23:37:43Z",
		"updated_at": "2016-10-03T23:39:09Z",
		"closed_at": null,
		"merged_at": null,
		"merge_commit_sha": "faea154a7decef6819754aab0f8c0e232e6c8b4f",
		"assignee": null,
		"assignees": [],
		"milestone": null,
		"head": {
			"label": "Kyle-Mendes:patch-2",
			"ref": "patch-2",
			"sha": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
			"user": {
				"login": "Kyle-Mendes",
				"id": 2546,
				"avatar_url": "https://avatars.githubusercontent.com/u/2546?v=3",
				"gravatar_id": "",
				"url": "https://api.github.com/users/Kyle-Mendes",
				"type": "User",
				"site_admin": true
			},
			"repo": {
				"id": 69919152,
				"name": "test/test",
				"full_name": "test/test",
				"owner": {
					"login": "Kyle-Mendes",
					"id": 2546,
					"avatar_url": "https://avatars.githubusercontent.com/u/2546?v=3",
					"gravatar_id": "",
					"type": "User",
					"site_admin": true
				},
				"private": false,
				"html_url": "https://github.com/test/test",
				"description": null,
				"fork": true,
				"url": "https://api.github.com/repos/test/test",
				"created_at": "2016-10-03T23:23:31Z",
				"updated_at": "2016-08-15T17:19:01Z",
				"pushed_at": "2016-10-03T23:36:52Z",
				"git_url": "git://github.com/test/test.git",
				"ssh_url": "git@github.com:test/test.git",
				"clone_url": "https://github.com/test/test.git",
				"svn_url": "https://github.com/test/test",
				"homepage": null,
				"size": 233,
				"stargazers_count": 0,
				"watchers_count": 0,
				"language": null,
				"has_issues": false,
				"has_downloads": true,
				"has_wiki": true,
				"has_pages": false,
				"forks_count": 0,
				"mirror_url": null,
				"open_issues_count": 0,
				"forks": 0,
				"open_issues": 0,
				"watchers": 0,
				"default_branch": "master"
			}
		},
		"base": {
			"label": "Kyle-Mendes:master",
			"ref": "staging",
			"sha": "9049f1265b7d61be4a8904a9a27120d2064dab3b",
			"user": {
				"login": "Kyle-Mendes",
				"id": 6752317,
				"avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
				"gravatar_id": "",
				"url": "https://api.github.com/users/Kyle-Mendes",
				"type": "User",
				"site_admin": false
			},
			"repo": {
				"id": 35129377,
				"name": "test/test",
				"full_name": "test/test",
				"owner": {
					"login": "Kyle-Mendes",
					"id": 6752317,
					"avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
					"gravatar_id": "",
					"url": "https://api.github.com/users/Kyle-Mendes",
					"type": "User",
					"site_admin": false
				},
				"private": false,
				"html_url": "https://github.com/test/test",
				"description": "",
				"fork": false,
				"url": "https://api.github.com/repos/test/test",
				"created_at": "2015-05-05T23:40:12Z",
				"updated_at": "2016-08-15T17:19:01Z",
				"pushed_at": "2016-10-03T23:37:43Z",
				"git_url": "git://github.com/test/test.git",
				"ssh_url": "git@github.com:test/test.git",
				"clone_url": "https://github.com/test/test.git",
				"svn_url": "https://github.com/test/test",
				"homepage": null,
				"size": 233,
				"stargazers_count": 2,
				"watchers_count": 2,
				"language": null,
				"has_issues": true,
				"has_downloads": true,
				"has_wiki": true,
				"has_pages": true,
				"forks_count": 2,
				"mirror_url": null,
				"open_issues_count": 5,
				"forks": 2,
				"open_issues": 5,
				"watchers": 2,
				"default_branch": "master"
			}
		},
	},
})

export const noAction = JSON.stringify({
	"action": null,
	"repository": {
		"html_url": "https://github.com/test/test",
		"full_name": "test/test",
	},
	"review": {
		"id": 2626884,
		"user": {
			"login": "Kyle-Mendes",
			"id": 6752317,
		},
	}
})

export const reviewComment = {
  "action": "created",
  "comment": {
    "url": "https://api.github.com/repos/test/test/pulls/comments/29724692",
    "id": 29724692,
    "diff_hunk": "@@ -1 +1 @@\n-# test/test",
    "path": "README.md",
    "position": 1,
    "original_position": 1,
    "commit_id": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
    "original_commit_id": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
    "user": {
      "login": "Kyle-Mendes",
      "id": 6752317,
      "avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
      "gravatar_id": "",
      "url": "https://api.github.com/users/Kyle-Mendes",
      "html_url": "https://github.com/Kyle-Mendes",
      "followers_url": "https://api.github.com/users/Kyle-Mendes/followers",
      "following_url": "https://api.github.com/users/Kyle-Mendes/following{/other_user}",
      "gists_url": "https://api.github.com/users/Kyle-Mendes/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/Kyle-Mendes/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/Kyle-Mendes/subscriptions",
      "organizations_url": "https://api.github.com/users/Kyle-Mendes/orgs",
      "repos_url": "https://api.github.com/users/Kyle-Mendes/repos",
      "events_url": "https://api.github.com/users/Kyle-Mendes/events{/privacy}",
      "received_events_url": "https://api.github.com/users/Kyle-Mendes/received_events",
      "type": "User",
      "site_admin": false
    },
    "body": "Maybe you should use more emojji on this line.",
    "created_at": "2015-05-05T23:40:27Z",
    "updated_at": "2015-05-05T23:40:27Z",
    "html_url": "https://github.com/test/test/pull/1#discussion_r29724692",
    "pull_request_url": "https://api.github.com/repos/test/test/pulls/1",
    "_links": {
      "self": {
        "href": "https://api.github.com/repos/test/test/pulls/comments/29724692"
      },
      "html": {
        "href": "https://github.com/test/test/pull/1#discussion_r29724692"
      },
      "pull_request": {
        "href": "https://api.github.com/repos/test/test/pulls/1"
      }
    }
  },
  "pull_request": {
    "url": "https://api.github.com/repos/test/test/pulls/1",
    "id": 34778301,
    "html_url": "https://github.com/test/test/pull/1",
    "diff_url": "https://github.com/test/test/pull/1.diff",
    "patch_url": "https://github.com/test/test/pull/1.patch",
    "issue_url": "https://api.github.com/repos/test/test/issues/1",
    "number": 1,
    "state": "open",
    "locked": false,
    "title": "Update the README with new information",
    "user": {
      "login": "Kyle-Mendes",
      "id": 6752317,
      "avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
      "gravatar_id": "",
      "url": "https://api.github.com/users/Kyle-Mendes",
      "html_url": "https://github.com/Kyle-Mendes",
      "followers_url": "https://api.github.com/users/Kyle-Mendes/followers",
      "following_url": "https://api.github.com/users/Kyle-Mendes/following{/other_user}",
      "gists_url": "https://api.github.com/users/Kyle-Mendes/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/Kyle-Mendes/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/Kyle-Mendes/subscriptions",
      "organizations_url": "https://api.github.com/users/Kyle-Mendes/orgs",
      "repos_url": "https://api.github.com/users/Kyle-Mendes/repos",
      "events_url": "https://api.github.com/users/Kyle-Mendes/events{/privacy}",
      "received_events_url": "https://api.github.com/users/Kyle-Mendes/received_events",
      "type": "User",
      "site_admin": false
    },
    "body": "This is a pretty simple change that we need to pull into master.",
    "created_at": "2015-05-05T23:40:27Z",
    "updated_at": "2015-05-05T23:40:27Z",
    "closed_at": null,
    "merged_at": null,
    "merge_commit_sha": "18721552ba489fb84e12958c1b5694b5475f7991",
    "assignee": null,
    "milestone": null,
    "commits_url": "https://api.github.com/repos/test/test/pulls/1/commits",
    "review_comments_url": "https://api.github.com/repos/test/test/pulls/1/comments",
    "review_comment_url": "https://api.github.com/repos/test/test/pulls/comments{/number}",
    "comments_url": "https://api.github.com/repos/test/test/issues/1/comments",
    "statuses_url": "https://api.github.com/repos/test/test/statuses/0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
    "head": {
      "label": "Kyle-Mendes:changes",
      "ref": "changes",
      "sha": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
      "user": {
        "login": "Kyle-Mendes",
        "id": 6752317,
        "avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/Kyle-Mendes",
        "html_url": "https://github.com/Kyle-Mendes",
        "followers_url": "https://api.github.com/users/Kyle-Mendes/followers",
        "following_url": "https://api.github.com/users/Kyle-Mendes/following{/other_user}",
        "gists_url": "https://api.github.com/users/Kyle-Mendes/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/Kyle-Mendes/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/Kyle-Mendes/subscriptions",
        "organizations_url": "https://api.github.com/users/Kyle-Mendes/orgs",
        "repos_url": "https://api.github.com/users/Kyle-Mendes/repos",
        "events_url": "https://api.github.com/users/Kyle-Mendes/events{/privacy}",
        "received_events_url": "https://api.github.com/users/Kyle-Mendes/received_events",
        "type": "User",
        "site_admin": false
      },
      "repo": {
        "id": 35129377,
        "name": "test/test",
        "full_name": "test/test",
        "owner": {
          "login": "Kyle-Mendes",
          "id": 6752317,
          "avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
          "gravatar_id": "",
          "url": "https://api.github.com/users/Kyle-Mendes",
          "html_url": "https://github.com/Kyle-Mendes",
          "followers_url": "https://api.github.com/users/Kyle-Mendes/followers",
          "following_url": "https://api.github.com/users/Kyle-Mendes/following{/other_user}",
          "gists_url": "https://api.github.com/users/Kyle-Mendes/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/Kyle-Mendes/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/Kyle-Mendes/subscriptions",
          "organizations_url": "https://api.github.com/users/Kyle-Mendes/orgs",
          "repos_url": "https://api.github.com/users/Kyle-Mendes/repos",
          "events_url": "https://api.github.com/users/Kyle-Mendes/events{/privacy}",
          "received_events_url": "https://api.github.com/users/Kyle-Mendes/received_events",
          "type": "User",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/test/test",
        "description": "",
        "fork": false,
        "url": "https://api.github.com/repos/test/test",
        "forks_url": "https://api.github.com/repos/test/test/forks",
        "keys_url": "https://api.github.com/repos/test/test/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/test/test/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/test/test/teams",
        "hooks_url": "https://api.github.com/repos/test/test/hooks",
        "issue_events_url": "https://api.github.com/repos/test/test/issues/events{/number}",
        "events_url": "https://api.github.com/repos/test/test/events",
        "assignees_url": "https://api.github.com/repos/test/test/assignees{/user}",
        "branches_url": "https://api.github.com/repos/test/test/branches{/branch}",
        "tags_url": "https://api.github.com/repos/test/test/tags",
        "blobs_url": "https://api.github.com/repos/test/test/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/test/test/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/test/test/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/test/test/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/test/test/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/test/test/languages",
        "stargazers_url": "https://api.github.com/repos/test/test/stargazers",
        "contributors_url": "https://api.github.com/repos/test/test/contributors",
        "subscribers_url": "https://api.github.com/repos/test/test/subscribers",
        "subscription_url": "https://api.github.com/repos/test/test/subscription",
        "commits_url": "https://api.github.com/repos/test/test/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/test/test/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/test/test/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/test/test/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/test/test/contents/{+path}",
        "compare_url": "https://api.github.com/repos/test/test/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/test/test/merges",
        "archive_url": "https://api.github.com/repos/test/test/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/test/test/downloads",
        "issues_url": "https://api.github.com/repos/test/test/issues{/number}",
        "pulls_url": "https://api.github.com/repos/test/test/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/test/test/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/test/test/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/test/test/labels{/name}",
        "releases_url": "https://api.github.com/repos/test/test/releases{/id}",
        "created_at": "2015-05-05T23:40:12Z",
        "updated_at": "2015-05-05T23:40:12Z",
        "pushed_at": "2015-05-05T23:40:27Z",
        "git_url": "git://github.com/test/test.git",
        "ssh_url": "git@github.com:test/test.git",
        "clone_url": "https://github.com/test/test.git",
        "svn_url": "https://github.com/test/test",
        "homepage": null,
        "size": 0,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": null,
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 1,
        "forks": 0,
        "open_issues": 1,
        "watchers": 0,
        "default_branch": "master"
      }
    },
    "base": {
      "label": "Kyle-Mendes:master",
      "ref": "staging",
      "sha": "9049f1265b7d61be4a8904a9a27120d2064dab3b",
      "user": {
        "login": "Kyle-Mendes",
        "id": 6752317,
        "avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/Kyle-Mendes",
        "html_url": "https://github.com/Kyle-Mendes",
        "followers_url": "https://api.github.com/users/Kyle-Mendes/followers",
        "following_url": "https://api.github.com/users/Kyle-Mendes/following{/other_user}",
        "gists_url": "https://api.github.com/users/Kyle-Mendes/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/Kyle-Mendes/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/Kyle-Mendes/subscriptions",
        "organizations_url": "https://api.github.com/users/Kyle-Mendes/orgs",
        "repos_url": "https://api.github.com/users/Kyle-Mendes/repos",
        "events_url": "https://api.github.com/users/Kyle-Mendes/events{/privacy}",
        "received_events_url": "https://api.github.com/users/Kyle-Mendes/received_events",
        "type": "User",
        "site_admin": false
      },
      "repo": {
        "id": 35129377,
        "name": "test/test",
        "full_name": "test/test",
        "owner": {
          "login": "Kyle-Mendes",
          "id": 6752317,
          "avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
          "gravatar_id": "",
          "url": "https://api.github.com/users/Kyle-Mendes",
          "html_url": "https://github.com/Kyle-Mendes",
          "followers_url": "https://api.github.com/users/Kyle-Mendes/followers",
          "following_url": "https://api.github.com/users/Kyle-Mendes/following{/other_user}",
          "gists_url": "https://api.github.com/users/Kyle-Mendes/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/Kyle-Mendes/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/Kyle-Mendes/subscriptions",
          "organizations_url": "https://api.github.com/users/Kyle-Mendes/orgs",
          "repos_url": "https://api.github.com/users/Kyle-Mendes/repos",
          "events_url": "https://api.github.com/users/Kyle-Mendes/events{/privacy}",
          "received_events_url": "https://api.github.com/users/Kyle-Mendes/received_events",
          "type": "User",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/test/test",
        "description": "",
        "fork": false,
        "url": "https://api.github.com/repos/test/test",
        "forks_url": "https://api.github.com/repos/test/test/forks",
        "keys_url": "https://api.github.com/repos/test/test/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/test/test/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/test/test/teams",
        "hooks_url": "https://api.github.com/repos/test/test/hooks",
        "issue_events_url": "https://api.github.com/repos/test/test/issues/events{/number}",
        "events_url": "https://api.github.com/repos/test/test/events",
        "assignees_url": "https://api.github.com/repos/test/test/assignees{/user}",
        "branches_url": "https://api.github.com/repos/test/test/branches{/branch}",
        "tags_url": "https://api.github.com/repos/test/test/tags",
        "blobs_url": "https://api.github.com/repos/test/test/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/test/test/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/test/test/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/test/test/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/test/test/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/test/test/languages",
        "stargazers_url": "https://api.github.com/repos/test/test/stargazers",
        "contributors_url": "https://api.github.com/repos/test/test/contributors",
        "subscribers_url": "https://api.github.com/repos/test/test/subscribers",
        "subscription_url": "https://api.github.com/repos/test/test/subscription",
        "commits_url": "https://api.github.com/repos/test/test/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/test/test/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/test/test/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/test/test/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/test/test/contents/{+path}",
        "compare_url": "https://api.github.com/repos/test/test/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/test/test/merges",
        "archive_url": "https://api.github.com/repos/test/test/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/test/test/downloads",
        "issues_url": "https://api.github.com/repos/test/test/issues{/number}",
        "pulls_url": "https://api.github.com/repos/test/test/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/test/test/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/test/test/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/test/test/labels{/name}",
        "releases_url": "https://api.github.com/repos/test/test/releases{/id}",
        "created_at": "2015-05-05T23:40:12Z",
        "updated_at": "2015-05-05T23:40:12Z",
        "pushed_at": "2015-05-05T23:40:27Z",
        "git_url": "git://github.com/test/test.git",
        "ssh_url": "git@github.com:test/test.git",
        "clone_url": "https://github.com/test/test.git",
        "svn_url": "https://github.com/test/test",
        "homepage": null,
        "size": 0,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": null,
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 1,
        "forks": 0,
        "open_issues": 1,
        "watchers": 0,
        "default_branch": "master"
      }
    },
    "_links": {
      "self": {
        "href": "https://api.github.com/repos/test/test/pulls/1"
      },
      "html": {
        "href": "https://github.com/test/test/pull/1"
      },
      "issue": {
        "href": "https://api.github.com/repos/test/test/issues/1"
      },
      "comments": {
        "href": "https://api.github.com/repos/test/test/issues/1/comments"
      },
      "review_comments": {
        "href": "https://api.github.com/repos/test/test/pulls/1/comments"
      },
      "review_comment": {
        "href": "https://api.github.com/repos/test/test/pulls/comments{/number}"
      },
      "commits": {
        "href": "https://api.github.com/repos/test/test/pulls/1/commits"
      },
      "statuses": {
        "href": "https://api.github.com/repos/test/test/statuses/0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c"
      }
    }
  },
  "repository": {
    "id": 35129377,
    "name": "test/test",
    "full_name": "test/test",
    "owner": {
      "login": "Kyle-Mendes",
      "id": 6752317,
      "avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
      "gravatar_id": "",
      "url": "https://api.github.com/users/Kyle-Mendes",
      "html_url": "https://github.com/Kyle-Mendes",
      "followers_url": "https://api.github.com/users/Kyle-Mendes/followers",
      "following_url": "https://api.github.com/users/Kyle-Mendes/following{/other_user}",
      "gists_url": "https://api.github.com/users/Kyle-Mendes/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/Kyle-Mendes/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/Kyle-Mendes/subscriptions",
      "organizations_url": "https://api.github.com/users/Kyle-Mendes/orgs",
      "repos_url": "https://api.github.com/users/Kyle-Mendes/repos",
      "events_url": "https://api.github.com/users/Kyle-Mendes/events{/privacy}",
      "received_events_url": "https://api.github.com/users/Kyle-Mendes/received_events",
      "type": "User",
      "site_admin": false
    },
    "private": false,
    "html_url": "https://github.com/test/test",
    "description": "",
    "fork": false,
    "url": "https://api.github.com/repos/test/test",
    "forks_url": "https://api.github.com/repos/test/test/forks",
    "keys_url": "https://api.github.com/repos/test/test/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/test/test/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/test/test/teams",
    "hooks_url": "https://api.github.com/repos/test/test/hooks",
    "issue_events_url": "https://api.github.com/repos/test/test/issues/events{/number}",
    "events_url": "https://api.github.com/repos/test/test/events",
    "assignees_url": "https://api.github.com/repos/test/test/assignees{/user}",
    "branches_url": "https://api.github.com/repos/test/test/branches{/branch}",
    "tags_url": "https://api.github.com/repos/test/test/tags",
    "blobs_url": "https://api.github.com/repos/test/test/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/test/test/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/test/test/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/test/test/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/test/test/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/test/test/languages",
    "stargazers_url": "https://api.github.com/repos/test/test/stargazers",
    "contributors_url": "https://api.github.com/repos/test/test/contributors",
    "subscribers_url": "https://api.github.com/repos/test/test/subscribers",
    "subscription_url": "https://api.github.com/repos/test/test/subscription",
    "commits_url": "https://api.github.com/repos/test/test/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/test/test/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/test/test/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/test/test/issues/comments{/number}",
    "contents_url": "https://api.github.com/repos/test/test/contents/{+path}",
    "compare_url": "https://api.github.com/repos/test/test/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/test/test/merges",
    "archive_url": "https://api.github.com/repos/test/test/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/test/test/downloads",
    "issues_url": "https://api.github.com/repos/test/test/issues{/number}",
    "pulls_url": "https://api.github.com/repos/test/test/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/test/test/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/test/test/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/test/test/labels{/name}",
    "releases_url": "https://api.github.com/repos/test/test/releases{/id}",
    "created_at": "2015-05-05T23:40:12Z",
    "updated_at": "2015-05-05T23:40:12Z",
    "pushed_at": "2015-05-05T23:40:27Z",
    "git_url": "git://github.com/test/test.git",
    "ssh_url": "git@github.com:test/test.git",
    "clone_url": "https://github.com/test/test.git",
    "svn_url": "https://github.com/test/test",
    "homepage": null,
    "size": 0,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": null,
    "has_issues": true,
    "has_downloads": true,
    "has_wiki": true,
    "has_pages": true,
    "forks_count": 0,
    "mirror_url": null,
    "open_issues_count": 1,
    "forks": 0,
    "open_issues": 1,
    "watchers": 0,
    "default_branch": "master"
  },
  "sender": {
    "login": "Kyle-Mendes",
    "id": 6752317,
    "avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=3",
    "gravatar_id": "",
    "url": "https://api.github.com/users/Kyle-Mendes",
    "html_url": "https://github.com/Kyle-Mendes",
    "followers_url": "https://api.github.com/users/Kyle-Mendes/followers",
    "following_url": "https://api.github.com/users/Kyle-Mendes/following{/other_user}",
    "gists_url": "https://api.github.com/users/Kyle-Mendes/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/Kyle-Mendes/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/Kyle-Mendes/subscriptions",
    "organizations_url": "https://api.github.com/users/Kyle-Mendes/orgs",
    "repos_url": "https://api.github.com/users/Kyle-Mendes/repos",
    "events_url": "https://api.github.com/users/Kyle-Mendes/events{/privacy}",
    "received_events_url": "https://api.github.com/users/Kyle-Mendes/received_events",
    "type": "User",
    "site_admin": false
  }
}
