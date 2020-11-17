import requests
import json
import re

def get_token():
    token = ""
    with open("token.txt", 'r') as f:
        token = f.read()
    return token

oauth_key = get_token()

org_name = "ritct"

def get_content_or_raise_exception(request):
    if request.status_code == 200:
        return json.loads(request.content)
    raise Exception(request.content)

def send_request(url):
    headers = {
        "Authorization": "token " + oauth_key
    }
    return requests.get(url, headers=headers)

def list_teams():
    url = "https://api.github.com/orgs/" + org_name + "/teams"
    return get_content_or_raise_exception(send_request(url))

def create_member_template(member):
    return "<li>%s</li>" % member['login']

def create_team_template(team):
    
    # This is a hack to change api.github.com/..../members/{members} to /members
    # TODO: find better way
    url = "/".join(team["members_url"].split("/")[:-2]) + "/members"
    members = get_content_or_raise_exception(send_request(url))
    out = "<li>%s<ul>" % team['name']
    for member in members:
        out += "\t" + create_member_template(member)
    out += "</ul></li>"
    return out

def create_template():
    teams = list_teams()
    out = "<ul>"
    for team in teams:
        out += "\t" + create_team_template(team)
    out += "</ul"
    return out

if __name__ == "__main__":
    with open("out.html", 'w') as f:
        f.write(create_template())