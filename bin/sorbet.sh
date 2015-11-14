#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;

LYCHEEJS_NODE="";
LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../"; pwd);
SORBET_PID="$LYCHEEJS_ROOT/sorbet/.pid";
SORBET_LOG="/var/log/sorbet.log";
SORBET_ERR="/var/log/sorbet.err";
SORBET_USER=`whoami`;


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

if [ ! -f "./lib/lychee/build/node/core.js" ]; then
	$LYCHEEJS_NODE ./bin/configure.js;
fi;



case "$1" in

	start)

		cd $LYCHEEJS_ROOT;

		if [ "$SORBET_USER" == "root" ] || [ "$SORBET_USER" == "lycheejs-sorbet" ]; then
			$LYCHEEJS_NODE --expose-gc ./bin/sorbet.js start "$2" >> $SORBET_LOG 2>> $SORBET_ERR
		else
			$LYCHEEJS_NODE --expose-gc ./bin/sorbet.js start "$2"
		fi;

	;;

	status)

		if [ -f "$SORBET_PID" ]; then

			sorbet_pid=$(cat $SORBET_PID);
			sorbet_status=$(ps -e | grep $sorbet_pid | grep -v grep);

			if [ "$sorbet_status" != "" ]; then
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

		$LYCHEEJS_NODE ./bin/sorbet.js stop;

	;;

	restart)

		cd $LYCHEEJS_ROOT;

		$LYCHEEJS_NODE ./bin/sorbet.js stop;

		if [ "$SORBET_USER" == "root" ] || [ "$SORBET_USER" == "lycheejs-sorbet" ]; then
			$LYCHEEJS_NODE --expose-gc ./bin/sorbet.js start "$2" >> $SORBET_LOG 2>> $SORBET_ERR
		else
			$LYCHEEJS_NODE --expose-gc ./bin/sorbet.js start "$2"
		fi;

	;;

	*)

		cd $LYCHEEJS_ROOT;

		$LYCHEEJS_NODE ./bin/sorbet.js help;

	;;

esac;

