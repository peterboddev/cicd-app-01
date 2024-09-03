import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class ApiGatewayLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function
    const lambdaFunction = new lambda.Function(this, 'QueryLambda', {
      runtime: lambda.Runtime.NODEJS_18_X, // Set Node.js 18 runtime
      code: lambda.Code.fromAsset('../lambda'), // Path to your Lambda function code
      handler: 'index.handler',
      environment: {
        TABLE_NAME: 'EmployeesTable', // The name of the DynamoDB table
      },
    });

    // Grant the Lambda function read permissions on the DynamoDB table
    const table = dynamodb.Table.fromTableName(this, 'ExistingTable', 'EmployeesTable');
    table.grantReadData(lambdaFunction);

    // Define the API Gateway
    const api = new apigateway.RestApi(this, 'ApiGateway', {
      restApiName: 'Employees API',
    });

    const getEmployees = api.root.addResource('employees');
    getEmployees.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunction, {
      proxy: true,
    }));
  }
}
