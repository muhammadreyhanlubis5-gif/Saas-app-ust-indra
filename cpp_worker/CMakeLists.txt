cmake_minimum_required(VERSION 3.16)
project(super_roket_worker CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Optimisasi kompilasi: O3 + native CPU instruction set
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -march=native -DNDEBUG")

find_package(Protobuf REQUIRED)
find_package(gRPC REQUIRED CONFIG)

# Proto stubs yang sudah di-generate oleh compile_proto.sh
set(PROTO_DIR "${CMAKE_CURRENT_SOURCE_DIR}/proto")

add_executable(cpp_worker_engine
    server.cpp
    ${PROTO_DIR}/roket.pb.cc
    ${PROTO_DIR}/roket.grpc.pb.cc
)

target_include_directories(cpp_worker_engine PRIVATE ${PROTO_DIR})

target_link_libraries(cpp_worker_engine
    gRPC::grpc++
    gRPC::grpc++_reflection
    protobuf::libprotobuf
    pthread
)
