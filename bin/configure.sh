#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;
USER=`whoami`;

LYCHEEJS_NODE="";
LYCHEEJS_ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);

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
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/$ARCH/nwjs.app";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw";

fi;



if [ "$USER" != "root" ]; then

	echo "You are not root.";
	echo "Use \"sudo $0\"";

else

	if [[ "$OS" == "linux" || "$OS" == "osx" ]]; then

		echo "> Building lycheeJS core and fertilizers";


		cd $LYCHEEJS_ROOT;


		$LYCHEEJS_NODE ./bin/configure.js;

		./bin/fertilizer.sh html/dist /libraries/lychee;
		./bin/fertilizer.sh html-nwjs/dist /libraries/lychee;
		./bin/fertilizer.sh html-webview/dist /libraries/lychee;
		./bin/fertilizer.sh node/dist /libraries/lychee;
		./bin/fertilizer.sh node-sdl/dist /libraries/lychee;

		./bin/fertilizer.sh node/dist /libraries/harvester;
		./bin/fertilizer.sh node-sdl/dist /libraries/harvester;


		echo "> DONE";

	fi;


	if [[ "$OS" == "linux" || "$OS" == "osx" ]]; then

		echo "> Fixing chmod rights";


		cd $LYCHEEJS_ROOT;

		# Default chmod rights for folders

		find ./libraries -type d -print0 | xargs -0 chmod 777;
		find ./libraries -type f -print0 | xargs -0 chmod 666;

		find ./projects -type d -print0 | xargs -0 chmod 777;
		find ./projects -type f -print0 | xargs -0 chmod 666;

		# Make command line tools explicitely executable

		chmod +x ./projects/*/harvester.js;

		chmod 0777 ./bin;
		chmod 0777 -R ./bin/harvester;

		chmod +x ./bin/breeder.js;
		chmod +x ./bin/breeder.sh;
		chmod +x ./bin/configure.js;
		chmod +x ./bin/editor.sh;
		chmod +x ./bin/fertilizer.js;
		chmod +x ./bin/fertilizer.sh;
		chmod +x ./bin/harvester.js;
		chmod +x ./bin/harvester.sh;
		chmod +x ./bin/helper.sh;
		chmod +x ./bin/ranger.sh;
		chmod +x ./bin/strainer.js;
		chmod +x ./bin/strainer.sh;

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

				echo "> Integrating GUI Applications";


				cp ./bin/helper/linux/editor.desktop /usr/share/applications/lycheejs-editor.desktop;
				cp ./bin/helper/linux/helper.desktop /usr/share/applications/lycheejs-helper.desktop;
				cp ./bin/helper/linux/ranger.desktop /usr/share/applications/lycheejs-ranger.desktop;
				cp ./bin/helper/linux/lycheejs.svg /usr/share/icons/lycheejs.svg;

				sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-editor.desktop";
				sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-helper.desktop";
				sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-ranger.desktop";


				update-desktop-database;


				echo "> DONE";

			fi;

			if [ -d /usr/local/bin ]; then

				echo "> Integrating CLI Applications";


				rm /usr/local/bin/lycheejs-breeder 2> /dev/null;
				rm /usr/local/bin/lycheejs-editor 2> /dev/null;
				rm /usr/local/bin/lycheejs-fertilizer 2> /dev/null;
				rm /usr/local/bin/lycheejs-harvester 2> /dev/null;
				rm /usr/local/bin/lycheejs-helper 2> /dev/null;
				rm /usr/local/bin/lycheejs-ranger 2> /dev/null;
				rm /usr/local/bin/lycheejs-strainer 2> /dev/null;

				ln -s "$LYCHEEJS_ROOT/bin/breeder.sh" /usr/local/bin/lycheejs-breeder;
				ln -s "$LYCHEEJS_ROOT/bin/editor.sh" /usr/local/bin/lycheejs-editor;
				ln -s "$LYCHEEJS_ROOT/bin/fertilizer.sh" /usr/local/bin/lycheejs-fertilizer;
				ln -s "$LYCHEEJS_ROOT/bin/harvester.sh" /usr/local/bin/lycheejs-harvester;
				ln -s "$LYCHEEJS_ROOT/bin/helper.sh" /usr/local/bin/lycheejs-helper;
				ln -s "$LYCHEEJS_ROOT/bin/ranger.sh" /usr/local/bin/lycheejs-ranger;
				ln -s "$LYCHEEJS_ROOT/bin/strainer.sh" /usr/local/bin/lycheejs-strainer;


				echo "> DONE";

			fi;

		elif [ "$OS" == "osx" ]; then

			echo "> Integrating GUI Applications";


			open ./bin/helper/osx/helper.app;


			echo "> DONE";


			if [ -d /usr/local/bin ]; then

				echo "> Integrating CLI Applications";


				# Well, fuck you, Apple.
				if [ ! -f /usr/local/bin/png2icns ]; then
					cp "$LYCHEEJS_ROOT/bin/helper/osx/png2icns.sh" /usr/local/bin/png2icns;
					chmod +x /usr/local/bin/png2icns;
				fi;


				rm /usr/local/bin/lycheejs-breeder 2> /dev/null;
				rm /usr/local/bin/lycheejs-editor 2> /dev/null;
				rm /usr/local/bin/lycheejs-fertilizer 2> /dev/null;
				rm /usr/local/bin/lycheejs-harvester 2> /dev/null;
				rm /usr/local/bin/lycheejs-helper 2> /dev/null;
				rm /usr/local/bin/lycheejs-ranger 2> /dev/null;
				rm /usr/local/bin/lycheejs-strainer 2> /dev/null;

				ln -s "$LYCHEEJS_ROOT/bin/breeder.sh" /usr/local/bin/lycheejs-breeder;
				ln -s "$LYCHEEJS_ROOT/bin/editor.sh" /usr/local/bin/lycheejs-editor;
				ln -s "$LYCHEEJS_ROOT/bin/fertilizer.sh" /usr/local/bin/lycheejs-fertilizer;
				ln -s "$LYCHEEJS_ROOT/bin/harvester.sh" /usr/local/bin/lycheejs-harvester;
				ln -s "$LYCHEEJS_ROOT/bin/helper.sh" /usr/local/bin/lycheejs-helper;
				ln -s "$LYCHEEJS_ROOT/bin/ranger.sh" /usr/local/bin/lycheejs-ranger;
				ln -s "$LYCHEEJS_ROOT/bin/strainer.sh" /usr/local/bin/lycheejs-strainer;


				echo "> DONE";

			fi;

		fi;

	fi;

fi;

