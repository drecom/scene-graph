#!/bin/sh

JOB_NAME="${1}"
REPORT_TYPE="${2}"

HEAD=""
FOOT=""
BODY=""

LB='
'

# Create message body
HEAD="[info][title]Circle CI v2 #${CIRCLE_BUILD_NUM} ${CIRCLE_PROJECT_REPONAME}/${CIRCLE_BRANCH}[/title]"

# success
if [ "${JOB_NAME}" = "" ]; then
  BODY="(*) No errors in neither builds nor tests${LB}"
else
  BODY="${BODY}(devil) Errors in ${REPORT_TYPE} of ${JOB_NAME} ${LB}${LB}"
  BODY="${BODY}compare: ${CIRCLE_COMPARE_URL}${LB}"
fi

FOOT="${LB}${CIRCLE_BUILD_URL}[/info]"

curl -X POST -H "${REPORT_HEADER}" -d "body=${HEAD}${BODY}${FOOT}" "${REPORT_URL}"
