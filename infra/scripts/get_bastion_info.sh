#!/bin/bash

function get_bastion_info {
    local AWS_PROFILE=$1
    local AWS_REGION=$2
    local AWS_STACKNAME=$3
    
    local RESPONSE=$(aws ec2 describe-instances \
        --profile $AWS_PROFILE \
        --region $AWS_REGION \
        --query "Reservations[*].Instances[*].[InstanceId,PublicDnsName,Placement.AvailabilityZone]" \
        --filters Name=tag:Name,Values=BastionHost Name=tag:aws:cloudformation:stack-name,Values=$AWS_STACKNAME \
        --output text)

    if [[ $? -ne 0 ]] || [[ -z "$RESPONSE" ]]; then
        # There was no response, so no such instance.
        return 1        # 1 in Bash script means error/false
    fi

    BASTION_ID=$(echo "$RESPONSE" | cut -f 1)
    BASTION_HOST=$(echo "$RESPONSE" | cut -f 2)
    BASTION_AVAILABILITY_ZONE=$(echo "$RESPONSE" | cut -f 3)

    echo "Found bastion info id=$BASTION_ID, az=${BASTION_AVAILABILITY_ZONE}, hostname=$BASTION_HOST"

    return 0
}