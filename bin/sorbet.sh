#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;

LYCHEEJS_IOJS="";
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
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/osx/$ARCH/iojs";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/linux/$ARCH/iojs";

elif [ "$OS" == "windows_nt" ]; then

	OS="windows";
	ARCH="x86"; # Well, fuck you, Microsoft
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/windows/$ARCH/iojs.exe";

fi;

if [ ! -f $LYCHEEJS_IOJS ]; then
	echo "Sorry, your computer is not supported. ($OS / $ARCH)";
	exit 1;
fi;



case "$1" in

	start)

		cd $LYCHEEJS_ROOT;

		if [ "$SORBET_USER" == "root" ] || [ "$SORBET_USER" == "lycheejs-sorbet" ]; then 
			$LYCHEEJS_IOJS --expose-gc ./bin/sorbet.js start "$2" >> $SORBET_LOG 2>> $SORBET_ERR
		else
			$LYCHEEJS_IOJS --expose-gc ./bin/sorbet.js start "$2"
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
		$LYCHEEJS_IOJS ./bin/sorbet.js stop;

	;;

	restart)

		cd $LYCHEEJS_ROOT;
		$LYCHEEJS_IOJS ./bin/sorbet.js stop;

		if [ "$SORBET_USER" == "root" ] || [ "$SORBET_USER" == "lycheejs-sorbet" ]; then 
			$LYCHEEJS_IOJS --expose-gc ./bin/sorbet.js start "$2" >> $SORBET_LOG 2>> $SORBET_ERR
		else
			$LYCHEEJS_IOJS --expose-gc ./bin/sorbet.js start "$2"
		fi;

	;;

	*)

		cd $LYCHEEJS_ROOT;
		$LYCHEEJS_IOJS ./bin/sorbet.js help;

	;;

esac;

