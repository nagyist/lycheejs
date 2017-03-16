#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;

LYCHEEJS_ROOT="/opt/lycheejs";
CHILD_PID="";


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

elif [ "$OS" == "linux" ]; then

	OS="linux";

elif [ "$OS" == "freebsd" ] || [ "$OS" == "netbsd" ]; then

	OS="bsd";

fi;



_print_help() {

	echo "                                                                 ";
	echo -e "\u001b[37m\u001b[42mlychee.js Helper\u001b[49m\u001b[39m";
	echo "                                                                 ";
	echo " Usage: lycheejs-helper [lycheejs://Action=Library/Project]      ";
	echo "        lycheejs-helper [Action] [Library/Project]               ";
	echo "        lycheejs-helper [Helper:Platform] [Library/Project]      ";
	echo "                                                                 ";
	echo " Notes:                                                          ";
	echo "                                                                 ";
	echo "     The [JSON] data is encoded as base64 only.                  ";
	echo "                                                                 ";
	echo "     The \"env:\" can be used as a Shebang in shell scripts:     ";
	echo "     #!/usr/local/bin/lycheejs-helper env:node                   ";
	echo "                                                                 ";
	echo " Platforms:                                                      ";
	echo "                                                                 ";
	echo "    html, html-nwjs, node, node-sdl                              ";
	echo "                                                                 ";
	echo "                                                                 ";
	echo "                                                                 ";
	echo " Available Actions:                                              ";
	echo "                                                                 ";
	echo "    boot=[Profile]                                               ";
	echo "    profile=[Profile]?data=[base64]                              ";
	echo "    unboot                                                       ";
	echo "                                                                 ";
	echo "    start=[Library/Project]                                      ";
	echo "    stop=[Library/Project]                                       ";
	echo "    file=[Library/Project]                                       ";
	echo "    edit=[Library/Project]                                       ";
	echo "                                                                 ";
	echo "    cmd=[Command]?data=[JSON]                                    ";
	echo "    web=[URL]                                                    ";
	echo "                                                                 ";
	echo " Examples:                                                       ";
	echo "                                                                 ";
	echo "    lycheejs-helper lycheejs://start=/projects/boilerplate       ";
	echo "    lycheejs-helper lycheejs://cmd=lycheejs-ranger               ";
	echo "    lycheejs-helper lycheejs://profile=production?data=[base64]  ";
	echo "    lycheejs-helper lycheejs://web=https://lychee.js.org         ";
	echo "                                                                 ";
	echo "    lycheejs-helper start /projects/boilerplate                  ";
	echo "    lycheejs-helper edit /projects/boilerplate                   ";
	echo "    lycheejs-helper web https://lychee.js.org                    ";
	echo "                                                                 ";
	echo "                                                                 ";
	echo "                                                                 ";
	echo " Available Helpers:                                              ";
	echo "                                                                 ";
	echo "    env:Platform                executes runtime env             ";
	echo "    which:Platform              returns runtime path             ";
	echo "    run:Platform/Identifier     executes fertilized runtime env  ";
	echo "                                                                 ";
	echo " Examples:                                                       ";
	echo "                                                                 ";
	echo "    lycheejs-helper env:node /path/to/file.js                    ";
	echo "    lycheejs-helper env:html /path/to/file.html                  ";
	echo "                                                                 ";
	echo "    lycheejs-helper run:html-nwjs/main /libraries/ranger         ";
	echo "                                                                 ";

}


_handle_signal() {
	kill -s "$1" "$CHILD_PID" 2>/dev/null;
}

_trap() {

	handler="$1"; shift;
	for signal; do
		trap "$handler $signal" "$signal";
	done;

}

_start_env () {

	_trap _handle_signal INT HUP KILL TERM EXIT;

	$1 $2 $3 $4 $5 &

	CHILD_PID=$!;
	wait "$CHILD_PID";

}

