#!/bin/bash

#カレントディレクトリの取得.
WORK_DIR="`pwd`"
echo $WORK_DIR

# スクリプトディレクトリの取得.
SCRIPT_DIR="$(cd $(dirname $0); pwd)" 
echo $SCRIPT_DIR

# ディレクトリ内のファイル、ディレクトリを取得.
dirs=`find $SCRIPT_DIR -maxdepth 0 -type f -name *.sh`
for dir in $dirs;
do
    echo $dir
    # ここから実行処理を記述
done


