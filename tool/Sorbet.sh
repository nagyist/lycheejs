#!/bin/bash
#
# lycheeJS Sorbet
#
# Copyright (c) 2014 by LazerUnicorns Ltd.
#
# This project is released under the terms
# of the MIT License
#
# Please see the LICENSE.txt included with this
# distribution for further details.
#


UNAME_P=$(uname -p);
NODEJS=$(which nodejs);
NODE=$(which node);
SORBET_ROOT=$(cd "$(dirname "$0")/../"; pwd);
SORBET_LOG=$SORBET_ROOT/sorbet/log;
SORBET_PID=$SORBET_ROOT/sorbet/pid;



usage() {

cat <<EOF

lycheeJS Sorbet v0.8

This program comes with ABSOLUT NO WARRANTY;
This is free software, and you are welcome to redistribute it under certain conditions;
See the LICENSE.txt for details.


Recommended development environment: Ubuntu 14.04 (amd64)

Usage: $0 <task> [ <options> ]


Tasks:

    help          Shows this help message
    start         Starts the webserver
    stop          Stops the webserver
    restart       Restarts the webserver
    status        Checks whether the webserver is running or not

Options:

    start <profile>
    <profile> is the ID of the profile to use. All profiles are located inside the /sorbet/profile/ folder.

Examples:

    $0 start localhost
	$0 restart localhost
    $0 stop
    $0 start lycheejs.org
	$0 status

EOF

}

check_success() {

	if [ ! "$?" -eq "0" ]
	then

		if [ "$1" != "" ]
		then
			check_success_step "FAILURE" "$1";
		else
			check_success_step "FAILURE" "Sub-Process exited with exit code $?";
		fi;

	fi;

}

# check_success_step "FAILURE" "message"
# check_success_step "SUCCESS" "message"
check_success_step() {

	if [ "$1" == "SUCCESS" ]
	then
		echo -e "done.";
	else
		echo -e "failed. ($2)";
		finish 1;
	fi;

}

# finish 1
finish() {

	if [ $1 -eq 1 ]
	then

		echo -e "\n\nERROR: It seems as lycheeJS Sorbet had a problem.\n\n";
		echo -e "If this error occurs though following the guidelines,";
		echo -e "please report an issue at https://github.com/LazerUnicorns/lycheeJS/issues";
		echo -e "and attach the /sorbet/log file to it. Thanks!";

	fi;

	exit $1;

}

# start_sorbet localhost
start_sorbet() {

	echo -e "\n\n~ ~ ~ start_sorbet($1) ~ ~ ~\n" >> $SORBET_LOG;

	echo -e "Environment: "$(uname -a) >> $SORBET_LOG;


	cd $SORBET_ROOT;


	if [ -f "$SORBET_PID" ]
	then
		echo -e "Sorbet is already running!";
	else

		nodejs_command="";

		if [ "$NODEJS" != "" ]
		then
			nodejs_command="$NODEJS";
		fi;

		if [ "$NODE" != "" ]
		then
			nodejs_command="$NODE";
		fi;


		echo -e "nodejs_command: $nodejs_command" >> $SORBET_LOG;


		if [ "$nodejs_command" != "" ]
		then

			cd $SORBET_ROOT;

			nohup $nodejs_command ./tool/Sorbet.js $1 >> $SORBET_LOG &
			sorbet_pid=$!;

			echo $sorbet_pid > $SORBET_PID;
			check_success;

			echo -e "sorbet_pid: $sorbet_pid.\n" >> $SORBET_LOG;
		
		fi;

	fi;

	check_success_step "SUCCESS";

}

stop_sorbet() {

	echo -e "\n\n~ ~ ~ stop_sorbet() ~ ~ ~\n" >> $SORBET_LOG;

	cd $SORBET_ROOT;


	if [ -f "$SORBET_PID" ]
	then

		sorbet_pid=$(cat $SORBET_PID);

		echo -e "Process ID is $sorbet_pid.\n" >> $SORBET_LOG;

		if [ "$sorbet_pid" != "" ]
		then

			if ps -p $sorbet_pid > /dev/null
			then
				pkill -P $sorbet_pid > /dev/null 2>&1;
				kill $sorbet_pid > /dev/null 2>&1;
			fi;

		fi;

		rm "$SORBET_PID" >> $SORBET_LOG 2>&1;
		check_success "Could not cleanup PID file";

	fi;


	check_success_step "SUCCESS";

}



case "$1" in

	help)
		usage;
		exit;
		;;

	start)

		echo -e "\nStarting Sorbet ...";

		profile="$2";

		if [ ! -f "$SORBET_ROOT/sorbet/profile/$profile.json" ]
		then
			echo -e "\tInvalid <profile>, falling back to 'localhost'.";
			profile="localhost";
		fi;


		start_sorbet $profile;

		exit;
		;;

	status)

		if [ -f "$SORBET_PID" ]
		then

			sorbet_pid=$(cat $SORBET_PID);
			sorbet_status=$(ps -e | grep $sorbet_pid | grep -v grep);

			if [ "$sorbet_status" != "" ]
			then
				echo -e "Running";
				exit 0;
			else
				echo -e "Not running";
				exit 1;
			fi;

		else

			echo -e "Not running";
			exit 1;

		fi;

		exit;
		;;

	stop)

		echo -e "\nStopping Sorbet ...";
		stop_sorbet;

		exit;
		;;

	restart)

		echo -e "\nRestarting Sorbet ...";

		profile="$2";
		if [ "$profile" == "" ]
		then
			profile="localhost";
		fi;


		stop_sorbet;
		start_sorbet $profile;

		exit;
		;;

esac;



usage;

