import json
import os
import hashlib
from datetime import datetime, timezone


import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

dynDB = boto3.resource("dynamodb")
table = dynDB.Table(os.environ["TABLE_NAME"])


def response(status_code, body):
    return {
        "statusCode" : status_code,
        "headers" : {
            "Content-type" : "application/json"
            },
        "body" : json.dumps(body)
    }

def handler(event, context):
    
    try:
        body = json.loads(event.get("body", "{}"))
        
        event_ID = body.get("eventID")
        check_in_credential = body.get("checkinCredential")
        
        missing = []
        if not event_ID:
            missing.append("eventID")
        if not check_in_credential:
            missing.append("check_in_credential")
        
        if missing:
            return response(
                400,
                {
                    "error" : "Missing Required Fields",
                    "fields" : missing
                }
            )
        
        credential_hash = hashlib.sha256(
            check_in_credential.encode("utf-8")
        ).hexdigest()
        
        event_key = f"EVENT#{event_ID}"
        
        #Old DB scan method, ill-optimized and cost consuming O(n) search
        # result = table.scan(
        #     FilterExpression=(
        #         Key("pk").eq(event_key)
        #     )
        # )
        
        # student=None
        # for item in result.get("Items", []):
        #     if item.get("checkInHashID") == credential_hash:
        #             student = item
        #             break
        
        # if student is None:
        #     return response(401, {
        #         "error" : "Invalid check-in credential"
        #     })
        
        #New DB query method, GSI Included, 
        result = table.query(
            IndexName="CheckInCredentialIndex",
            KeyConditionExpression=(
                Key("checkInEventKey").eq(event_key) & Key("checkInHashID").eq(credential_hash)
            )
        )
        items = result.get("Items", [])
        
        if not items:
            return response(401,{
                "error" : "Invalid check-in credentials"
            })
        if len(items) != 1:
            return response(500, {"error": "Invalid credential state"})
       
        student = items[0]        
        
        if student.get("checkedIn") is True:
            return response(409, {
                "error" : "Student is already checked in",
                "universityRegistrationID" : student.get("RegID")
            })
        
        checked_in_at = datetime.now(timezone.utc).isoformat()
        
        #Before concurrency handling
        # table.update_item(
        #     Key={
        #         "pk": student["pk"],
        #         "sk": student["sk"]
        #     },
        #     UpdateExpression=(
        #         "SET checkedIn = :checkedIn, "
        #         "checkedInAt = :checkedInAt"
        #     ),
        #     ExpressionAttributeValues={
        #         ":checkedIn" : True,
        #         ":checkedInAt" : checked_in_at
        #     }
        # )
        
        try:
            table.update_item(
                Key={
                    "pk" : student["pk"],
                    "sk" : student["sk"],
                },
                UpdateExpression=(
                    "SET checkedIn = :checkedIn, "
                    "checkedInAt = :checkedInAt"
                ),
                ConditionExpression=(
                    "attribute_not_exists(checkedIn) "
                    "OR checkedIn = :false"
                ),
                ExpressionAttributeValues={
                    ":checkedIn" : True,
                    ":false" : False,
                    ":checkedInAt" : checked_in_at
                }
            )
        except ClientError as error:
                if error.response["Error"]["Code"] == "ConditionalCheckFailedException":
                    return response(409,{
                        "error" : "Student is already Checked in",
                        "universityRegistrationID" : student.get("RegID")
                    })
                raise
                    
        return response(200,
                        {
                            "message" : "Check-in Succesful",
                            "universityRegistrationID": student.get("RegID"),
                            "name" : student.get("name"),
                            "checkedInAt" : checked_in_at
                        })
        
    except Exception as error:
        print(f"Check-in-error: {error}")
        return response(500,{
            "error" : "Internal Server Error"
        })