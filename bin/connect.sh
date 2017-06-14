#!/bin/bash

R_BIN="r"
target=$1
type=$2
extra=$3


if [[ "$target" == "list" ]]; then
    $R_BIN connect list
    exit
fi

cmd="$R_BIN connect ssh $target $type -d"

if [[ "$extra" == "debug" ]]; then
    echo "$cmd"
    echo $($cmd)
fi

eval $($cmd)

