#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;
USER=`whoami`;

LYCHEEJS_NODE="";
LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../"; pwd);

NO_INTEGRATION=false;
if [ "$1" == "--no-integration" ]; then
	NO_INTEGRATION=true;
fi;


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
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/nwjs.app";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/nwjs";

fi;



if [ "$USER" != "root" ]; then

	echo "You are not root.";
	echo "Use \"sudo $0\"";

else

	if [[ "$OS" == "linux" || "$OS" == "osx" ]]; then

		echo "> Building lycheeJS core and fertilizers";


		cd $LYCHEEJS_ROOT;


		$LYCHEEJS_NODE ./bin/configure.js;

		./bin/fertilizer.sh lychee html/dist;
		./bin/fertilizer.sh lychee html-nwjs/dist;
		./bin/fertilizer.sh lychee html-webview/dist;
		./bin/fertilizer.sh lychee node/dist;
		./bin/fertilizer.sh lychee node-sdl/dist;


		echo "> DONE";

	fi;


	if [[ "$OS" == "linux" || "$OS" == "osx" ]]; then

		echo "> Fixing chmod rights";


		cd $LYCHEEJS_ROOT;

		# Default chmod rights for folders

		find ./lib -type d -print0 | xargs -0 chmod 777;
		find ./lib -type f -print0 | xargs -0 chmod 666;

		find ./projects -type d -print0 | xargs -0 chmod 777;
		find ./projects -type f -print0 | xargs -0 chmod 666;

		# Make command line tools explicitely executable

		chmod +x ./projects/*/sorbet.js;

		chmod 0777 ./bin;
		chmod +x ./bin/breeder.js;
		chmod +x ./bin/breeder.sh;
		chmod +x ./bin/configure.js;
		chmod +x ./bin/editor.sh;
		chmod +x ./bin/fertilizer.js;
		chmod +x ./bin/fertilizer.sh;
		chmod +x ./bin/helper.sh;
		chmod +x ./bin/ranger.sh;
		chmod +x ./bin/sorbet.js;
		chmod +x ./bin/sorbet.sh;

		# Make runtimes explicitely executable

		if [ -f "$LYCHEEJS_NODE" ]; then
			chmod +x $LYCHEEJS_NODE;
		fi;

		if [ -f "$LYCHEEJS_NWJS" ]; then
			chmod +x $LYCHEEJS_NWJS;
		fi;


		echo "> DONE";

	fi;


	if [ "$NO_INTEGRATION" == "false" ]; then

		if [ "$OS" == "linux" ]; then

			if [ -d /usr/share/applications ]; then

				echo "> Integrating Editor, Helper and Ranger";

				cp ./bin/helper/linux/editor.desktop /usr/share/applications/lycheejs-editor.desktop;
				cp ./bin/helper/linux/helper.desktop /usr/share/applications/lycheejs-helper.desktop;
				cp ./bin/helper/linux/ranger.desktop /usr/share/applications/lycheejs-ranger.desktop;
				cp ./asset/desktop.svg /usr/share/icons/lycheejs.svg;


				sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-editor.desktop";
				sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-helper.desktop";
				sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-ranger.desktop";


				update-desktop-database;


				echo "> DONE";

			fi;

		elif [ "$OS" == "osx" ]; then

			echo "> Integrating Editor, Helper and Ranger";
			open ./bin/helper/osx/helper.app;
			echo "> DONE";

		fi;

	fi;

fi;

