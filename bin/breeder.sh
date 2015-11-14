#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;

LYCHEEJS_NODE="";
LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../"; pwd);


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


if [ -d "$3" ]; then
	project="$3";
else
	project="$PWD";
fi;



cd $LYCHEEJS_ROOT;

if [ ! -f "./lychee/build/node/core.js" ]; then
	$LYCHEEJS_NODE ./bin/configure.js;
fi;



case "$1" in

	configure)
		cd $LYCHEEJS_ROOT;
		$LYCHEEJS_NODE ./bin/breeder.js configure "$2" "$project";
	;;

	fertilize)
		cd $LYCHEEJS_ROOT;
		$LYCHEEJS_NODE ./bin/breeder.js fertilize "$project";
	;;

	*)
		cd $LYCHEEJS_ROOT;
		$LYCHEEJS_NODE ./bin/breeder.js help;
	;;

esac;

