from core.lookup import Lookup
from argparse import ArgumentParser
import requests
import sys


def get_user_id_from_username(username: str) -> int:
    """Convert a Roblox username to user ID using the Roblox API"""
    try:
        url = "https://users.roblox.com/v1/usernames/users"
        payload = {
            "usernames": [username],
            "excludeBannedUsers": False
        }
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        if data.get("data") and len(data["data"]) > 0:
            user_id = data["data"][0]["id"]
            username_found = data["data"][0]["name"]
            print(f"[+] Found user: {username_found} (ID: {user_id})")
            return user_id
        else:
            print(f"[-] Error: Username '{username}' not found")
            sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"[-] Error fetching user ID: {e}")
        sys.exit(1)


parser = ArgumentParser()

parser.add_argument("-t", "--target-id", help="Target roblox id to lookup", metavar="<id>")
parser.add_argument("-n", "--target-name", help="Target roblox username to lookup", metavar="<username>")
parser.add_argument("-f", "--file", help="Stores information gathered in the file", metavar="<file>")
parser.add_argument("-s", "--style", help="Changes the information style and format", metavar="<style>")
parser.add_argument("-gl", "--game-limit", help="Sets the limit to how many games are stored or displayed", metavar="<int>")
parser.add_argument("-c", "--cookie", help="authenticates as a user to access other API endpoints", metavar="<cookie>")
parser.add_argument("-d", "--database", help="Mongodb Key for your atlas database", metavar="<link>")

args = parser.parse_args()

if not args.game_limit:
    args.game_limit = 10

# Determine target ID from either direct ID or username
target_id = None
if args.target_id:
    target_id = int(args.target_id)
elif args.target_name:
    target_id = get_user_id_from_username(args.target_name)
else:
    print("[-] Error: You must provide either --target-id or --target-name")
    parser.print_help()
    sys.exit(1)

if target_id:
    bloxsint = Lookup(roblox_id=target_id, args=args)
    bloxsint.run()
    print(bloxsint.stats)
