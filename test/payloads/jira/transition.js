export const qaToDoneSingle = {
    "transition": {
        "workflowId": 32854,
        "workflowName": "XYZ workflow with vetting",
        "transitionId": 51,
        "transitionName": "approve",
        "from_status": "QA",
        "to_status": "Done"
    },
    "comment": "",
    "user": {
        "self": "https://reelio.atlassian.net/rest/api/2/user?username=dillon",
        "name": "dillon",
        "key": "dillon",
        "emailAddress": "dillon@reeliolabs.com",
        "displayName": "Dillon McRoberts",
        "active": true,
        "timeZone": "America/New_York"
    },
    "issue": {
        "id": "27609",
        "self": "https://reelio.atlassian.net/rest/api/2/issue/27609",
        "key": "XYZ-2",
        "fields": {
            "issuetype": {
                "self": "https://reelio.atlassian.net/rest/api/2/issuetype/10001",
                "id": "10001",
                "description": "A user story. Created by JIRA Software - do not edit or delete.",
                "iconUrl": "https://reelio.atlassian.net/images/icons/issuetypes/story.svg",
                "name": "Story",
                "subtask": false
            },
            "timespent": null,
            "project": {
                "self": "https://reelio.atlassian.net/rest/api/2/project/11400",
                "id": "11400",
                "key": "XYZ",
                "name": "XYZ",
                "avatarUrls": {
                    "48x48": "https://reelio.atlassian.net/secure/projectavatar?avatarId=10324",
                    "24x24": "https://reelio.atlassian.net/secure/projectavatar?size=small&avatarId=10324",
                    "16x16": "https://reelio.atlassian.net/secure/projectavatar?size=xsmall&avatarId=10324",
                    "32x32": "https://reelio.atlassian.net/secure/projectavatar?size=medium&avatarId=10324"
                }
            },
            "customfield_11000": null,
            "fixVersions": [],
            "customfield_11001": null,
            "aggregatetimespent": null,
            "customfield_11200": null,
            "resolution": null,
            "customfield_11003": "As a _ I want to _ so that I can _.",
            "customfield_11201": null,
            "customfield_11202": null,
            "customfield_11401": null,
            "customfield_11004": null,
            "customfield_11005": null,
            "customfield_11400": null,
            "customfield_10500": "{}",
            "customfield_10700": null,
            "customfield_10900": "|| Deployed On || PR API || PR Human || Deployed || QA Approved || \n || 3/31/2017 || [(internal use)|https://api.github.com/repos/dillonmcroberts/Webhook-test/pulls/26] || [26|https://github.com/dillonmcroberts/Webhook-test/pull/26] || [Yes|http://zzz-xyz1.s3-website-us-east-1.amazonaws.com/] || ||",
            "customfield_10901": null,
            "resolutiondate": null,
            "workratio": -1,
            "lastViewed": null,
            "watches": {
                "self": "https://reelio.atlassian.net/rest/api/2/issue/XYZ-2/watchers",
                "watchCount": 1,
                "isWatching": false
            },
            "created": "2017-03-23T16:55:03.123-0400",
            "customfield_10020": null,
            "customfield_10021": null,
            "customfield_10022": null,
            "customfield_10100": null,
            "priority": {
                "self": "https://reelio.atlassian.net/rest/api/2/priority/3",
                "iconUrl": "https://reelio.atlassian.net/images/icons/priorities/medium.svg",
                "name": "Medium",
                "id": "3"
            },
            "customfield_10023": "Not started",
            "customfield_10300": null,
            "labels": [],
            "customfield_10016": null,
            "customfield_10017": null,
            "customfield_10018": null,
            "customfield_10019": null,
            "timeestimate": null,
            "aggregatetimeoriginalestimate": null,
            "versions": [],
            "issuelinks": [],
            "assignee": {
                "self": "https://reelio.atlassian.net/rest/api/2/user?username=dillon",
                "name": "dillon",
                "key": "dillon",
                "emailAddress": "dillon@reeliolabs.com",
                "avatarUrls": {
                    "48x48": "https://avatar-cdn.atlassian.com/a7d0bd6cb73a0de4a1ceb504779c1070?s=48&d=https%3A%2F%2Freelio.atlassian.net%2Fsecure%2Fuseravatar%3FavatarId%3D10350%26noRedirect%3Dtrue",
                    "24x24": "https://avatar-cdn.atlassian.com/a7d0bd6cb73a0de4a1ceb504779c1070?s=24&d=https%3A%2F%2Freelio.atlassian.net%2Fsecure%2Fuseravatar%3Fsize%3Dsmall%26avatarId%3D10350%26noRedirect%3Dtrue",
                    "16x16": "https://avatar-cdn.atlassian.com/a7d0bd6cb73a0de4a1ceb504779c1070?s=16&d=https%3A%2F%2Freelio.atlassian.net%2Fsecure%2Fuseravatar%3Fsize%3Dxsmall%26avatarId%3D10350%26noRedirect%3Dtrue",
                    "32x32": "https://avatar-cdn.atlassian.com/a7d0bd6cb73a0de4a1ceb504779c1070?s=32&d=https%3A%2F%2Freelio.atlassian.net%2Fsecure%2Fuseravatar%3Fsize%3Dmedium%26avatarId%3D10350%26noRedirect%3Dtrue"
                },
                "displayName": "Dillon McRoberts",
                "active": true,
                "timeZone": "America/New_York"
            },
            "updated": "2017-05-01T13:00:35.452-0400",
            "status": {
                "self": "https://reelio.atlassian.net/rest/api/2/status/10005",
                "description": "Indicates that the issue is currently being QA tested by the QA assignee. This status is managed internally by JIRA Software",
                "iconUrl": "https://reelio.atlassian.net/",
                "name": "QA",
                "id": "10005",
                "statusCategory": {
                    "self": "https://reelio.atlassian.net/rest/api/2/statuscategory/4",
                    "id": 4,
                    "key": "indeterminate",
                    "colorName": "yellow",
                    "name": "In Progress"
                }
            },
            "components": [],
            "timeoriginalestimate": null,
            "description": null,
            "customfield_10011": "0|i00j5f:",
            "customfield_11300": null,
            "customfield_10014": null,
            "timetracking": {},
            "customfield_10015": null,
            "customfield_10203": null,
            "customfield_10005": null,
            "customfield_10600": null,
            "customfield_10204": null,
            "customfield_10006": null,
            "customfield_10007": null,
            "customfield_10205": null,
            "attachment": [],
            "aggregatetimeestimate": null,
            "summary": "do it",
            "creator": {
                "self": "https://reelio.atlassian.net/rest/api/2/user?username=kyle",
                "name": "kyle",
                "key": "kyle",
                "emailAddress": "kyle@reeliolabs.com",
                "avatarUrls": {
                    "48x48": "https://avatar-cdn.atlassian.com/aa3442a93731c7f23f5f68837a696dc2?s=48&d=https%3A%2F%2Fsecure.gravatar.com%2Favatar%2Faa3442a93731c7f23f5f68837a696dc2%3Fd%3Dmm%26s%3D48%26noRedirect%3Dtrue",
                    "24x24": "https://avatar-cdn.atlassian.com/aa3442a93731c7f23f5f68837a696dc2?s=24&d=https%3A%2F%2Fsecure.gravatar.com%2Favatar%2Faa3442a93731c7f23f5f68837a696dc2%3Fd%3Dmm%26s%3D24%26noRedirect%3Dtrue",
                    "16x16": "https://avatar-cdn.atlassian.com/aa3442a93731c7f23f5f68837a696dc2?s=16&d=https%3A%2F%2Fsecure.gravatar.com%2Favatar%2Faa3442a93731c7f23f5f68837a696dc2%3Fd%3Dmm%26s%3D16%26noRedirect%3Dtrue",
                    "32x32": "https://avatar-cdn.atlassian.com/aa3442a93731c7f23f5f68837a696dc2?s=32&d=https%3A%2F%2Fsecure.gravatar.com%2Favatar%2Faa3442a93731c7f23f5f68837a696dc2%3Fd%3Dmm%26s%3D32%26noRedirect%3Dtrue"
                },
                "displayName": "Kyle Mendes",
                "active": true,
                "timeZone": "America/New_York"
            },
            "subtasks": [],
            "reporter": {
                "self": "https://reelio.atlassian.net/rest/api/2/user?username=kyle",
                "name": "kyle",
                "key": "kyle",
                "emailAddress": "kyle@reeliolabs.com",
                "avatarUrls": {
                    "48x48": "https://avatar-cdn.atlassian.com/aa3442a93731c7f23f5f68837a696dc2?s=48&d=https%3A%2F%2Fsecure.gravatar.com%2Favatar%2Faa3442a93731c7f23f5f68837a696dc2%3Fd%3Dmm%26s%3D48%26noRedirect%3Dtrue",
                    "24x24": "https://avatar-cdn.atlassian.com/aa3442a93731c7f23f5f68837a696dc2?s=24&d=https%3A%2F%2Fsecure.gravatar.com%2Favatar%2Faa3442a93731c7f23f5f68837a696dc2%3Fd%3Dmm%26s%3D24%26noRedirect%3Dtrue",
                    "16x16": "https://avatar-cdn.atlassian.com/aa3442a93731c7f23f5f68837a696dc2?s=16&d=https%3A%2F%2Fsecure.gravatar.com%2Favatar%2Faa3442a93731c7f23f5f68837a696dc2%3Fd%3Dmm%26s%3D16%26noRedirect%3Dtrue",
                    "32x32": "https://avatar-cdn.atlassian.com/aa3442a93731c7f23f5f68837a696dc2?s=32&d=https%3A%2F%2Fsecure.gravatar.com%2Favatar%2Faa3442a93731c7f23f5f68837a696dc2%3Fd%3Dmm%26s%3D32%26noRedirect%3Dtrue"
                },
                "displayName": "Kyle Mendes",
                "active": true,
                "timeZone": "America/New_York"
            },
            "customfield_10000": null,
            "aggregateprogress": {
                "progress": 0,
                "total": 0
            },
            "customfield_10001": null,
            "customfield_10002": null,
            "customfield_10200": null,
            "customfield_10003": null,
            "customfield_10201": [],
            "customfield_10004": 5,
            "customfield_10202": null,
            "customfield_10400": null,
            "customfield_11403": null,
            "customfield_11006": null,
            "customfield_11007": null,
            "customfield_11402": null,
            "customfield_11008": "#. Login as ...\r\n#. ...",
            "customfield_11405": null,
            "environment": null,
            "customfield_11404": null,
            "duedate": null,
            "progress": {
                "progress": 0,
                "total": 0
            },
            "votes": {
                "self": "https://reelio.atlassian.net/rest/api/2/issue/XYZ-2/votes",
                "votes": 0,
                "hasVoted": false
            },
            "comment": {
                "comments": [],
                "maxResults": 0,
                "total": 0,
                "startAt": 0
            },
            "worklog": {
                "startAt": 0,
                "maxResults": 20,
                "total": 0,
                "worklogs": []
            }
        }
    },
    "timestamp": 1493658041553
}
