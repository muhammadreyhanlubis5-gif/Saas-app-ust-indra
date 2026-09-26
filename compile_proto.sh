#!/bin/bash
# =============================================================
# Super Roket — Proto Compiler Script
# Jalankan di dalam LXC Container (Debian/Ubuntu)
# =============================================================
set -euo pipefail

PROTO_DIR="./proto"
PROTO_FILE="roket.proto"

GO_OUT="./go_gateway/proto"
CPP_OUT="./cpp_worker/proto"

# ─────────────────────────────────────────────
# FASE 1: Install dependencies (sekali saja)
# ─────────────────────────────────────────────
install_deps() {
    echo "[1/4] Menginstall protobuf compiler & plugin..."
    
    # protoc compiler
    apt-get update -qq
    apt-get install -y -qq protobuf-compiler libprotobuf-dev libgrpc++-dev protobuf-compiler-grpc

    # Go plugins (protoc-gen-go dan protoc-gen-go-grpc)
    go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

    # Pastikan $GOPATH/bin ada di PATH
    export PATH="$PATH:$(go env GOPATH)/bin"
    
    echo "[OK] Dependencies terpasang."
}

# ─────────────────────────────────────────────
# FASE 2: Compile untuk Go
# ─────────────────────────────────────────────
compile_go() {
    echo "[2/4] Compiling proto -> Go..."
    mkdir -p "$GO_OUT"

    protoc \
        --proto_path="$PROTO_DIR" \
        --go_out="$GO_OUT" \
        --go_opt=paths=source_relative \
        --go-grpc_out="$GO_OUT" \
        --go-grpc_opt=paths=source_relative \
        "$PROTO_DIR/$PROTO_FILE"

    echo "[OK] Go stubs: $GO_OUT/roket.pb.go, roket_grpc.pb.go"
}

# ─────────────────────────────────────────────
# FASE 3: Compile untuk C++
# ─────────────────────────────────────────────
compile_cpp() {
    echo "[3/4] Compiling proto -> C++..."
    mkdir -p "$CPP_OUT"

    # Cari lokasi grpc_cpp_plugin secara otomatis
    GRPC_CPP_PLUGIN=$(which grpc_cpp_plugin)

    protoc \
        --proto_path="$PROTO_DIR" \
        --cpp_out="$CPP_OUT" \
        --grpc_out="$CPP_OUT" \
        --plugin=protoc-gen-grpc="$GRPC_CPP_PLUGIN" \
        "$PROTO_DIR/$PROTO_FILE"

    echo "[OK] C++ stubs: $CPP_OUT/roket.pb.cc, roket.pb.h, roket.grpc.pb.cc, roket.grpc.pb.h"
}

# ─────────────────────────────────────────────
# FASE 4: Verifikasi
# ─────────────────────────────────────────────
verify() {
    echo "[4/4] Verifikasi file yang dihasilkan..."
    echo ""
    echo "── Go ──"
    ls -lh "$GO_OUT"/*.go 2>/dev/null || echo "  GAGAL: File Go tidak ditemukan!"
    echo ""
    echo "── C++ ──"
    ls -lh "$CPP_OUT"/roket.* 2>/dev/null || echo "  GAGAL: File C++ tidak ditemukan!"
    echo ""
    echo "════════════════════════════════════════"
    echo "  Kontrak gRPC Super Roket: SIAP TEMPUR"
    echo "════════════════════════════════════════"
}

# ─────────────────────────────────────────────
# EKSEKUSI
# ─────────────────────────────────────────────
case "${1:-all}" in
    deps)    install_deps ;;
    go)      compile_go ;;
    cpp)     compile_cpp ;;
    verify)  verify ;;
    all)
        install_deps
        compile_go
        compile_cpp
        verify
        ;;
    *)
        echo "Usage: $0 {deps|go|cpp|verify|all}"
        exit 1
        ;;
esac
