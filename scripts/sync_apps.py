import json
import os
import glob

def sync_apps():
    apps_dir = "src/data/apps"
    output_file = "src/data/apps_manifest.json"
    
    apps = []
    print(f"[*] Scanning {apps_dir} for apps...")
    
    for app_file in glob.glob(os.path.join(apps_dir, "*.json")):
        try:
            with open(app_file, 'r', encoding='utf-8') as f:
                app_data = json.load(f)
                # Validation
                required = ["id", "title", "icon", "type"]
                if all(k in app_data for k in required):
                    apps.append(app_data)
                    print(f"[+] Loaded: {app_data['title']} ({app_data['id']})")
                else:
                    print(f"[!] Missing fields in {app_file}")
        except Exception as e:
            print(f"[!] Error reading {app_file}: {e}")

    # Sort apps by ID or title
    apps.sort(key=lambda x: x['id'])
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(apps, f, indent=2, ensure_ascii=False)
        
    print(f"\n[*] Generated manifest with {len(apps)} apps in {output_file}")

if __name__ == "__main__":
    # Ensure we are in project root (assuming script is in /scripts)
    if os.path.basename(os.getcwd()) == "scripts":
        os.chdir("..")
    sync_apps()
