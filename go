#!/bin/bash

set -eu
normal_fg=$(tput sgr0)
debug_fg=$(tput setaf 9)

red_fg=$(tput setaf 1)

start_fg=$(tput setaf 5)
color_fg=$(tput setaf 220)

function timestamp() {
  date+"%Y%m%d_%H%M%S"
}

function check_for_tool() {
  local toolName="${1}"
  local installInstructions="${2}"

  if ! which ${toolName} &>/dev/null ; then
    echo "${red_fg}${toolName}${debug_fg} not found${normal_fg}"
    echo "${debug_fg}Install with: ${red_fg}${installInstructions}${normal_fg}"
    exit 1
  fi
}

function task_start {
  check_for_tool "nodes" "nvm install node"

  echo "${start_fg}Starting app${normal_fg}"
  node .
}

function task_start_db_debug {
  # https://loopback.io/doc/en/lb2/Setting-debug-strings.html
  echo "${start_fg}Starting app showing postgres debug info${normal_fg}"
  DEBUG=*postgresql node .
}

function color(){
    for c; do
        printf '\e[48;5;%dm%03d' $c $c
    done
    printf '\e[0m \n'
}

function task_color {
  # https://unix.stackexchange.com/a/269085
  IFS=$' \t\n'
  color {0..15}
  for ((i=0;i<6;i++)); do
      color $(seq $((i*36+16)) $((i*36+51)))
  done
  color {232..255}
}

function task_help {
  help_message="usage: ./go"
  help_message+=" ${color_fg}colors${normal_fg}"
  help_message+=" | ${start_fg}start${normal_fg}"
  help_message+=" | ${start_fg}start_db_debug${normal_fg}"
  echo "${help_message}"
}

function execute_task {
  local task="${1:-}"
  shift || true
  case ${task} in
    colors) task_color ;;
    start) task_start ;;
    start_db_debug) task_start_db_debug ;;
    *) task_help ;;
  esac
}

execute_task "$@"
