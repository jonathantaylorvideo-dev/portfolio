import streamlit as st
import requests
import json
from datetime import datetime

# --- CONFIGURATION ---
# 1. Update this with your Formspree ID from formspree.io
FORMSPREE_URL = "https://formspree.io/f/YOUR_ID_HERE" 

# 2. YOUR VERIFIED ZOOM LINK (Updated with Passcode)
ZOOM_LINK = "https://us05web.zoom.us/j/5805966505?pwd=IywiDyhEszOgXGTaFJmqSSq4eK2AM9.1"

# 3. Your Live GitHub Status Link
STATUS_URL = "https://raw.githubusercontent.com/jonathantaylorvideo-dev/portfolio/main/status.json"

st.set_page_config(page_title="AI Automation Audit", page_icon="🤖", layout="centered")

# --- UI STYLING ---
st.markdown("""
    <style>
    .stApp { background-color: #050505; color: #e0e0e0; font-family: 'Inter', sans-serif; }
    .stButton>button { 
        width: 100%; border-radius: 12px; height: 3.5em; 
        background-color: #00ffcc; color: black; font-weight: bold; border: none; 
    }
    .report-card { 
        background: #0e0e0e; border: 1px solid #1a1a1a; padding: 25px; 
        border-radius: 20px; border-left: 5px solid #00ffcc;
    }
    </style>
    """, unsafe_allow_html=True)

if "step" not in st.session_state:
    st.session_state.step = 1
    st.session_state.data = {}

# --- STEP 1: LEAD CAPTURE ---
if st.session_state.step == 1:
    st.title("🤖 AI Automation Audit")
    st.write("Calculate your business's automation ROI in 60 seconds.")
    with st.form("audit_form"):
        name = st.text_input("Name")
        email = st.text_input("Email")
        company = st.text_input("Company")
        if st.form_submit_button("BEGIN AUDIT"):
            if name and email:
                st.session_state.data.update({"name": name, "email": email, "company": company})
                st.session_state.step = 2
                st.rerun()
            else:
                st.error("Please provide contact details to continue.")

# --- STEP 2: WORKFLOW ANALYSIS ---
elif st.session_state.step == 2:
    st.title("📊 Workflow Analysis")
    task = st.text_area("What repetitive task is slowing you down?", placeholder="e.g., Invoicing, scheduling...")
    hours = st.slider("Weekly hours spent on this?", 1, 40, 5)
    
    if st.button("GENERATE ROI REPORT"):
        st.session_state.data.update({"task": task, "hours": hours})
        # Transmit to Jon via Formspree
        requests.post(FORMSPREE_URL, json=st.session_state.data)
        st.session_state.step = 3
        st.rerun()

# --- STEP 3: RESULTS & ZOOM REDIRECT ---
elif st.session_state.step == 3:
    d = st.session_state.data
    savings = d['hours'] * 52
    st.title("✅ Your Audit Results")
    
    st.markdown(f"""
    <div class="report-card">
        <h3>Summary for {d['name']}</h3>
        <p>Your current workflow for <b>{d['task']}</b> is costing you <b>{savings} hours per year</b>.</p>
        <p><b>Recommendation:</b> AI Orchestration can likely reclaim 80% of this lost time.</p>
    </div>
    """, unsafe_allow_html=True)

    # Check Live Status from GitHub
    try:
        status_res = requests.get(STATUS_URL + "?t=" + str(datetime.now().timestamp()))
        is_live = status_res.json().get("live_consult_available", False)
    except:
        is_live = False

    st.divider()
    if is_live:
        st.success("⚡ **DIRECT HANDOFF ACTIVE: JON IS ONLINE**")
        st.write("Would you like to join a live Zoom briefing to discuss these results?")
        if st.button("🚀 LAUNCH LIVE ZOOM CALL"):
            # The Pass-Thru Trigger
            st.markdown(f'<meta http-equiv="refresh" content="0; URL=\'{ZOOM_LINK}\'" />', unsafe_allow_html=True)
    else:
        st.info("📬 **MISSION STATUS: REMOTE**")
        st.write("Jon has received your audit and will follow up via email with a formal roadmap.")
        if st.button("Return to Portfolio"):
             st.markdown('<meta http-equiv="refresh" content="0; URL=\'https://jonathantaylorvideo-dev.github.io/portfolio/\'" />', unsafe_allow_html=True)