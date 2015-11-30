#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;

LYCHEEJS_NODE="";
LYCHEEJS_ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);
HARVESTER_PID="$LYCHEEJS_ROOT/bin/harvester.pid";
HARVESTER_LOG="/var/log/harvester.log";
HARVESTER_ERR="/var/log/harvester.err";
HARVESTER_USER=`whoami`;


if [ "$ARCH" == "x86_64" -o "$ARCH" == "amd64" ]; then
	ARCH="x86_64";
fi;

if [ "$ARCH" == "i386" -o "$ARCH" == "i686" -o "$ARCH" == "i686-64" ]; then
	ARCH="x86";
fi;

if [ "$ARCH" == "armv7l" -o "$ARCH" == "armv8" ]; then
	ARCH="arm";
fi;


if [ "$OS" == "darwin" ]; then

	OS="osx";
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/osx/$ARCH/node";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";

fi;

if [ ! -f $LYCHEEJS_NODE ]; then
	echo "Sorry, your computer is not supported. ($OS / $ARCH)";
	exit 1;
fi;



cd $LYCHEEJS_ROOT;

if [ ! -f "./libraries/lychee/build/node/core.js" ]; then
	$LYCHEEJS_NODE ./bin/configure.js;
fi;



case "$1" in

	start)

		INTEGRATION_FLAG="";
		if [ "$3" == "--no-integration" ]; then
			INTEGRATION_FLAG="--no-integration";
		fi;


		cd $LYCHEEJS_ROOT;

		if [ "$HARVESTER_USER" == "root" ] || [ "$HARVESTER_USER" == "lycheejs-harvester" ]; then
			$LYCHEEJS_NODE --expose-gc ./bin/harvester.js start "$2" "$INTEGRATION_FLAG" >> $HARVESTER_LOG 2>> $HARVESTER_ERR
		else
			$LYCHEEJS_NODE --expose-gc ./bin/harvester.js start "$2" "$INTEGRATION_FLAG"
		fi;

	;;

	status)

		if [ -f "$HARVESTER_PID" ]; then

			harvester_pid=$(cat $HARVESTER_PID);
			harvester_status=$(ps -e | grep $harvester_pid | grep -v grep);

			if [ "$harvester_status" != "" ]; then
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

	;;

	stop)

		cd $LYCHEEJS_ROOT;

		$LYCHEEJS_NODE ./bin/harvester.js stop;

	;;

	restart)

		INTEGRATION_FLAG="";
		if [ "$3" == "--no-integration" ]; then
			INTEGRATION_FLAG="--no-integration";
		fi;


		cd $LYCHEEJS_ROOT;

		$LYCHEEJS_NODE ./bin/harvester.js stop;

		if [ "$HARVESTER_USER" == "root" ] || [ "$HARVESTER_USER" == "lycheejs-harvester" ]; then
			$LYCHEEJS_NODE --expose-gc ./bin/harvester.js start "$2" "$INTEGRATION_FLAG" >> $HARVESTER_LOG 2>> $HARVESTER_ERR
		else
			$LYCHEEJS_NODE --expose-gc ./bin/harvester.js start "$2" "$INTEGRATION_FLAG"
		fi;

	;;

	*)

		cd $LYCHEEJS_ROOT;

		$LYCHEEJS_NODE ./bin/harvester.js help;

	;;

esac;

