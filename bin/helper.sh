#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;

LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../"; pwd);


if [ "$OS" == "darwin" ]; then

	OS="osx";

elif [ "$OS" == "linux" ]; then

	OS="linux";

fi;



_put_API_Projects () {

	action="$1";
	identifier="$2";
	apiurl="http://localhost:4848/api/Project?identifier=$identifier&action=$action";

	curl -i -X PUT $apiurl 2>&1;

}



url=$1;
protocol=${url:0:8};

if [ "$protocol" == "lycheejs" ]; then

	action="";
	resource="";

	if [ "${url:11:4}" == "boot" ]; then
		action="boot";
		resource=${url#*=};
	fi;

	if [ "${url:11:6}" == "unboot" ]; then
		action="unboot";
		resource="...";
	fi;

	if [ "${url:11:5}" == "start" ]; then
		action="start";
		resource=${url#*=};
	fi;

	if [ "${url:11:4}" == "stop" ]; then
		action="stop";
		resource=${url#*=};
	fi;

	if [ "${url:11:4}" == "edit" ]; then
		action="edit";
		resource=${url#*=};
	fi;

	if [ "${url:11:5}" == "create" ]; then
		action="create";
		resource=${url#*=};
	fi;

	if [ "${url:11:4}" == "file" ]; then
		action="file";
		resource=${url#*=};
	fi;

	if [ "${url:11:3}" == "web" ]; then
		action="web";
		resource=${url#*=};
	fi;


	# XXX: https://bugs.freedesktop.org/show_bug.cgi?id=91027
	resource=${resource%/};


	if [ "$action" != "" -a "$resource" != "" ]; then

		case "$action" in

			boot)

				cd $LYCHEEJS_ROOT;

				./bin/sorbet.sh stop 2>&1;
				./bin/sorbet.sh start "$resource" 2>&1;
				exit 0;

			;;

			unboot)

				cd $LYCHEEJS_ROOT;

				./bin/sorbet.sh stop 2>&1;
				exit 0;

			;;

			start)

				_put_API_Projects "start" "$resource";
				exit 0;

			;;

			stop)

				_put_API_Projects "stop" "$resource";
				exit 0;

			;;

			edit)

				if [ -f ./bin/editor.sh ]; then

					if [ "$OS" == "linux" -o "$OS" == "osx" ]; then
						./bin/editor.sh "file://$LYCHEEJS_ROOT/projects/$resource/lychee.pkg" 2>&1;
						exit 0;
					fi;

				fi;

			;;

			file)

				if [ "$OS" == "linux" ]; then

					xdg-open "file://$LYCHEEJS_ROOT/projects/$resource" 2>&1;
					exit 0;

				elif [ "$OS" == "osx" ]; then

					open "file://$LYCHEEJS_ROOT/projects/$resource" 2>&1;
					exit 0;

				fi;

			;;

			web)

				# Well, fuck you, Blink and WebKit.

				clean_resource="$resource";
				clean_resource=${clean_resource//%5B/\[};
				clean_resource=${clean_resource//%5D/\]};
				clean_resource=${clean_resource//http:0\/\//http:\/\/};


				if [ "$OS" == "linux" ]; then

					xdg-open "$clean_resource" 2>&1;
					exit 0;

				elif [ "$OS" == "osx" ]; then

					open "$clean_resource" 2>&1;
					exit 0;

				fi;

			;;

		esac;

	fi;


	exit 0;

else

	exit 1;

fi;

