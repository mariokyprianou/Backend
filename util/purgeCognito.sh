#!/bin/bash

USER_POOL_ID="ap-south-1_IKCoLjZya"
REGION="ap-south-1"
 
 
RUN=1
until [ $RUN -eq 0 ] ; do
echo "Listing users"
USERS=`aws cognito-idp list-users --region ${REGION}  --user-pool-id ${USER_POOL_ID} --profile power | grep Username | awk -F: '{print $2}' | sed -e 's/\"//g' | sed -e 's/,//g'`
if [ ! "x$USERS" = "x" ] ; then
	for user in $USERS; do
		echo "Deleting user $user"
		aws cognito-idp admin-delete-user --region ${REGION} --user-pool-id ${USER_POOL_ID} --username ${user} --profile power
		echo "Result code: $?"
		echo "Done"
	done
else
	echo "Done, no more users"
	RUN=0
fi
done 
