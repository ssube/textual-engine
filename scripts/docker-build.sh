#! /bin/bash

set -eu

IMAGE_PUSH="${1:---skip}"
IMAGE_DEFAULT="${2:---skip}"

IMAGE_NAME="${CI_PROJECT_PATH}"
IMAGE_TAG="$(echo "${CI_COMMIT_TAG:-${CI_COMMIT_REF_SLUG}}" | sed -r 's/[^-_a-zA-Z0-9\\.]/-/g')"

IMAGE_SHORT="${IMAGE_NAME}:${IMAGE_TAG}"
IMAGE_FULL="${IMAGE_NAME}:${IMAGE_TAG}-${IMAGE_ARCH}"

echo "Building image: ${IMAGE_FULL}"

docker build -f "Dockerfile.${IMAGE_ARCH}" -t "${IMAGE_FULL}" .

if [[ "${IMAGE_PUSH}" == "--push" ]];
then
  echo "Pushing image: ${IMAGE_FULL}"
  docker push "${IMAGE_FULL}"
fi

if [[ "${IMAGE_DEFAULT}" == "--default" ]];
then
  echo "Pushing image (default architecture): ${IMAGE_SHORT}"
  docker tag "${IMAGE_FULL}" "${IMAGE_SHORT}"
  docker push "${IMAGE_SHORT}"
fi
