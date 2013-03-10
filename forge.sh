#!/bin/bash
#
# lycheeJS Forge
#
# Copyright (c) 2012 by Christoph Martens
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
FORGE_ROOT=$(cd "$(dirname "$0")"; pwd);



usage() {

cat <<EOF

lycheeJS Forge v0.7

This program comes with ABSOLUT NO WARRANTY;
This is free software, and you are welcome to redistribute it under certain conditions;
See the LICENSE.txt for details.


Recommended development environment: Ubuntu 13.04 64Bit

Usage: $0 <task> [ <options> ]


Tasks:

    help          Shows this help message
    install       Installs a third-party github project into /external
    start         Starts the WebServer
    stop          Stops the WebServer
    restart       Restarts the WebServer
    status        Checks whether the WebServer is running or not

Options:

    start <profile>
    <profile> is the ID of the profile to use. All profiles are located inside the /forge/profile/ folder.

    install <url> <name>
    <url> is a URL to the zip archive (of the specific branch) on github. The project will be installed to /external/<name>.
	The name has to be identical to the archive's folder prefix.

Examples:

    $0 start default
    $0 stop
    $0 install https://github.com/martensms/lycheejs.org/archive/master.zip lycheejs.org
    $0 start lycheejs.org


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

		echo -e "\n\nERROR: It seems as lycheeJS Forge had a problem.\n\n";
		echo -e "If this error occurs though following the guidelines,";
		echo -e "please report an issue at https://github.com/martensms/lycheeJS/issues";
		echo -e "and attach the ./log file to it. Thanks!";

	fi;

	exit $1;

}


# install_project "http://url/to/file.zip" "name"
install_project() {

	echo -e "\n\n~ ~ ~ install_project($1 $2) ~ ~ ~\n" >> $FORGE_ROOT/log;

	cd $FORGE_ROOT;
	echo -e "Preparing folder structure:\n" >> $FORGE_ROOT/log;

	if [ ! -d "$FORGE_ROOT/external" ]
	then
		mkdir "$FORGE_ROOT/external" >> $FORGE_ROOT/log 2>&1;
	fi;

	if [ ! -d "$FORGE_ROOT/external/.temp" ]
	then

		mkdir "$FORGE_ROOT/external/.temp" >> $FORGE_ROOT/log 2>&1;
		check_success;

	fi;


	if [ -d "$FORGE_ROOT/external/$2" ]
	then

		echo -e "ERROR: Folder already exists (external/$2)\n" >> $FORGE_ROOT/log;
		check_success_step "FAILURE";

	fi;


	echo -e "Downloading zip file:\n" >> $FORGE_ROOT/log;
	wget -O "external/$2.zip" "$1" >> $FORGE_ROOT/log 2>&1;
	check_success "Could not download zip file (wget)";

	echo -e "Extracting zip file:\n" >> $FORGE_ROOT/log;
	unzip "external/$2.zip" -d "external/.temp" >> $FORGE_ROOT/log 2>&1;
	check_success "Could not extract zip file (unzip)";

	rm "external/$2.zip" >> $FORGE_ROOT/log 2>&1;
	check_success "Could not cleanup zip file";

	mv $FORGE_ROOT/external/.temp/"$2"-* "$FORGE_ROOT/external/$2" >> $FORGE_ROOT/log 2>&1;
	check_success "Could not move extracted files to external/$2";

	rm -rf "$FORGE_ROOT/external/.temp" >> $FORGE_ROOT/log 2>&1;
	check_success "Could not cleanup temporary folder";


	check_success_step "SUCCESS";

}

start_webserver() {

	echo -e "\n\n~ ~ ~ start_webserver($1) ~ ~ ~\n" >> $FORGE_ROOT/log;

	echo -e "Environment: "$(uname -a)"\n" >> $FORGE_ROOT/log;


	cd $FORGE_ROOT;


	if [ -f "$FORGE_ROOT/.pid" ]
	then

		echo -e "Forge is already running!";

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


		echo -e "NodeJS command: $nodejs_command\n" >> $FORGE_ROOT/log;


		if [ "$nodejs_command" != "" ]
		then

#			$NODEJS init-nodejs.js >> $FORGE_ROOT/log 2>&1;

			cd $FORGE_ROOT/forge;

			nohup $nodejs_command init-nodejs.js $1 >> $FORGE_ROOT/log &
			FORGE_PID=$!;

			echo $FORGE_PID > $FORGE_ROOT/.pid;
			check_success;

			echo -e "Process ID is $FORGE_PID\n" >> $FORGE_ROOT/log;
		
		fi;

	fi;

	check_success_step "SUCCESS";

}

stop_webserver() {

	echo -e "\n\n~ ~ ~ stop_webserver() ~ ~ ~\n" >> $FORGE_ROOT/log;

	cd $FORGE_ROOT;


	if [ -f "$FORGE_ROOT/.pid" ]
	then

		FORGE_PID=$(cat $FORGE_ROOT/.pid);

		echo -e "Process ID is $FORGE_PID\n" >> $FORGE_ROOT/log;

		if [ "$FORGE_PID" != "" ]
		then

			if ps -p $FORGE_PID > /dev/null
			then
				kill $FORGE_PID > /dev/null 2>&1;
			fi;

		fi;

		rm "$FORGE_ROOT/.pid" >> $FORGE_ROOT/log 2>&1;
		check_success "Could not cleanup PID file";

	fi;


	check_success_step "SUCCESS";

}



case "$1" in

	help)
		usage;
		exit;
		;;

	install)

		echo -e "\nInstalling external github project...";
		install_project "$2" "$3";

		exit;
		;;

	start)

		echo -e "\nStarting WebServer...";

		profile="$2";

		if [ ! -f "$FORGE_ROOT/forge/profile/$profile.json" ]
		then

			echo -e "\tInvalid <profile>, falling back to 'default'.";

			profile="default";

		fi;


		start_webserver $profile;

		exit;
		;;

	status)

		if [ -f "$FORGE_ROOT/.pid" ]
		then

			FORGE_PID=$(cat $FORGE_ROOT/.pid);
			FORGE_STATUS=$(ps -e | grep $FORGE_PID | grep -v grep);

			if [ "$FORGE_STATUS" != "" ]
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

# ps -e | grep 4022 | grep -v grep

		exit;
		;;

	stop)

		echo -e "\nStopping WebServer...";
		stop_webserver;

		exit;
		;;

	restart)

		echo -e "\nRestarting WebServer...";

		profile="$2";
		if [ "$profile" == "" ]
		then
			profile="default";
		fi;


		stop_webserver;
		start_webserver $profile;

		exit;
		;;

esac;



usage;

