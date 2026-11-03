#!/usr/bin/env bash
# Update the website on the VPS — code only.
# Admin data (data/: content, users, contacts, uploads, history) and secrets (.env) are never
# overwritten: they are not tracked by git, so `git archive` does not contain them.
# New default text/sections are merged into content.json at start-up without touching edits.
#
#   ./deploy/deploy.sh                 # deploys the committed HEAD
#   DEPLOY_HOST=root@1.2.3.4 ./deploy/deploy.sh
set -euo pipefail

HOST=${DEPLOY_HOST:-root@150.95.113.181}
DIR=${DEPLOY_DIR:-/opt/VieTure-Studio}
cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "Có thay đổi chưa commit — hãy commit trước khi triển khai." >&2
  exit 1
fi

echo "1/5 Sao lưu data/ trên máy chủ (giữ 20 bản gần nhất trong /root/backups)"
ssh "$HOST" "set -e; cd $DIR; mkdir -p /root/backups
  tar czf /root/backups/vieture-data-\$(date +%Y%m%d-%H%M%S).tgz data
  ls -1t /root/backups/vieture-data-*.tgz | tail -n +21 | xargs -r rm --
  ls -1t /root/backups/vieture-data-*.tgz | head -1"

echo "2/5 Build image $(git rev-parse --short HEAD)"
docker build -q -t vieture-studio:latest . >/dev/null

echo "3/5 Cập nhật mã nguồn (không gồm data/ và .env)"
git archive --format=tar HEAD | ssh "$HOST" "tar -x -C $DIR"
# Remove top-level code files/folders that were deleted from git. data/ and .env are always kept.
keep="$(git ls-tree --name-only HEAD | tr '\n' ' ') data .env"
ssh "$HOST" "cd $DIR && for f in * .[!.]*; do [ -e \"\$f\" ] || continue; case \" $keep \" in *\" \$f \"*) ;; *) echo \"  xoá file cũ: \$f\"; rm -rf -- \"\$f\" ;; esac; done"

echo "4/5 Tải image lên"
docker save vieture-studio:latest | gzip -1 | ssh "$HOST" 'gunzip | docker load'

echo "5/5 Khởi động lại"
ssh "$HOST" "set -e; cd $DIR; docker compose up -d --no-build
  for i in \$(seq 20); do docker compose exec -T web wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1 && break; sleep 1; done
  docker compose exec -T web wget -qO- http://127.0.0.1:3000/api/health; echo
  docker ps --filter name=vieture-studio --format '{{.Names}}: {{.Status}}'"
echo "Xong."
