// Imports
// Done: Import the ec2 client
const{ 
  EC2Client,
  AuthorizeSecurityGroupIngressCommand,
  CreateKeyPairCommand,
  CreateSecurityGroupCommand,
  RunInstancesCommand
}=require('@aws-sdk/client-ec2')

const helpers = require('./helpers')

function sendCommand (command) {
  // Done: Create new client with region
  const client = new EC2Client({region:process.env.AWS_REGION})

  // Done: Return send command
  return client.send(command)
}

// Declare local variables
const sgName = 'hamster_sg'
const keyName = 'hamster_key'

// Do all the things together
async function execute () {
  try {
    await createSecurityGroup(sgName)
    const keyPair = await createKeyPair(keyName)
    await helpers.persistKeyPair(keyPair) //save the keypair created
    const data = await createInstance(sgName, keyName)
    console.log('Created instance with:', data)
  } catch (err) {
    console.error('Failed to create instance with:', err)
  }
}

// Create functions
async function createSecurityGroup (sgName) {
  // Done: Implement sg creation & setting SSH rule
  const sgParams ={
    Description: sgName,
    GroupName:sgName
  }
  const createCommand = new CreateSecurityGroupCommand(sgParams)
  const data = await sendCommand(createCommand)
//it will create SG and return data of that SG

//Rules for SG inbound
//enable port 22: to SSH into instance
//enable port 3000 to access our site
const rulesParams={
  GroupId: data.GroupId,
  IpPermissions:[
    {
      IpProtocol:'tcp',
      FromPort:22,
      ToPort:22,
      IpRanges:[{CidrIp:'0.0.0.0/0'}]
    },
    {
      IpProtocol:'tcp',
      FromPort:3000,
      ToPort:3000,
      IpRanges:[{CidrIp:'0.0.0.0/0'}]
    }
  ]
}
  const authCommand = new AuthorizeSecurityGroupIngressCommand(rulesParams)
  return (sendCommand(authCommand))
}

async function createKeyPair (keyName) {
  // Done: Create keypair
  const params={
    KeyName:keyName
  }
  const command = new CreateKeyPairCommand(params)
  return sendCommand(command) // we need the key pair, if we don't use return it will throw away key pair and it will be useless

}

async function createInstance (sgName, keyName) {
  // Done: create ec2 instance
  const params ={
    ImageId:'ami-0beaa649c482330f7',//AMI id to create the instance //from aws console
    InstanceType:'t2.micro',
    KeyName:keyName,
    MaxCount:1,//how many instances to create
    MinCount:1,
    SecurityGroups: [sgName],
    UserData:'IyEvYmluL2Jhc2gKY3VybCAtLXNpbGVudCAtLWxvY2F0aW9uIGh0dHBzOi8vcnBtLm5vZGVzb3VyY2UuY29tL3NldHVwXzE2LnggfCBzdWRvIGJhc2ggLQpzdWRvIHl1bSBpbnN0YWxsIC15IG5vZGVqcwpzdWRvIHl1bSBpbnN0YWxsIC15IGdpdApjZCBob21lL2VjMi11c2VyCmdpdCBjbG9uZSBodHRwczovL2dpdGh1Yi5jb20vcnlhbm11cmFrYW1pL2hiZmwuZ2l0CmNkIGhiZmwKbnBtIGkKbnBtIHJ1biBzdGFydA=='
    //taken from ec2-shartup.sh, base 64 encoded format
  }
  const command = new RunInstancesCommand(params)
  return sendCommand(command)
}
execute()
//this code is written in consideration that u have default VPC for that region
//default subnets must provide public IP address when instances are launched auto-assign Ip add
