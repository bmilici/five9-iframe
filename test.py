from flask import Flask, request, jsonify
import requests
import base64
import xml.etree.ElementTree as ET

app = Flask(__name__)

# Five9 API credentials
USERNAME = "MI_API"
PASSWORD = "Nattie10600!"

# Encode credentials for HTTP Basic Authentication
CREDENTIALS = base64.b64encode(f"{USERNAME}:{PASSWORD}".encode()).decode()

# Five9 Admin API URL
API_URL = "https://api.five9.com:443/wsadmin/v12/AdminWebService"

def create_skill(skill_name):
    """ Sends a SOAP request to create a skill in Five9 """
    soap_envelope = f"""
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.admin.ws.five9.com/">
       <soapenv:Header/>
       <soapenv:Body>
          <ser:createSkill>
             <skillInfo>
                <skill>
                   <name>{skill_name}</name>
                </skill>
             </skillInfo>
          </ser:createSkill>
       </soapenv:Body>
    </soapenv:Envelope>
    """

    # Headers for SOAP request
    headers = {
        "Content-Type": "text/xml;charset=UTF-8",
        "SOAPAction": "http://service.admin.ws.five9.com/createSkill",
        "Authorization": f"Basic {CREDENTIALS}"
    }

    # Send request
    response = requests.post(API_URL, data=soap_envelope, headers=headers)
    
    # Parse response XML
    response_xml = ET.fromstring(response.content)
    success_element = response_xml.find('.//return')

    # Determine success or failure
    if response.status_code == 200 and success_element is not None and success_element.text == "true":
        return {"status": "success", "message": f"Skill '{skill_name}' has been successfully created."}
    else:
        return {"status": "error", "message": f"Failed to create skill '{skill_name}'.", "response": response.text}

@app.route('/create-skill', methods=['POST'])
def handle_create_skill():
    """ Endpoint to create a skill via a POST request """
    data = request.get_json()
    skill_name = data.get("skill_name")

    if not skill_name:
        return jsonify({"status": "error", "message": "Missing 'skill_name' in request body"}), 400

    result = create_skill(skill_name)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
