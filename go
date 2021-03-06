#!/bin/bash

set -eu
normal_fg=$(tput sgr0)
debug_fg=$(tput setaf 9)

red_fg=$(tput setaf 1)

start_fg=$(tput setaf 5)
loopback_fg=$(tput setaf 93)
misc_fg=$(tput setaf 220)

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
  check_for_tool "node" "nvm install node"

  echo "${start_fg}Starting app${normal_fg}"
  node .
}

function task_start_db_debug {
  # https://loopback.io/doc/en/lb2/Setting-debug-strings.html
  echo "${start_fg}Starting app showing postgres debug info${normal_fg}"
  DEBUG=*postgresql node .
}

function task_start_debug {
  # https://loopback.io/doc/en/lb2/Setting-debug-strings.html
  echo "${start_fg}Starting app showing ALL debug info${normal_fg}"
  DEBUG=* node .
}

function task_start_remote_debug {
  # https://loopback.io/doc/en/lb2/Setting-debug-strings.html
  echo "${start_fg}Starting app showing ALL debug info${normal_fg}"
  DEBUG=strong-remoting* node .
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

function task_clear_port {
  local port=$(lsof -ti :3000)
  echo "${misc_fg}Finding and killing process running in port 3000 [${port}]${normal_fg}"

  kill -9 ${port}
}

function task_heroku_logs {
  echo "${misc_fg}Showing logs for staging heroku app${normal_fg}"
  heroku logs --app twparking-staging --tail
}

function task_build_models {
  echo "${loopback_fg}discovering and finding postgres models. Paste the following in server/model-config.json${normal_fg}"
  node bin/discover-and-build-models.js
}

function task_help {
  help_message="usage: ./go"
  help_message+=" ${misc_fg}colors${normal_fg}"
  help_message+=" | ${misc_fg}clear_port${normal_fg}"
  help_message+=" | ${misc_fg}heroku_logs${normal_fg}"
  help_message+=" | ${loopback_fg}build_models${normal_fg}"
  help_message+=" | ${start_fg}start${normal_fg}"
  help_message+=" | ${start_fg}start_debug${normal_fg}"
  help_message+=" | ${start_fg}start_db_debug${normal_fg}"
  help_message+=" | ${start_fg}start_remote_debug${normal_fg}"
  echo "${help_message}"
}

function execute_task {
  local task="${1:-}"
  shift || true
  case ${task} in
    colors) task_color ;;
    clear_port) task_clear_port ;;
    heroku_logs) task_heroku_logs ;;
    build_models) task_build_models ;;
    start) task_start ;;
    start_debug) task_start_debug ;;
    start_db_debug) task_start_db_debug ;;
    start_remote_debug) task_start_remote_debug ;;
    *) task_help ;;
  esac
}

execute_task "$@"
