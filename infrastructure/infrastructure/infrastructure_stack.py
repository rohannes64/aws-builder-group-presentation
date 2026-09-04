from aws_cdk import (
    Duration,
    RemovalPolicy,
    Stack,
    # aws_sqs as sqs,
    aws_dynamodb as dynDB,
    aws_lambda as lamda,
    aws_apigatewayv2 as apigateway,
    aws_apigatewayv2_integrations as integrations
)
from constructs import Construct

class InfrastructureStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        table = dynDB.Table(
            self,
            "BuildersClubTable",
            partition_key=dynDB.Attribute(
                name="pk",
                type=dynDB.AttributeType.STRING,
            ),
            sort_key=dynDB.Attribute(
                name="sk",
                type=dynDB.AttributeType.STRING,
            ),
            billing_mode=dynDB.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )
        
        table.add_global_secondary_index(
            index_name="CheckInCredentialIndex",
            partition_key=dynDB.Attribute(
                name="checkInEventKey",
                type=dynDB.AttributeType.STRING,
            ),
            sort_key=dynDB.Attribute(
                name="CheckInHashID",
                type=dynDB.AttributeType.STRING,
            ),
        )
        
        register_lambda = lamda.Function(
            self,
            "RegisterLambda",
            runtime=lamda.Runtime.PYTHON_3_12,
            handler="handler.handler",
            code=lamda.Code.from_asset("lambda/register"),
            timeout=Duration.seconds(10),
            environment={
                "TABLE_NAME": table.table_name,
            }            
        )
        
        checkin_lambda = lamda.Function(
                    self,
                    "CheckinLambda",
                    runtime=lamda.Runtime.PYTHON_3_12,
                    handler="handler.handler",
                    code=lamda.Code.from_asset("lambda/checkin"),
                    timeout=Duration.seconds(10),
                    environment={
                        "TABLE_NAME": table.table_name,
                    }            
                )
        
        event_lambda = lamda.Function(
                            self,
                            "EventLambda",
                            runtime=lamda.Runtime.PYTHON_3_12,
                            handler="handler.handler",
                            code=lamda.Code.from_asset("lambda/event"),
                            timeout=Duration.seconds(10),
                            environment={
                                "TABLE_NAME": table.table_name,
                            }            
                        )
        
        stats_lambda = lamda.Function(
                                    self,
                                    "StatsLambda",
                                    runtime=lamda.Runtime.PYTHON_3_12,
                                    handler="handler.handler",
                                    code=lamda.Code.from_asset("lambda/stats"),
                                    timeout=Duration.seconds(10),
                                    environment={
                                        "TABLE_NAME": table.table_name,
                                    }            
                                )
        table.grant_read_write_data(register_lambda)       
        table.grant_read_write_data(checkin_lambda)
        
        table.grant_read_data(event_lambda)       
        table.grant_read_data(stats_lambda)
        
        
        api = apigateway.HttpApi(
                                self,
                                "BuildersClubApi",                               
                                cors_preflight=apigateway.CorsPreflightOptions(
                                    allow_origins=["*"],
                                    allow_methods=[apigateway.CorsHttpMethod.GET,apigateway.CorsHttpMethod.POST,
                                    apigateway.CorsHttpMethod.OPTIONS,
                                    ],
                                    allow_headers=["*"],
                                ), 
                                 )
        api.add_routes(
            path="/register",
            methods=[apigateway.HttpMethod.POST],
            integration=integrations.HttpLambdaIntegration(
                "RegisterIntegration",
                register_lambda,
            ),
        )       
        
        api.add_routes(
            path="/checkin",
            methods=[apigateway.HttpMethod.POST],
            integration=integrations.HttpLambdaIntegration(
                "CheckinIntegration",
                checkin_lambda,
                ),
            )  
        
        api.add_routes(
            path="/event",
            methods=[apigateway.HttpMethod.GET],
            integration=integrations.HttpLambdaIntegration(
                "EventIntegration",
                event_lambda,
            ),
        )
        api.add_routes(
                    path="/stats",
                    methods=[apigateway.HttpMethod.GET],
                    integration=integrations.HttpLambdaIntegration(
                        "StatsIntegration",
                        stats_lambda,
                    ),
                )