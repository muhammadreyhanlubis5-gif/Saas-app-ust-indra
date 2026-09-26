#!/bin/bash
# =============================================================
# Super Roket — Bulletproof Dependency Installer
# Target: Debian 11 Bullseye (Proxmox LXC)
# Strategi: Bypass apt sepenuhnya. Semua dari binary resmi.
# =============================================================
set -euo pipefail

GO_VERSION="1.22.5"
PROTOC_VERSION="27.3"
GRPC_VERSION="v1.65.4"

echo "════════════════════════════════════════════════"
echo "  Super Roket — Installer (Debian Bullseye LXC)"
echo "════════════════════════════════════════════════"

# ─────────────────────────────────────────────
# FASE 0: Paket dasar yang PASTI ada di repo
# ─────────────────────────────────────────────
echo "[0/5] Menginstall build tools dasar..."
apt-get update -qq || true
apt-get install -y -qq \
    wget curl git unzip \
    build-essential cmake autoconf libtool pkg-config \
    2>/dev/null || {
        echo "[WARN] Beberapa paket apt gagal, mencoba --fix-missing..."
        apt-get install -y --fix-missing \
            wget curl git unzip \
            build-essential cmake autoconf libtool pkg-config
    }

# ─────────────────────────────────────────────
# FASE 1: Go (dari tarball resmi Google)
# ─────────────────────────────────────────────
if command -v go &>/dev/null; then
    echo "[1/5] Go sudah terinstall: $(go version)"
else
    echo "[1/5] Menginstall Go ${GO_VERSION} dari tarball resmi..."
    cd /tmp
    wget -q "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz"
    rm -rf /usr/local/go
    tar -C /usr/local -xzf "go${GO_VERSION}.linux-amd64.tar.gz"
    rm -f "go${GO_VERSION}.linux-amd64.tar.gz"

    # Pasang ke PATH secara permanen
    echo 'export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin' >> /etc/profile.d/go.sh
    export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin

    echo "[OK] $(go version)"
fi

# Pastikan PATH aktif di sesi ini
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin

# ─────────────────────────────────────────────
# FASE 2: protoc (dari GitHub release resmi)
# ─────────────────────────────────────────────
if command -v protoc &>/dev/null; then
    echo "[2/5] protoc sudah terinstall: $(protoc --version)"
else
    echo "[2/5] Menginstall protoc v${PROTOC_VERSION} dari GitHub..."
    cd /tmp
    wget -q "https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-linux-x86_64.zip"
    unzip -o -q "protoc-${PROTOC_VERSION}-linux-x86_64.zip" -d /usr/local
    rm -f "protoc-${PROTOC_VERSION}-linux-x86_64.zip"
    chmod +x /usr/local/bin/protoc

    echo "[OK] $(protoc --version)"
fi

# ─────────────────────────────────────────────
# FASE 3: Go gRPC plugins
# ─────────────────────────────────────────────
echo "[3/5] Menginstall protoc-gen-go & protoc-gen-go-grpc..."
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

echo "[OK] protoc-gen-go: $(which protoc-gen-go)"
echo "[OK] protoc-gen-go-grpc: $(which protoc-gen-go-grpc)"

# ─────────────────────────────────────────────
# FASE 4: grpc_cpp_plugin (build dari source)
# Ini satu-satunya cara bulletproof di Bullseye
# ─────────────────────────────────────────────
if command -v grpc_cpp_plugin &>/dev/null; then
    echo "[4/5] grpc_cpp_plugin sudah terinstall: $(which grpc_cpp_plugin)"
else
    echo "[4/5] Building grpc_cpp_plugin dari source (5-15 menit)..."
    echo "       Ini hanya perlu dilakukan SEKALI."

    cd /tmp
    if [ ! -d "grpc" ]; then
        git clone --depth 1 --branch "${GRPC_VERSION}" \
            --recurse-submodules --shallow-submodules \
            https://github.com/grpc/grpc.git
    fi

    cd grpc
    mkdir -p cmake/build && cd cmake/build

    cmake ../.. \
        -DgRPC_INSTALL=ON \
        -DgRPC_BUILD_TESTS=OFF \
        -DCMAKE_INSTALL_PREFIX=/usr/local \
        -DCMAKE_BUILD_TYPE=Release \
        -DABSL_PROPAGATE_CXX_STD=ON \
        2>&1 | tail -5

    # Build hanya target yang kita butuhkan (hemat waktu)
    make -j$(nproc) grpc_cpp_plugin
    make -j$(nproc) grpc++
    make -j$(nproc) install

    echo "[OK] grpc_cpp_plugin: $(which grpc_cpp_plugin)"

    # Bersihkan source (hemat disk di LXC)
    cd /tmp && rm -rf grpc
fi

# ─────────────────────────────────────────────
# FASE 5: Verifikasi semua binary
# ─────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo "  VERIFIKASI FINAL"
echo "════════════════════════════════════════════════"
echo "  go:                 $(go version 2>/dev/null || echo 'GAGAL')"
echo "  protoc:             $(protoc --version 2>/dev/null || echo 'GAGAL')"
echo "  protoc-gen-go:      $(which protoc-gen-go 2>/dev/null || echo 'GAGAL')"
echo "  protoc-gen-go-grpc: $(which protoc-gen-go-grpc 2>/dev/null || echo 'GAGAL')"
echo "  grpc_cpp_plugin:    $(which grpc_cpp_plugin 2>/dev/null || echo 'GAGAL')"
echo "════════════════════════════════════════════════"
echo ""
echo "  Semua senjata terpasang. Jalankan:"
echo "  ./compile_proto.sh go"
echo "  ./compile_proto.sh cpp"
echo "  ./compile_proto.sh verify"
echo ""
