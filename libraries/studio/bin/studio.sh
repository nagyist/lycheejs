#!/bin/bash

LYCHEEJS_ROOT="/opt/lycheejs";
LYCHEEJS_FERTILIZER=`which lycheejs-fertilizer`;
LYCHEEJS_HELPER=`which lycheejs-helper`;


if [ "$LYCHEEJS_HELPER" != "" ] && [ "$LYCHEEJS_FERTILIZER" != "" ]; then

	cd $LYCHEEJS_ROOT;

	$LYCHEEJS_FERTILIZER html-nwjs/main /libraries/studio;
	$LYCHEEJS_HELPER run:html-nwjs/main /libraries/studio;

	exit $?;

else

	exit 1;

fi;

