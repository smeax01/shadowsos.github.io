import requests
import time

def check_site():
    url = "http://localhost:4321/shadow2/"
    max_retries = 5
    for i in range(max_retries):
        try:
            response = requests.get(url)
            if response.status_code == 200:
                print(f"[+] ShadowOS 2 is UP at {url}")
                return True
            else:
                print(f"[-] Site returned {response.status_code}")
        except Exception as e:
            print(f"[*] Waiting for site to be ready... ({i+1}/{max_retries})")
        time.sleep(2)
    return False

if __name__ == "__main__":
    check_site()
