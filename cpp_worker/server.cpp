#include <iostream>
#include <memory>
#include <string>
#include <chrono>
#include <cstring>

#include <grpcpp/grpcpp.h>
#include "roket.grpc.pb.h"

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::ServerWriter;
using grpc::Status;
using roket::RoketRequest;
using roket::RoketResponse;
using roket::DataProcessor;

class DataProcessorImpl final : public DataProcessor::Service {

    Status ProcessData(ServerContext* ctx,
                       const RoketRequest* req,
                       RoketResponse* res) override {
        auto t0 = std::chrono::high_resolution_clock::now();

        try {
            const std::string& raw = req->payload();   // zero-copy ref ke bytes
            int32_t op = req->op_code();
            int64_t rid = req->request_id();

            if (raw.empty()) {
                res->set_status_code(400);
                res->set_result("ERR_EMPTY_PAYLOAD");
                measure(t0, res);
                return Status::OK;      // tetap OK di gRPC, error ada di status_code
            }

            // ── Dispatch berdasarkan op_code ──
            std::string out;
            switch (op) {
                case 1:  // GENERATE
                    out = handle_generate(raw);
                    break;
                case 2:  // VALIDATE
                    out = handle_validate(raw);
                    break;
                case 3:  // COMPUTE
                    out = handle_compute(raw);
                    break;
                default:
                    res->set_status_code(400);
                    res->set_result("ERR_UNKNOWN_OP");
                    measure(t0, res);
                    return Status::OK;
            }

            res->set_result(std::move(out));    // move, bukan copy
            res->set_status_code(200);
            measure(t0, res);
            return Status::OK;

        } catch (const std::exception& e) {
            res->set_status_code(500);
            res->set_result(std::string("INTERNAL: ") + e.what());
            measure(t0, res);
            return Status::OK;
        } catch (...) {
            res->set_status_code(500);
            res->set_result("INTERNAL: unknown fatal");
            measure(t0, res);
            return Status::OK;
        }
    }

    Status StreamProcess(ServerContext* ctx,
                         const RoketRequest* req,
                         ServerWriter<RoketResponse>* writer) override {
        auto t0 = std::chrono::high_resolution_clock::now();

        try {
            const std::string& raw = req->payload();
            size_t total = raw.size();
            size_t chunk = 4096;    // 4 KB per chunk

            for (size_t offset = 0; offset < total; offset += chunk) {
                size_t len = std::min(chunk, total - offset);
                RoketResponse res;
                res.set_result(raw.substr(offset, len));
                res.set_status_code(200);
                measure(t0, &res);

                if (!writer->Write(res)) {
                    break;  // client disconnect, jangan crash
                }
            }
            return Status::OK;

        } catch (const std::exception& e) {
            return Status(grpc::INTERNAL, e.what());
        } catch (...) {
            return Status(grpc::INTERNAL, "stream fatal");
        }
    }

private:
    // Hitung latency dalam nanosecond
    static void measure(const std::chrono::high_resolution_clock::time_point& t0,
                        RoketResponse* res) {
        auto t1 = std::chrono::high_resolution_clock::now();
        auto ns = std::chrono::duration_cast<std::chrono::nanoseconds>(t1 - t0).count();
        res->set_latency_ns(ns);
    }

    // ── Handler per operasi (ganti isi ini sesuai logika bisnis) ──

    static std::string handle_generate(const std::string& raw) {
        // Contoh: balik bytes mentah (placeholder untuk algoritma generasi jadwal)
        std::string out(raw.rbegin(), raw.rend());
        return out;
    }

    static std::string handle_validate(const std::string& raw) {
        // Contoh: cek apakah raw bytes valid
        if (raw.size() > 10 * 1024 * 1024) {   // tolak > 10 MB
            return "ERR_TOO_LARGE";
        }
        return "VALID";
    }

    static std::string handle_compute(const std::string& raw) {
        // Contoh: hitung checksum sederhana (placeholder untuk komputasi berat)
        uint64_t sum = 0;
        for (unsigned char c : raw) {
            sum += c;
        }
        return std::to_string(sum);
    }
};

int main() {
    std::string addr("0.0.0.0:50051");
    DataProcessorImpl service;

    ServerBuilder builder;
    builder.AddListeningPort(addr, grpc::InsecureServerCredentials());
    builder.RegisterService(&service);
    builder.SetMaxReceiveMessageSize(64 * 1024 * 1024);     // 64 MB max
    builder.SetMaxSendMessageSize(64 * 1024 * 1024);

    std::unique_ptr<Server> server(builder.BuildAndStart());
    std::cout << "[C++ Worker] Aktif di " << addr << std::endl;
    server->Wait();
    return 0;
}
