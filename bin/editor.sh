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


if [ ! -d "./bin/editor" ]; then

	if [ -d "./projects/cultivator/editor/build" ]; then
		rm -rf ./projects/cultivator/editor/build;
	fi;


	./bin/fertilizer.sh cultivator/editor "html-nwjs/main";


	if [ -d "./projects/cultivator/editor/build/html-nwjs" ]; then

		# 1. Remove previously packaged builds

		rm -rf ./projects/cultivator/editor/build/html-nwjs/main-linux;
		rm -rf ./projects/cultivator/editor/build/html-nwjs/main-osx;
		rm -rf ./projects/cultivator/editor/build/html-nwjs/main-windows;


		# 2. Inject design from cultivator project

		cp -R ./projects/cultivator/design ./projects/cultivator/editor/build/html-nwjs/main/design;


		# Well, fuck you, Apple.
		if [ "$OS" == "osx" ]; then
			sed -i '' 's/\/projects\/cultivator\/design/.\/design/g' ./projects/cultivator/editor/build/html-nwjs/main/index.html;
		else
			sed -i.bak 's/\/projects\/cultivator\/design/.\/design/g' ./projects/cultivator/editor/build/html-nwjs/main/index.html;
			rm ./projects/cultivator/editor/build/html-nwjs/main/index.html.bak;
		fi;


		# 3. Re-package builds

		cd ./bin/runtime/html-nwjs;
		./package.sh /projects/cultivator/editor/build/html-nwjs/main editor;


		# 4. Cache binaries for fast bootup

		cd $LYCHEEJS_ROOT;
		mkdir ./bin/editor;
		cp ./asset/softcore/desktop.png ./bin/editor/icon.png;

		mv ./projects/cultivator/editor/build/html-nwjs/main-linux ./bin/editor/linux;
		mv ./projects/cultivator/editor/build/html-nwjs/main-osx ./bin/editor/osx;
		mv ./projects/cultivator/editor/build/html-nwjs/main-windows ./bin/editor/windows;

#		rm -rf ./projects/cultivator/editor/build;

	fi;

fi;


if [ -d "./bin/editor" ]; then

	if [ "$OS" == "linux" ]; then

		./bin/editor/linux/$ARCH/editor "$1";
		exit 0;

	elif [ "$OS" == "osx" ]; then

		open ./bin/editor/osx/$ARCH/editor.app "$1";
		exit 0;

	elif [ "$OS" == "windows" ]; then

		./bin/editor/windows/$ARCH/editor.exe "$1";
		exit 0;

	fi;

fi;

