#!/bin/bash

#
# Author: LazerUnicorns Ltd. <support@lazerunicorns.com>
#

### BEGIN INIT INFO
# Provides:          sorbet
# Required-Start:    $local_fs $network $named $syslog
# Required-Stop:     $local_fs $network $named $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Sorbet daemon for lycheeJS
# Description:       Enable Sorbet HTTP1.1 / CDN / WS13 service
### END INIT INFO

PATH=/sbin:/usr/sbin:/bin:/usr/bin:/usr/local/bin;
PID_FILE="/var/run/sorbet.pid";
THIS_FILE=$0;
SELF_FILE=`basename $THIS_FILE`;
[ -h $THIS_FILE ] && SELF_FILE=`basename $(readlink $THIS_FILE)`;



# This will be automatically replaced by the ./tool/ubuntu/install.js
LYCHEEJS_ROOT="{{lycheejs_root}}";
SORBET_USER="{{sorbet_user}}";
SORBET_GROUP="{{sorbet_group}}";
SORBET_PROFILE="{{sorbet_profile}}";


if [[ "$LYCHEEJS_ROOT" =~ ^[\{]{2}(.*)[\}]{2}$ ]]; then
	LYCHEEJS_ROOT="/usr/lib/node_modules/lycheejs";
fi;

if [[ "$SORBET_USER" =~ ^[\{]{2}(.*)[\}]{2}$ ]]; then
	SORBET_USER="root";
fi;

if [[ "$SORBET_GROUP" =~ ^[\{]{2}(.*)[\}]{2}$ ]]; then
	SORBET_GROUP="root";
fi;

if [[ "$SORBET_PROFILE" =~ ^[\{]{2}(.*)[\}]{2}$ ]]; then
	SORBET_PROFILE="localhost.json";
fi;
 

NODEJS_EXEC=`which nodejs`;

SORBET_ROOT="$LYCHEEJS_ROOT";
SORBET_EXEC="$NODEJS_EXEC ./tool/Sorbet.js start --profile=\"/etc/sorbet/$SORBET_PROFILE\"";

LOG_LABEL=${SELF_FILE%.*};
LOG_OUT="/var/log/sorbet.log";
LOG_ERR="/var/log/sorbet.err";


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



# Define LSB log_* functions.
# Depend on lsb-base (>= 3.0-6) to ensure that this file is present.
. /lib/lsb/init-functions


# Uncomment to override system setting
# VERBOSE=yes;



case "$1" in

	start)

		[ "$VERBOSE" != no ] && log_daemon_msg "Starting " "$LOG_LABEL";

		if is_running; then

			echo "Already running";

		else

			cd "$SORBET_ROOT";
			sudo -u "$SORBET_USER" -g "$SORBET_GROUP" -- $SORBET_EXEC >> "$LOG_OUT" 2>> "$LOG_ERR" &
			echo $! > "$PID_FILE";

			if ! is_running; then
				[ "$VERBOSE" != no ] && log_daemon_msg "Unable to start daemon, see $LOG_OUT and $LOG_ERR" "$LOG_LABEL";
				log_end_msg 1;
				exit 1;
			else
				log_end_msg 0;
				exit 0;
			fi;

		fi;

	;;

	stop)

		[ "$VERBOSE" != no ] && log_daemon_msg "Stopping " "$LOG_LABEL";

		if is_running; then

			kill `get_pid`;

			# Give process 5 seconds to terminate
			for i in {1..5}
			do
				sleep 1;
			done;


			if is_running; then
				[ "$VERBOSE" != no ] && log_daemon_msg "Unable to stop daemon" "$LOG_LABEL";
				log_end_msg 1;
				exit 1;
			else
				log_end_msg 0;
				exit 0;
			fi;

		fi;

	;;

	restart|force-reload)

		[ "$VERBOSE" != no ] && log_daemon_msg "Restarting " "$LOG_LABEL";

		$0 stop;

		if is_running; then

			[ "$VERBOSE" != no ] && log_daemon_msg "Unable to stop, will not attempt to start" "$LOG_LABEL";
			log_end_msg 1;
			exit 1;

		else

			$0 start;

			if ! is_running; then
				[ "$VERBOSE" != no ] && log_daemon_msg "Unable to start" "$LOG_LABEL";
				log_end_msg 1;
				exit 1;
			else
				log_end_msg 0;
				exit 0;
			fi;

		fi;

	;;

	status)

		if is_running; then

			log_success_msg "$LOG_LABEL (launched by $SORBET_USER) is running";
			exit 0;

		else

			if [ -f "$PID_FILE" ]; then

				log_success_msg "$LOG_LABEL (launched by $SORBET_USER) is not running, phantom pidfile $PID_FILE";
				exit 1;

			else

				log_success_msg "$LOG_LABEL is not running, no single instance found";
				exit 3;

			fi;

		fi;

	;;

	*)
		echo "Usage: $0 {start|stop|restart|force-reload|status}" >&2;
		exit 3;
	;;

esac;


exit 0;
 
