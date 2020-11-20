# Members-List-Actions

The members-list-actions is a GitHub Action that generates a list of all the members in an organization.
Adding this action to your organization will generate a JSON file that updates itself each time a new member is added to the organization.

## Getting Started

Create a `main.yml` file inside `.github/workflows/` and add the following.

```YAML
on:
  workflow_dispatch:
jobs:
  runs-on: ubuntu-latest
  name: Action to update the member's list
  steps:
    - name: Member List
      id: list-members
      uses: RITct/members-list-action@main
      with:
        org-name: <organization-name>
        file-path: 'members.json'
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

To add it to your to your existing workflow, append this to your current `.yml` workflow script.

```YAML
-uses: RITct/members-list-action@main
 with:
   org-name: <organization-name>
   file-path: 'members.json'
   env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
Don't forget to change the organization name.

## Parameters

<center>
  
OPTION            | DEFAULT VALUE          | DESCRIPTION        | REQUIRED 
----------------- | ---------------------- | ------------------ | -------------
org-name          |                        | Organization Name  | true
file-path         | members.json           | JSON file path     | false
commit-user-name  | list-member-action     | Commit Username    | false
commit-user-email | listaction@noreply.com | Commit Email       | false
commit-msg        | changed members file   | Commit Message     | false
  
</center>

## License
This project is licensed under the GNU GENERAL PUBLIC LICENSE - see the [LICENSE] file for details.

[LICENSE]: https://github.com/RITct/members-list-action/blob/main/LICENSE
