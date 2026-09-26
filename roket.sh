#!/bin/bash
# =============================================================
# Super Roket — Build & Run Script
# Jalankan di LXC setelah install_deps.sh dan compile_proto.sh
# =============================================================
set -euo pipefail

PROJECT_DIR="/opt/super-roket"
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin

case "${1:-help}" in

# ─────────────────────────────────────────
# FASE 1: Compile C++ Worker
# ─────────────────────────────────────────
build-cpp)
    echo "[BUILD] C++ Worker Engine..."
    cd "$PROJECT_DIR/cpp_worker"
    mkdir -p build && cd build
    cmake .. \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_PREFIX_PATH=/usr/local \
        2>&1 | tail -5
    make -j$(nproc)
    echo "[OK] Binary: $PROJECT_DIR/cpp_worker/build/cpp_worker_engine"
    ;;

# ─────────────────────────────────────────
# FASE 2: Compile Go Gateway
# ─────────────────────────────────────────
build-go)
    echo "[BUILD] Go API Gateway..."
    cd "$PROJECT_DIR/go_gateway"

    # Salin proto stubs ke dalam modul Go
    mkdir -p proto
    cp "$PROJECT_DIR/go_gateway/proto/roket.pb.go" proto/ 2>/dev/null || \
    cp "$PROJECT_DIR/proto_out/go/roket.pb.go" proto/ 2>/dev/null || true
    cp "$PROJECT_DIR/go_gateway/proto/roket_grpc.pb.go" proto/ 2>/dev/null || \
    cp "$PROJECT_DIR/proto_out/go/roket_grpc.pb.go" proto/ 2>/dev/null || true

    go mod tidy
    CGO_ENABLED=0 go build -ldflags="-s -w" -o gateway main.go
    echo "[OK] Binary: $PROJECT_DIR/go_gateway/gateway"
    ;;

# ─────────────────────────────────────────
# FASE 3: Jalankan C++ Worker (foreground)
# ─────────────────────────────────────────
run-cpp)
    echo "[RUN] C++ Worker Engine..."
    exec "$PROJECT_DIR/cpp_worker/build/cpp_worker_engine"
    ;;

# ─────────────────────────────────────────
# FASE 4: Jalankan Go Gateway (foreground)
# ─────────────────────────────────────────
run-go)
    echo "[RUN] Go API Gateway..."
    exec "$PROJECT_DIR/go_gateway/gateway"
    ;;

# ─────────────────────────────────────────
# FASE 5: Test dengan curl
# ─────────────────────────────────────────
test)
    echo "[TEST] Menembak request ke Go Gateway -> C++ Worker..."
    curl -s -X POST http://127.0.0.1:8080/api/v1/process \
        -H "Content-Type: application/json" \
        -d '{"payload":"Hello Super Roket","op_code":1,"request_id":1}' | python3 -m json.tool
    echo ""
    curl -s -X POST http://127.0.0.1:8080/api/v1/process \
        -H "Content-Type: application/json" \
        -d '{"payload":"Benchmark 1234567890","op_code":3,"request_id":2}' | python3 -m json.tool
    ;;

# ─────────────────────────────────────────
help)
    echo "Usage: $0 {build-cpp|build-go|run-cpp|run-go|test}"
    echo ""
    echo "  build-cpp  — Compile C++ Worker Engine"
    echo "  build-go   — Compile Go API Gateway"
    echo "  run-cpp    — Jalankan C++ Worker (port 50051)"
    echo "  run-go     — Jalankan Go Gateway  (port 8080)"
    echo "  test       — Kirim request test via curl"
    ;;

esac
