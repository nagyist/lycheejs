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



cd $LYCHEEJS_ROOT;

if [ ! -f "./lychee/build/html-nwjs/core.js" ]; then
	$LYCHEEJS_IOJS ./lychee/configure.js;
fi;


if [ ! -d "./bin/ranger" ]; then

	if [ -d "./projects/cultivator/ranger/build" ]; then
		rm -rf ./projects/cultivator/ranger/build;
	fi;


	./bin/fertilizer.sh cultivator/ranger "html-nwjs/main";


	if [ -d "./projects/cultivator/ranger/build/html-nwjs" ]; then

		# 1. Remove previously packaged builds

		rm -rf ./projects/cultivator/ranger/build/html-nwjs/main-linux;
		rm -rf ./projects/cultivator/ranger/build/html-nwjs/main-osx;
		rm -rf ./projects/cultivator/ranger/build/html-nwjs/main-windows;


		# 2. Inject design from cultivator project

		cp -R ./projects/cultivator/design ./projects/cultivator/ranger/build/html-nwjs/main/design;


		# Well, fuck you, Apple.
		if [ "$OS" == "osx" ]; then
			sed -i '' 's/\/projects\/cultivator\/design/.\/design/g' ./projects/cultivator/ranger/build/html-nwjs/main/index.html;
		else
			sed -i.bak 's/\/projects\/cultivator\/design/.\/design/g' ./projects/cultivator/ranger/build/html-nwjs/main/index.html;
			rm ./projects/cultivator/ranger/build/html-nwjs/main/index.html.bak;
		fi;


		# 3. Re-package builds

		cd ./bin/runtime/html-nwjs;
		./package.sh /projects/cultivator/ranger/build/html-nwjs/main ranger;


		# 4. Cache binaries for fast bootup

		cd $LYCHEEJS_ROOT;
		mkdir ./bin/ranger;
		cp ./asset/softcore/desktop.png ./bin/ranger/icon.png;

		mv ./projects/cultivator/ranger/build/html-nwjs/main-linux ./bin/ranger/linux;
		mv ./projects/cultivator/ranger/build/html-nwjs/main-osx ./bin/ranger/osx;
		mv ./projects/cultivator/ranger/build/html-nwjs/main-windows ./bin/ranger/windows;

		rm -rf ./projects/cultivator/ranger/build;

	fi;

fi;


if [ -d "./bin/ranger" ]; then

	if [ "$OS" == "linux" ]; then

		./bin/ranger/linux/$ARCH/ranger;
		exit 0;

	elif [ "$OS" == "osx" ]; then

		open ./bin/ranger/osx/$ARCH/ranger.app;
		exit 0;

	elif [ "$OS" == "windows" ]; then

		./bin/ranger/windows/$ARCH/ranger.exe;
		exit 0;

	fi;

fi;

