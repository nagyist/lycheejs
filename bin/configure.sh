#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;
USER=`whoami`;

LYCHEEJS_IOJS="";
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
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/osx/$ARCH/iojs";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/nwjs.app";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/linux/$ARCH/iojs";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/nwjs";

elif [ "$OS" == "windows_nt" ]; then

	OS="windows";
	ARCH="x86"; # Well, fuck you, Microsoft
	LYCHEEJS_IOJS="$LYCHEEJS_ROOT/bin/runtime/iojs/windows/$ARCH/iojs.exe";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/windows/nwjs.exe";

fi;



if [ "$USER" != "root" ]; then

	echo "You are not root.";
	echo "Use \"sudo $0\"";

else

	cd $LYCHEEJS_ROOT;

	if [[ "$OS" == "linux" || "$OS" == "osx" ]]; then

		echo "Fixing chmod rights...";

		# Default chmod rights for folders

		find ./lychee -type d -print0 | xargs -0 chmod 777;
		find ./lychee -type f -print0 | xargs -0 chmod 666;

		find ./projects -type d -print0 | xargs -0 chmod 777;
		find ./projects -type f -print0 | xargs -0 chmod 666;

		find ./sorbet -type d -print0 | xargs -0 chmod 777;
		find ./sorbet -type f -print0 | xargs -0 chmod 666;

		# Make command line tools explicitely executable

		chmod +x ./lychee/configure.js;
		chmod +x ./projects/*/sorbet.js;

		chmod 0777 ./bin;
		chmod +x ./bin/editor.sh;
		chmod +x ./bin/fertilizer.sh;
		chmod +x ./bin/fertilizer.js;
		chmod +x ./bin/helper.sh;
		chmod +x ./bin/ranger.sh;
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


	if [ "$NO_INTEGRATION" == "false" ]; then

		if [ "$OS" == "linux" ]; then

			if [ -d /usr/share/applications ]; then

				echo "Integrating Editor, Helper and Ranger...";

				cp ./bin/helper/linux/editor.desktop /usr/share/applications/lycheejs-editor.desktop;
				cp ./bin/helper/linux/helper.desktop /usr/share/applications/lycheejs-helper.desktop;
				cp ./bin/helper/linux/ranger.desktop /usr/share/applications/lycheejs-ranger.desktop;


				sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-editor.desktop";
				sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-helper.desktop";
				sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-ranger.desktop";

				echo "Done.";

			fi;

		elif [ "$OS" == "osx" ]; then

			echo "Integrating Editor, Helper and Ranger...";
			open ./bin/helper/osx/helper.app;
			echo "Done.";

		elif [ "$OS" == "windows" ]; then

			echo "Integrating Editor, Helper and Ranger...";
			regedit.exe /S ./bin/helper/windows/helper.reg;
			echo "Done.";

		fi;

	fi;

fi;

