#!/bin/bash

#
# Author: LazerUnicorns Ltd. <support@lazerunicorns.com>
#

PATH=/sbin:/usr/sbin:/bin:/usr/bin:/usr/local/bin;
PID_FILE="/var/run/sorbet.pid";
THIS_FILE=$0;
SELF_FILE=`basename $THIS_FILE`;
[ -h $THIS_FILE ] && SELF_FILE=`basename $(readlink $THIS_FILE)`;



# This will be automatically replaced by the ./tool/ubuntu/install.js
LYCHEEJS_ROOT="{{lycheejs_root}}";
SORBET_USER="{{sorbet_user}}";
SORBET_GROUP="{{sorbet_group}}";
SORBET_DAEMON="/etc/init.d/sorbet";


if [[ "$LYCHEEJS_ROOT" =~ ^[\{]{2}(.*)[\}]{2}$ ]]; then
	LYCHEEJS_ROOT="/usr/lib/node_modules/lycheejs";
fi;

if [[ "$SORBET_USER" =~ ^[\{]{2}(.*)[\}]{2}$ ]]; then
	SORBET_USER="root";
fi;

if [[ "$SORBET_GROUP" =~ ^[\{]{2}(.*)[\}]{2}$ ]]; then
	SORBET_GROUP="root";
fi;


SORBET_ROOT="$LYCHEEJS_ROOT";


if [ ! -d "$LYCHEEJS_ROOT" ]; then
	echo "Could not find a lycheeJS instance. Sorry, something went really wrong :-/";
	exit 1;
fi;


get_pid() {
	cat "$PID_FILE";
}

is_running() {
	[ -f "$PID_FILE" ] && ps `get_pid` > /dev/null 2>&1
}



#
# Stop Sorbet
#

if is_running; then
	$SORBET_DAEMON stop;
fi;

if [ -d "$SORBET_ROOT/.git" ]; then
	cd "$SORBET_ROOT";
	git pull;
	chown -R $SORBET_USER:$SORBET_GROUP "$SORBET_ROOT";
	cd ~;
fi;

if is_running; then
	$SORBET_DAEMON restart;
else
	$SORBET_DAEMON start;
fi;

