const core = require('@actions/core');
const github = require('@actions/github');

const orgName = core.getInput('org-name');
const authToken = process.env["GITHUB_TOKEN"];
const octokit = github.getOctokit(authToken);
const path = core.getInput("file-path");
const name = core.getInput("commit-user-name");
const email = core.getInput("commit-user-email");
const message = core.getInput("commit-msg");

async function getMemberData(teams){
    // TODO: find async forEach alternative
    member_data = {};
    for(var i=0; i < teams.length; i++){
        var resp = await octokit.teams.listMembersInOrg({
            org: orgName,
            team_slug: teams[i].slug,
        });
        member_data[teams[i].name] = resp.data
    }
    return member_data;
}

async function run(){
    try{
        if (!authToken) {
            throw new Error("Token not found");
        }

        teams_response =  await octokit.teams.list({
            org: orgName,
        }).catch(
            err => console.log(err)
        );
        
        member_data = getMemberData(teams_response.data);
        
        // Eliminate Owner name from repo
        var repo = process.env["GITHUB_REPOSITORY"].split("/")[1]
        
        json_file_response = await octokit.repos.getContent({
            owner: orgName,
            repo: repo,
            path: path,
        }).catch(
            err => console.log(err)
        );
        
        // github transfers files in base64
        prevContent = Buffer.from(json_file_response.data.content, "base64").toString("ascii");
        content = JSON.stringify(member_data);
        base64String = Buffer.from(content).toString("base64");

        if(prevContent != content){
            await octokit.repos.createOrUpdateFileContents({
                owner: orgName,
                repo: repo,
                message: message,
                content: base64String,
                path: path,
                sha: json_file_response.data.sha,
                committer: {
                    name: name,
                    email: email
                }
            })
            .then(  
                console.log("file updated")
            )
            .catch(
                err => console.log(err)
            );
        }
        else{
            console.log("no changes");
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();