#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
USER=`whoami`;

LYCHEEJS_IOJS="";
LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../"; pwd);


if [ "$OS" == "darwin" ]; then

	OS="osx";
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/osx/iojs";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/nwjs.app";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/linux/iojs";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/nwjs";

elif [ "$OS" == "windowsnt" ]; then

	OS="windows";
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/windows/iojs.exe";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/windows/nwjs.exe";

fi;



if [ "$USER" != "root" ]; then

	echo "You are not root.";
	echo "Use \"sudo $0\"";
	exit 1;

else

	cd $LYCHEEJS_ROOT;

	if [[ "$OS" == "linux" || "$OS" == "osx" ]]; then

		echo "Fixing chmod rights...";

		# Default chmod rights for folders

		chmod -R 0777 ./bin;
		chmod -R 0777 ./projects;
		chmod -R 0777 ./lychee;
		chmod -R 0777 ./sorbet;

		touch ./sorbet/.pid;

		# Make command line tools explicitely executable

		chmod +x ./lychee/configure.js;
		chmod +x ./bin/fertilizer.sh;
		chmod +x ./bin/fertilizer.js;
		chmod +x ./bin/helper.sh;
		chmod +x ./bin/sorbet.sh;
		chmod +x ./bin/sorbet.js;

		# Make runtimes explicitely executable

		if [ -f "$LYCHEEJS_IOJS" ]; then
			chmod +x $LYCHEEJS_IOJS;
		fi;

		if [ -f "$LYCHEEJS_NWJS" ]; then
			chmod +x $LYCHEEJS_NWJS;
		fi;

		echo "Done.";

	fi;


	if [ "$OS" == "linux" ]; then

		if [ -d /usr/share/applications ]; then

			echo "Integrating Helper and Ranger...";
			cp ./bin/helper/linux/helper.desktop /usr/share/applications/lycheejs-helper.desktop;
			cp ./bin/helper/linux/ranger.desktop /usr/share/applications/lycheejs-ranger.desktop;
			echo "Done.";

		fi;

	elif [ "$OS" == "osx" ]; then

		echo "Integrating Helper and Ranger...";
		open ./bin/helper/osx/helper.app;
		echo "Done.";

	elif [ "$OS" == "windows" ]; then

		echo "Integrating Helper and Ranger...";
		regedit.exe /S ./bin/helper/windows/helper.reg;
		echo "Done.";

	fi;

fi;



exit 0;

