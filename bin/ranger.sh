#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;

LYCHEEJS_IOJS="";
LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../"; pwd);
SORBET_PID="$LYCHEEJS_ROOT/sorbet/.pid";
SORBET_LOG="/var/log/sorbet.log";
SORBET_ERR="/var/log/sorbet.err";
SORBET_USER=`whoami`;


if [ "$OS" == "darwin" ]; then

	OS="osx";
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/osx/iojs";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/linux/iojs";

elif [ "$OS" == "windowsnt" ]; then

	OS="windows";
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/windows/iojs.exe";

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
		cp ./asset/softcore/desktop ./bin/ranger/icon.png;

		mv ./projects/cultivator/ranger/build/html-nwjs/main-linux ./bin/ranger/linux;
		mv ./projects/cultivator/ranger/build/html-nwjs/main-osx ./bin/ranger/osx;
		mv ./projects/cultivator/ranger/build/html-nwjs/main-windows ./bin/ranger/windows;

		rm -rf ./projects/cultivator/ranger/build;

	fi;

fi;


if [ -d "./bin/ranger" ]; then

	if [ "$OS" == "linux" ]; then

		./bin/ranger/linux/ranger;
		exit 0;

	elif [ "$OS" == "osx" ]; then

		open ./bin/ranger/osx/ranger.app;
		exit 0;

	elif [ "$OS" == "windows" ]; then

		./bin/ranger/windows/ranger.exe;
		exit 0;

	fi;

fi;

