import streamlit as st
import json
import requests
import base64
import time
from datetime import datetime

# --- CONFIGURATION ---
GITHUB_TOKEN = st.secrets["GH_PORTFOLIO_TOKEN"]
REPO_OWNER = "jonathantaylorvideo-dev"
REPO_NAME = "portfolio"
FILE_PATH = "content.json"
STATUS_PATH = "status.json"

st.set_page_config(page_title="Mission Control | Admin", page_icon="⚙️", layout="wide")

# --- HARDENED GITHUB SYNC ---
def update_github_file(path, content, message, retries=3):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
    
    for attempt in range(retries):
        try:
            res = requests.get(url, headers=headers, timeout=5)
            sha = res.json().get('sha') if res.status_code == 200 else None
            payload = {
                "message": message,
                "content": base64.b64encode(content.encode()).decode(),
                "sha": sha
            }
            response = requests.put(url, json=payload, headers=headers, timeout=10)
            if response.status_code in [200, 201]:
                return True, response.status_code
        except Exception:
            time.sleep(2) # Wait 2 seconds before retrying
            continue
    return False, 408

# --- DATA INITIALIZATION ---
if "master_data" not in st.session_state:
    try:
        raw_res = requests.get(f"https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/main/{FILE_PATH}?t={datetime.now().timestamp()}")
        st.session_state.master_data = raw_res.json()
        if "projects" not in st.session_state:
            st.session_state.projects = st.session_state.master_data.get("projects", [])
    except Exception:
        st.error("Connection Refused. Check Network.")
        st.stop()

# --- MAIN UI ---
st.title("⚙️ Portfolio Mission Control")
tab1, tab2 = st.tabs(["📝 Identity & Blog", "🚀 Project Nodes"])

with tab1:
    d = st.session_state.master_data
    d["profile"]["name"] = st.text_input("Name", d["profile"].get("name", ""))
    d["profile"]["title"] = st.text_input("Professional Title", d["profile"].get("title", ""))
    d["profile"]["about"] = st.text_area("Bio", d["profile"].get("about", ""), height=100)

with tab2:
    if st.button("➕ Add New Project Node"):
        st.session_state.projects.append({"title": "", "description": "", "link": "http://", "tags": []})
    for i, project in enumerate(st.session_state.projects):
        with st.expander(f"Node {i+1}: {project.get('title') or 'New Project'}"):
            project["title"] = st.text_input(f"Title", project.get("title"), key=f"t_{i}")
            project["description"] = st.text_area(f"Description", project.get("description"), key=f"d_{i}")
            project["link"] = st.text_input(f"Link", project.get("link"), key=f"l_{i}")
            if st.button(f"🗑️ Delete Node {i+1}", key=f"del_{i}"):
                st.session_state.projects.pop(i)
                st.rerun()

st.divider()
if st.button("💾 PUSH ALL UPDATES TO GITHUB", use_container_width=True, type="primary"):
    with st.spinner("Synchronizing... (Attempting up to 3 times)"):
        st.session_state.master_data["projects"] = st.session_state.projects
        success, code = update_github_file(FILE_PATH, json.dumps(st.session_state.master_data, indent=2), f"Admin Update: {datetime.now()}")
        if success:
            st.success("✅ Global Sync Complete.")
        else:
            st.error(f"❌ Sync Failed after 3 attempts. (Code {code})")