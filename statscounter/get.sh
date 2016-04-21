#!/usr/bin/env bash

set -e

urls=(
  "http://gs.statcounter.com/download/browser-country/"
  "http://gs.statcounter.com/download/mobilebrowser-country/"
)

current_month=`date "+%m"`
current_year=`date "+%Y"`
latest_dump_month=7
latest_dump_year=2008

for url in ${urls[@]}; do
  kind=`echo $url | cut -d '/' -f 5`

  # find date of latest dump
  latest_dump=`ls dump/$kind*.csv | sort | tail -1` 

  if [[ -n "$latest_dump" ]]; then
    latest_dump_year=`echo $latest_dump | awk -F '[^0-9]*' '{print $2}'`
    latest_dump_month=`echo $latest_dump | awk -F '[^0-9]*' '{print $3}'`
  fi

  echo -e "Last found dump is from $latest_dump_year-$latest_dump_month.\n"

  for year in $(seq $latest_dump_year $current_year); do
    for month in $(seq 12); do
      # first data is from july 2008
      if [[ "$year" -eq 2008 && "$month" -lt 7 ]]; then
        continue
      fi

      # skip current and future months of this year
      if [[ "$year" -eq "$current_year" && "$month" -ge "$current_month" ]]; then
        continue
      fi

      filename="dump/$kind-$year-$month.csv" 

      if [[ ! -f "$filename" ]]; then
        echo -n "Downloading $filename... "

        curl -s -L -o $filename "$url?year=$year&month=$month"

        echo "Done!"
      fi
    done
  done
done
