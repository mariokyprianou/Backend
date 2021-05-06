#!/bin/bash
AWS_PROFILE=power
AWS_REGION=ap-south-1
AWS_STACK=power-prod-infra

BASTION_USER=ec2-user
RDS_INSTANCE_HOST=pp2kthgn1n1z6n.chvacs07t92e.ap-south-1.rds.amazonaws.com

# Fetch current bastion info from cli
source get_bastion_info.sh
get_bastion_info $AWS_PROFILE $AWS_REGION $AWS_STACK

# Generate an SSL cert to be used to connect to AWS
DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
KEYPATH=$DIRECTORY/cdk_rsa
echo $KEYPATH
if [ -f $KEYPATH ]; then
    echo "Using existing key"
else
    echo "No existing key found, generating..."
    ssh-keygen -b 2048 -t rsa -f $KEYPATH -q -N ""
fi

# Temporarily (~2 mins) allow external ssh connections to the bastion host using the newly generated cert
aws ec2-instance-connect send-ssh-public-key \
    --region $AWS_REGION \
    --profile $AWS_PROFILE \
    --instance-id $BASTION_ID \
    --availability-zone $BASTION_AVAILABILITY_ZONE \
    --instance-os-user $BASTION_USER \
    --ssh-public-key file://$KEYPATH.pub

# Forward remote RDS port to local port 38080
ssh -i $KEYPATH -N -L 38080:$RDS_INSTANCE_HOST:5432 $BASTION_USER@$BASTION_HOST