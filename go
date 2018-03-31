#!/bin/bash

set -eu
normal=$(tput sgr0)
start_fg_color=$(tput setaf 5)

function task_start {
  echo "${start_fg_color}Starting app${normal}"
  node .
}

function task_start_db_debug {
  echo "${start_fg_color}Starting app showing postgres debug info${normal}"
  DEBUG=*postgresql node .
}

function task_help {
  help_message="usage: ./go"
  help_message+=" ${start_fg_color}start${normal}"
  help_message+=" | ${start_fg_color}start_db_debug${normal}"
  echo "${help_message}"
}

function execute_task {
  local task="${1:-}"
  shift || true
  case ${task} in
    start) task_start ;;
    start_db_debug) task_start_db_debug ;;
    *) task_help ;;
  esac
}

execute_task "$@"
