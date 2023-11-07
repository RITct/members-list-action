const core = require('@actions/core');
const github = require('@actions/github');

var octokit;


const orgName = core.getInput('org-name');
const teamName = core.getInput('team-name') || null;
const authToken = process.env.GITHUB_TOKEN;
const limit = core.getInput('user-limit')

// For Testing Locally
/*
const fs = require('fs');
function get_test_values(){
    return JSON.parse(fs.readFileSync('test_data.json', { encoding: 'utf8' }));
}
var test_data = get_test_values();
const orgName = test_data['org_name'];
const orgName = test_data['team_name'];
const authToken = test_data['token'];
const path = test_data['path'];
const name = test_data['name'];
const email = test_data['email'];
const message = test_data['message']
const repoOwner = orgName;
const repoName = test_data['repo'];
*/


async function getMemberData(team){
    let resp = await octokit.teams.listMembersInOrg({
        'org': orgName,
        'team_slug': team,
    }).catch(
        err => {
            core.error(err);
            process.exit(1);
        }
    );
    return resp.data;
}

async function run(){
    try{
        if (!authToken) {
            throw new Error('Token not found');
        }

        octokit = github.getOctokit(authToken);

        let allUsers = [];

        allUsers = await getMemberData(teamName).sort(() => 0.5 - Math.random());

        let selectedUsers = allUsers.slice(0, limit);

        core.setOutput('users', selectedUsers.join(','))
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
