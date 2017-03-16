#!/bin/bash

LYCHEEJS_ROOT="/opt/lycheejs";
LYCHEEJS_FERTILIZER=`which lycheejs-fertilizer`;
LYCHEEJS_HELPER=`which lycheejs-helper`;


if [ "$LYCHEEJS_HELPER" != "" ] && [ "$LYCHEEJS_FERTILIZER" != "" ]; then

	cd $LYCHEEJS_ROOT/libraries/studio;
	cp ./index-debug.html ./index.html;

	cd $LYCHEEJS_ROOT/libraries/studio;
	nw-debug .;

	exit $?;

else

	exit 1;

fi;

