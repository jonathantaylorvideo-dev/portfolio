import streamlit as st
import google.generativeai as genai
from PIL import Image
import json
import os
import uuid
import pandas as pd
from datetime import datetime

# --- 1. API STABILIZATION (FIJI PROTOCOL) ---
try:
    genai.configure(api_key=st.secrets["GEMINI_API_KEY"])
    # Using the stable 2026 endpoint to avoid 404s
    MODEL_ID = "models/gemini-2.0-flash" 
    model = genai.GenerativeModel(model_name=MODEL_ID)
except Exception as e:
    st.error(f"🔑 API Setup Error: {e}")

MASTER_LOG = "master_inventory.json"
st.set_page_config(page_title="Vision Vault | Professional", page_icon="🛡️", layout="wide")

# --- 2. SESSION TRACKING ---
if "user_uuid" not in st.session_state:
    st.session_state.user_uuid = str(uuid.uuid4())[:8]

# --- 3. UI HEADER ---
st.title("🛡️ Vision Vault: Professional Appraisal")
st.caption(f"Node: {st.session_state.user_uuid} | Powered by {MODEL_ID}")

tab1, tab2, tab3 = st.tabs(["📸 Live Camera", "📁 High-Res Upload", "💬 Manual Text"])
content, mode = None, None

with tab1:
    cam_file = st.camera_input("Scan Item")
    if cam_file:
        content = Image.open(cam_file)
        mode = "Camera"

with tab2:
    up_file = st.file_uploader("Select Photo", type=['jpg', 'png', 'jpeg'])
    if up_file:
        content = Image.open(up_file)
        mode = "Upload"

with tab3:
    txt_input = st.text_input("Describe Item (e.g. 'Wolverine #1 1982')")
    if st.button("Search Description"):
        if txt_input:
            content = txt_input
            mode = "Text"

# --- 4. THE APPRAISAL ENGINE ---
if content:
    with st.spinner(f"AI Analyzing {mode} data..."):
        try:
            prompt = "Identify this comic/collectible. Provide: 1. Title/Issue, 2. Visual Grade Guess (0.1-10.0), 3. Key Features, 4. Current Market Value Range."
            
            if mode in ["Camera", "Upload"]:
                response = model.generate_content([prompt, content])
            else:
                response = model.generate_content(f"{prompt} Item: {content}")
            
            # --- AI OUTPUT BOX ---
            st.markdown("### 🔍 AI Analysis")
            st.info(response.text)

            # --- HUMAN AUDIT LAYER ---
            st.divider()
            st.markdown("### ✍️ Human Opinion & Final Documentation")
            
            # Pre-fill fields using AI text (best effort)
            ai_lines = response.text.split('\n')
            default_title = ai_lines[0][:50] if ai_lines else "New Item"

            c1, c2, c3 = st.columns([2, 1, 1])
            with c1:
                final_title = st.text_input("Confirm Title/Issue", value=default_title)
                final_notes = st.text_area("Condition Notes", placeholder="e.g. Spine ticks, blunt corners, white pages...")
            with c2:
                final_grade = st.slider("Final Grade", 0.1, 10.0, 9.0, step=0.1)
            with c3:
                final_price = st.number_input("Final Price ($)", min_value=0.0, value=25.0, step=1.0)

            if st.button("📥 Add to Customer Manifest"):
                new_entry = {
                    "Title": final_title,
                    "Grade": final_grade,
                    "Price": final_price,
                    "Notes": final_notes,
                    "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M")
                }
                
                # Update Local Database
                history = []
                if os.path.exists(MASTER_LOG):
                    with open(MASTER_LOG, "r") as f:
                        history = json.load(f)
                history.append(new_entry)
                with open(MASTER_LOG, "w") as f:
                    json.dump(history, f, indent=2)
                
                st.success(f"Successfully documented {final_title}!")
                st.balloons() # Visual confirmation for you/customer

        except Exception as e:
            st.error(f"❌ Analysis Failed: {e}")

# --- 5. THE CUSTOMER MANIFEST (INVENTORY LIST) ---
st.divider()
st.subheader("📋 Customer Manifest & Totals")

if os.path.exists(MASTER_LOG):
    with open(MASTER_LOG, "r") as f:
        manifest_data = json.load(f)
    
    if manifest_data:
        df = pd.DataFrame(manifest_data)
        
        # Display the table (Reordering for clean customer view)
        st.dataframe(df[["Title", "Grade", "Price", "Notes"]], use_container_width=True)
        
        # Calculate Totals
        total_value = df["Price"].sum()
        item_count = len(df)
        
        m1, m2 = st.columns(2)
        m1.metric("Total Items", item_count)
        m2.metric("Total Manifest Value", f"${total_value:,.2f}")
        
        # Manifest Controls
        if st.button("🗑️ Reset Manifest (New Customer)"):
            os.remove(MASTER_LOG)
            st.rerun()
            
        # Download Option
        csv = df.to_csv(index=False).encode('utf-8')
        st.download_button("📂 Download Manifest (CSV)", data=csv, file_name="comic_appraisal.csv", mime='text/csv')
    else:
        st.write("No items in the list yet. Scan or upload to begin.")