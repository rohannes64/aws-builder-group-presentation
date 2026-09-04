import json
import os
import secrets
import hashlib
from datetime import datetime, timezone
import boto3

dynDB = boto3.resource("dynamodb")
table = dynDB.Table(os.environ["TABLE_NAME"])

def response(status_code, body):
        return{
            "statusCode" : status_code,
            "headers" : {
                "Content-type" : "application/json"
            },
            "body" : json.dumps(body)
        }

def handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        
        university_registration_id = body.get("universityRegistrationID")
        name =  body.get("name")
        email = body.get("email")
        degree = body.get("degree")
        branch = body.get("branch")
        event_ID = body.get("eventID")
        
        required_fields = {
            "universityRegistrationID" : university_registration_id,
            "name" : name,
            "email" : email,
            "degree" : degree,
            "branch" : branch,
            "eventID" : event_ID
        }
        
        missing = [
            field for field, value in required_fields.items() if not value
        ]
        
        if missing:
            return response(400, {
                "error" : "Missing required fields",
                "fields" : missing
            })
        
        student_key = f"STUDENT#{university_registration_id}"
        event_key = f"EVENT#{event_ID}"
        
        existing = table.get_item(
            Key={
                "pk": event_key,
                "sk": student_key 
            }
        )
        if "Item" in existing:
            return response(
                400, 
                {
                    "error" : "Student is already registered"
                }
            )
        
        check_in_credential = secrets.token_urlsafe(32)
        credential_hash = hashlib.sha256(
            check_in_credential.encode("utf-8")
        ).hexdigest()
        
        
        registered_at = datetime.now(timezone.utc).isoformat()
        
        item = {
            "pk" : event_key,
            "sk" : student_key,
            
            "universityRegistrationID" : university_registration_id,
            "name" : name,
            "email" : email,
            "degree" : degree,
            "branch" : branch,
            
            "checkInEventKey" : event_key,
            "checkInHashID" : credential_hash,
            "checkedIn" : False, 
            "registeredAt" : registered_at
        }
        
        table.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(pk)"
        )
        
        return response(201,{
            "message" : "Registration Succesful",
            "RegNo." : university_registration_id,
            "checkinCredential" : check_in_credential,
            "eventID" : event_ID
        })
            
    except Exception as error:
        print(f"Registration error: {error}")
        return response(500, {
            "error" : "Internal Server error"
        })
    