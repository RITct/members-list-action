const core = require('@actions/core');
const github = require('@actions/github');
fs = require('fs');

var octokit;

const orgName = core.getInput('org-name');
const authToken = process.env.GITHUB_TOKEN;
const path = core.getInput('file-path');
const name = core.getInput('commit-user-name');
const email = core.getInput('commit-user-email');
const message = core.getInput('commit-msg');
const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split('/');

/*
// For Testing Locally

function get_test_values(){
    return JSON.parse(fs.readFileSync('test_data.json', { encoding: 'utf8' }));
}
var test_data = get_test_values();
const orgName = test_data['org_name'];
const authToken = test_data['token'];
const path = test_data['path'];
const name = test_data['name'];
const email = test_data['email'];
const message = test_data['message']
const repoOwner = orgName;
const repoName = test_data['repo'];
*/


async function getMemberData(teams){
    // TODO: find async forEach alternative
    let memberData = {};
    for(var i=0; i < teams.length; i++){
        var resp = await octokit.teams.listMembersInOrg({
            org: orgName,
            team_slug: teams[i].slug,
        }).catch(
            err => {
                core.error(err);
                process.exit(1);
            }
        );
        memberData[teams[i].name] = resp.data;
    }
    return memberData;
}

async function run(){
    try{       
        if (!authToken) {
            throw new Error('Token not found');
        }

        octokit = github.getOctokit(authToken);

        teamsResponse =  await octokit.teams.list({
            org: orgName,
        }).catch(
            err => {
                core.error(err);
                process.exit(1);
            }
        );
        
        memberData = await getMemberData(teamsResponse.data);
        
        jsonFileResponse = await octokit.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: path,
        }).catch(
            err => {
                core.error(err);
                process.exit(1);
            }
        );
        
        // github transfers files in base64
        prevContent = Buffer.from(jsonFileResponse.data.content, 'base64').toString('ascii');
        content = JSON.stringify(memberData);
        base64String = Buffer.from(content).toString('base64');

        if(prevContent !== content){
            await octokit.repos.createOrUpdateFileContents({
                owner: repoOwner,
                repo: repoName,
                message: message,
                content: base64String,
                path: path,
                sha: jsonFileResponse.data.sha,
                committer: {
                    name: name,
                    email: email
                }
            })
            .then(  
                core.setOutput('message', 'File Updated'), console.log('file updated')
            )
            .catch(
                err =>{
                    core.error(err);
                    process.exit(1);
                }
            );
        }
        else{
            core.setOutput('message', 'No Changes Detected');
            console.log('no changes');
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