_handle_action () {

	action="$1";
	resource="$2";
	data="$3";


	case "$action" in

		boot)

			if [ "$resource" != "" ]; then

				cd $LYCHEEJS_ROOT;
				./libraries/harvester/bin/harvester.sh stop 2>&1;
				./libraries/harvester/bin/harvester.sh start "$resource" 2>&1;
				exit 0;

			else
				exit 1;
			fi;

		;;

		profile)

			if [ "$resource" != "" ]; then

				cd $LYCHEEJS_ROOT;
				_put_api_profile "$resource" "save" "$data";

			fi;

		;;

		unboot)

			cd $LYCHEEJS_ROOT;
			./libraries/harvester/bin/harvester.sh stop 2>&1;
			exit 0;

		;;

		start)

			if [ "$resource" != "" ]; then

				cd $LYCHEEJS_ROOT;
				_put_api_project "$resource" "start";

			fi;

		;;

		stop)

			if [ "$resource" != "" ]; then

				cd $LYCHEEJS_ROOT;
				_put_api_project "$resource" "stop";

			fi;

		;;

		edit)

			studio=`which lycheejs-studio 2> /dev/null`;

			if [ "$studio" == "" ]; then
				studio="$LYCHEEJS_ROOT/libraries/studio/bin/studio.sh";
			fi;

			if [ -f "$studio" ]; then

				if [ "$OS" == "linux" ] || [ "$OS" == "osx" ] || [ "$OS" == "bsd" ]; then

					cd $LYCHEEJS_ROOT;
					"$studio" "$resource" 2>&1;
					exit 0;

				else
					exit 1;
				fi;

			fi;

		;;

		file)

			if [ "$resource" != "" ]; then

				if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

					xdg-open "file://$LYCHEEJS_ROOT$resource" 2>&1;
					exit 0;

				elif [ "$OS" == "osx" ]; then

					open "file://$LYCHEEJS_ROOT$resource" 2>&1;
					exit 0;

				else
					exit 1;
				fi;

			else
				exit 1;
			fi;

		;;

		cmd)

			if [[ "$(echo $resource | cut -c 1-8)" == "lycheejs" && "$resource" != "lycheejs-helper" ]]; then

				if [ -x /usr/local/bin/$resource ]; then

					if [ "$data" != "" ]; then
						$resource $data;
						exit $?;
					else
						$resource;
						exit $?;
					fi;

				fi;


			fi;

		;;

		web)

			# Well, fuck you, Blink and WebKit.

			clean_resource="$resource";
			clean_resource=${clean_resource//%5B/\[};
			clean_resource=${clean_resource//%5D/\]};
			clean_resource=${clean_resource//http:0\/\//http:\/\/};


			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				# XXX: Privacy First
				chrome1=`which inox 2> /dev/null`;
				chrome2=`which chromium-browser 2> /dev/null`;
				chrome3=`which google-chrome 2> /dev/null`;
				chrome4=`which chrome 2> /dev/null`;

				if [ -x "$chrome1" ]; then
					"$chrome1" "$clean_resource";
				elif [ -x "$chrome2" ]; then
					"$chrome2" "$clean_resource";
				elif [ -x "$chrome3" ]; then
					"$chrome3" "$clean_resource";
				elif [ -x "$chrome4" ]; then
					"$chrome4" "$clean_resource";
				else
					xdg-open "$clean_resource" 2>&1;
				fi;

				exit 0;

			elif [ "$OS" == "osx" ]; then

				chrome1="/Applications/Google Chrome.app";

				if [ -x "$chrome1" ]; then
					open -a "$chrome1" "$clean_resource";
				else
					open "$clean_resource" 2>&1;
				fi;

				exit 0;

			fi;

		;;

	esac;

}

_put_api_project () {

	data="{\"identifier\":\"$1\",\"action\":\"$2\"}";
	apiurl="http://localhost:4848/api/project/$2";

	result=$(curl --silent -H "Content-Type: application/json" -X POST -d "$data" $apiurl 2>&1);

	if [ "$result" != "" ]; then
		echo "";
		echo "$result";
		echo "";
	else
		exit 1;
	fi;

}

_put_api_profile () {

	data=$(echo $3 | base64 --decode);
	apiurl="http://localhost:4848/api/profile/$2";

	result=$(curl --silent -H "Content-Type: application/json" -X POST -d "$data" $apiurl 2>&1);

	if [ "$result" != "" ]; then
		echo "";
		echo "$result";
		echo "";
	else
		exit 1;
	fi;

}



protocol=$(echo $1 | cut -d":" -f 1);
content=$(echo $1 | cut -d":" -f 2);



if [ "$protocol" == "lycheejs" ]; then

	action=$(echo $content | cut -c 3- | cut -d"=" -f 1);
	data="";


	if [[ $content =~ .*=.* ]]; then
		resource=$(echo $content | cut -d"=" -f 2);
	else
		resource="";
	fi;


	if [ "$action" == "profile" ]; then
		# XXX: base64 encoded strings end with = (8 Bit) or == (16 Bit)
		resource=$(echo $resource | cut -d"?" -f 1);
		data=$(echo $1 | cut -d"=" -f 3-5);
	elif [ "$action" == "unboot" ]; then
		resource="DUMMY";
	elif [ "$action" == "cmd" ]; then
		# XXX: base64 encoded strings end with = (8 Bit) or == (16 Bit)
		resource=$(echo $1 | cut -d"?" -f 1 | cut -d"=" -f 2);
		data=$(echo $1 | cut -d"=" -f 3-5);
	elif [ "$action" == "web" ]; then
		resource=$(echo $1 | cut -c 16-);
	fi;


	# XXX: https://bugs.freedesktop.org/show_bug.cgi?id=91027
	resource=${resource%/};


	if [ "$action" != "" -a "$resource" != "" ]; then
		_handle_action "$action" "$resource" "$data";
	fi;

elif [ "$protocol" == "env" ]; then

	platform=$(echo $content | cut -d":" -f 2);
	program=$2;
	arg1=$3;
	arg2=$4;
	arg3=$5;


	if [ "$program" != "" ]; then

		if [ "$platform" == "html" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				# XXX: Privacy First
				chrome1=`which inox 2> /dev/null`;
				chrome2=`which chromium-browser 2> /dev/null`;
				chrome3=`which google-chrome 2> /dev/null`;
				chrome4=`which chrome 2> /dev/null`;

				if [ -x "$chrome1" ]; then
					"$chrome1" "$program";
				elif [ -x "$chrome2" ]; then
					"$chrome2" "$program";
				elif [ -x "$chrome3" ]; then
					"$chrome3" "$program";
				elif [ -x "$chrome4" ]; then
					"$chrome4" "$program";
				else
					xdg-open "$program" 2>&1;
				fi;

			elif [ "$OS" == "osx" ]; then

				chrome1="/Applications/Google Chrome.app";

				if [ -d "$chrome1" ]; then
					open -a "$chrome1" "$program";
				else
					open "$program" 2>&1;
				fi;

			fi;

		elif [ "$platform" == "html-nwjs" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw $program $arg1 $arg2 $arg3;
			elif [ "$OS" == "osx" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/$ARCH/nwjs.app/Contents/MacOS/nwjs $program $arg1 $arg2 $arg3;
			fi;

		elif [ "$platform" == "node" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node $program $arg1 $arg2 $arg3;
			elif [ "$OS" == "osx" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node/osx/$ARCH/node $program $arg1 $arg2 $arg3;
			fi;

		elif [ "$platform" == "node-sdl" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node-sdl/linux/$ARCH/node $program $arg1 $arg2 $arg3;
			elif [ "$OS" == "osx" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node-sdl/osx/$ARCH/node $program $arg1 $arg2 $arg3;
			fi;

		fi;

	else

		if [ "$platform" == "html" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				# XXX: Privacy First
				chrome1=`which inox 2> /dev/null`;
				chrome2=`which chromium-browser 2> /dev/null`;
				chrome3=`which google-chrome 2> /dev/null`;
				chrome4=`which chrome 2> /dev/null`;
				x_www=`which x-www-browser 2> /dev/null`;

				if [ -x "$chrome1" ]; then
					"$chrome1";
				elif [ -x "$chrome2" ]; then
					"$chrome2";
				elif [ -x "$chrome3" ]; then
					"$chrome3";
				elif [ -x "$chrome4" ]; then
					"$chrome4";
				elif [ -x "$x_www" != "" ]; then
					"$x_www";
				fi;

			elif [ "$OS" == "osx" ]; then

				chrome1="/Applications/Google Chrome.app";

				if [ -d "$chrome1" ]; then
					open -a "$chrome1";
				fi;

			fi;

		elif [ "$platform" == "html-nwjs" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				$LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw;
			elif [ "$OS" == "osx" ]; then
				$LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/$ARCH/nwjs.app/Contents/MacOS/nwjs;
			fi;

		elif [ "$platform" == "node" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node;
			elif [ "$OS" == "osx" ]; then
				$LYCHEEJS_ROOT/bin/runtime/node/osx/$ARCH/node;
			fi;

		elif [ "$platform" == "node-sdl" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				$LYCHEEJS_ROOT/bin/runtime/node-sdl/linux/$ARCH/node;
			elif [ "$OS" == "osx" ]; then
				$LYCHEEJS_ROOT/bin/runtime/node-sdl/osx/$ARCH/node;
			fi;

		fi;

	fi;


	exit 0;

elif [ "$protocol" == "run" ]; then

	platform=$(echo $content | cut -d":" -f 2 | cut -d"/" -f 1);
	identifier=$(echo $content | cut -d":" -f 2 | cut -d"/" -f 2);
	resource="$2";
	arg1=$3;
	arg2=$4;
	arg3=$5;

	if [ "$resource" != "" ] && [ -d "$LYCHEEJS_ROOT$resource/build" ]; then

		build="$LYCHEEJS_ROOT$resource/build";
		name=$(echo $resource | cut -d"/" -f 3);


		if [ "$platform" == "html" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				if [ -d "$build/html/$identifier" ]; then

					program="$build/html/$identifier/index.html";

					if [ -f "$program" ]; then

						# XXX: Privacy First
						chrome1=`which inox 2> /dev/null`;
						chrome2=`which chromium-browser 2> /dev/null`;
						chrome3=`which google-chrome 2> /dev/null`;
						chrome4=`which chrome 2> /dev/null`;

						if [ -x "$chrome1" ]; then
							"$chrome1" "$program";
						elif [ -x "$chrome2" ]; then
							"$chrome2" "$program";
						elif [ -x "$chrome3" ]; then
							"$chrome3" "$program";
						elif [ -x "$chrome4" ]; then
							"$chrome4" "$program";
						else
							xdg-open "$program" 2>&1;
						fi;

					else
						exit 1;
					fi;

				else
					exit 1;
				fi;

			elif [ "$OS" == "osx" ]; then

				if [ -d "$build/html/$identifier" ]; then

					program="$build/html/$identifier/index.html";

					if [ -f "$program" ]; then

						chrome1="/Applications/Google Chrome.app";

						if [ -x "$chrome1" ]; then
							open -a "$chrome1" "$program";
						else
							open "$program" 2>&1;
						fi;

					fi;

				else
					exit 1;
				fi;

			fi;

		elif [ "$platform" == "html-nwjs" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				if [ -d "$build/html-nwjs/$identifier" ]; then

					program="$build/html-nwjs/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw $program $arg1 $arg2 $arg3;

				elif [ -d "$build/html-nwjs/$identifier-linux/$ARCH" ]; then

					program="$build/html-nwjs/$identifier-linux/$ARCH/$name.bin";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3;
					else
						exit 1;
					fi;

				fi;

			elif [ "$OS" == "osx" ]; then

				if [ -d "$build/html-nwjs/$identifier" ]; then

					program="$build/html-nwjs/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/$ARCH/nwjs.app/Contents/MacOS/nwjs $program $arg1 $arg2 $arg3;

				elif [ -d "$build/html-nwjs/$identifier-osx/$ARCH" ]; then

					program="$build/html-nwjs/$identifier-osx/$ARCH/$name.app";

					if [ -f $program ]; then
						chmod +x $program;
						open $program $arg1 $arg2 $arg3 2>&1;
					else
						exit 1;
					fi;

				fi;

			fi;

		elif [ "$platform" == "html-webview" ]; then

			# XXX: Impossible to implement right now
			# requires emulator binaries for all platform
			# which is too much bloat

			echo "Sorry, lychee.js ships no mobile emulators due to bloat size :(";

			exit 1;

		elif [ "$platform" == "node" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				if [ -d "$build/node/$identifier" ]; then

					program="$build/node/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node $program $arg1 $arg2 $arg3;

				elif [ -d "$build/node/$identifier-linux/$ARCH" ]; then

					program="$build/node/$identifier-linux/$ARCH/$name.sh";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3;
					else
						exit 1;
					fi;

				fi;

			elif [ "$OS" == "osx" ]; then

				if [ -d "$build/node/$identifier" ]; then

					program="$build/node/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/node/osx/$ARCH/node $program $arg1 $arg2 $arg3;

				elif [ -d "$build/node/$identifier-osx/$ARCH" ]; then

					program="$build/node/$identifier-osx/$ARCH/$name.sh";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3;
					else
						exit 1;
					fi;

				fi;

			fi;

		elif [ "$platform" == "node-sdl" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				if [ -d "$build/node-sdl/$identifier" ]; then

					program="$build/node-sdl/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/node-sdl/linux/$ARCH/node $program $arg1 $arg2 $arg3;

				elif [ -d "$build/node-sdl/$identifier-linux/$ARCH" ]; then

					program="$build/node-sdl/$identifier-linux/$ARCH/$name.sh";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3;
					else
						exit 1;
					fi;

				fi;

			elif [ "$OS" == "osx" ]; then

				if [ -d "$build/node-sdl/$identifier" ]; then

					program="$build/node-sdl/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/node-sdl/osx/$ARCH/node $program $arg1 $arg2 $arg3;

				elif [ -d "$build/node-sdl/$identifier-osx/$ARCH" ]; then

					program="$build/node-sdl/$identifier-osx/$ARCH/$name.sh";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3;
					else
						exit 1;
					fi;

				fi;

			fi;

		fi;

	else
		exit 1;
	fi;

elif [ "$protocol" == "which" ]; then

	platform=$(echo $content | cut -d":" -f 2);


	if [ "$platform" == "html" ]; then

		if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

			# XXX: Privacy First
			chrome1=`which inox 2> /dev/null`;
			chrome2=`which chromium-browser 2> /dev/null`;
			chrome3=`which google-chrome 2> /dev/null`;
			chrome4=`which chrome 2> /dev/null`;
			x_www=`which x-www-browser 2> /dev/null`;

			if [ -x "$chrome1" ]; then
				echo "$chrome1";
			elif [ -x "$chrome2" ]; then
				echo "$chrome2";
			elif [ -x "$chrome3" ]; then
				echo "$chrome3";
			elif [ -x "$chrome4" ]; then
				echo "$chrome4";
			elif [ "$x_www" != "" ]; then
				echo "$(readlink -f "$x_www")";
			fi;

		elif [ "$OS" == "osx" ]; then

			chrome1="/Applications/Google Chrome.app";
			safari1="/Applications/Safari.app";

			if [ -d "$chrome1" ]; then
				echo "$chrome1/Contents/MacOS/Chrome";
			else
				echo "$safari1/Contents/MacOS/Safari";
			fi;

		fi;


	elif [ "$platform" == "html-nwjs" ]; then

		if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw;
		elif [ "$OS" == "osx" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/$ARCH/nwjs.app/Contents/MacOS/nwjs;
		fi;

	elif [ "$platform" == "node" ]; then

		if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node;
		elif [ "$OS" == "osx" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/node/osx/$ARCH/node;
		fi;

	elif [ "$platform" == "node-sdl" ]; then

		if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/node-sdl/linux/$ARCH/node;
		elif [ "$OS" == "osx" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/node-sdl/osx/$ARCH/node;
		fi;

	fi;

else

	action="$1";
	resource="$2";
	data="$3";


	if [ "$action" != "" -a "$resource" != "" ]; then

		_handle_action "$action" "$resource" "$data";

	else

		_print_help;

		exit 1;

	fi;

fi;

