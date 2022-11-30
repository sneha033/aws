// Imports
// Done: Import the ec2 client
const {
  EC2Client,
  DescribeInstancesCommand,
  TerminateInstancesCommand
} = require('@aws-sdk/client-ec2')

function sendCommand (command) {
  const client = new EC2Client({ region: process.env.AWS_REGION })
  return client.send(command)
}

async function listInstances () {
  // Done: List instances using DescribeInstancesCommand
  const command = new DescribeInstancesCommand({});
  sendCommand(command)    //it prints reservations
/*  const data = sendCommand(command)
  return data.Reservations.reduce((i,r)=>{
    return i.concat(r.Instances)   //i=instance array r=current reservations obj
  },[]) //[]=is seed that reduce func requires
  */
}

async function terminateInstance (instanceId) {
  // Done: Terminate an instance with a given instanceId
 const params={
    InstanceIds:[instanceId]
  }
  const command = new TerminateInstancesCommand(params)
  return sendCommand(command)

}

//listInstances().then(console.log)
 terminateInstance().then(console.log)
//here terminateInstance('instanceId which we have received from list')
