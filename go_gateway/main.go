package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	pb "roket-gateway/proto"
)

var grpcClient pb.DataProcessorClient

func initGRPC() *grpc.ClientConn {
	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithDefaultCallOptions(
			grpc.MaxCallRecvMsgSize(64*1024*1024), // 64 MB
			grpc.MaxCallSendMsgSize(64*1024*1024),
		),
	}

	conn, err := grpc.NewClient("127.0.0.1:50051", opts...)
	if err != nil {
		log.Fatalf("[FATAL] gRPC dial gagal: %v", err)
	}
	grpcClient = pb.NewDataProcessorClient(conn)
	log.Println("[Gateway] Terhubung ke C++ Worker di 127.0.0.1:50051")
	return conn
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	conn := initGRPC()
	defer conn.Close()

	r.POST("/api/v1/process", handleProcess)

	log.Println("[Gateway] Aktif di :8080")
	if err := r.Run("127.0.0.1:8080"); err != nil {
		log.Fatalf("[FATAL] Server mati: %v", err)
	}
}

type ProcessInput struct {
	Payload   string `json:"payload"`
	OpCode    int32  `json:"op_code"`
	RequestID int64  `json:"request_id"`
}

func handleProcess(c *gin.Context) {
	var input ProcessInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format JSON tidak valid"})
		return
	}

	// Timeout 500ms — jika C++ worker belum respons, potong koneksi
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	t0 := time.Now()

	// Kirim sebagai bytes mentah ke C++ (bukan string)
	res, err := grpcClient.ProcessData(ctx, &pb.RoketRequest{
		Payload:   []byte(input.Payload),
		OpCode:    input.OpCode,
		RequestId: input.RequestID,
	})

	roundTrip := time.Since(t0)

	if err != nil {
		log.Printf("[ERR] gRPC gagal (roundtrip %v): %v", roundTrip, err)
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":         "C++ Worker tidak merespons",
			"roundtrip_ms":  float64(roundTrip.Microseconds()) / 1000.0,
		})
		return
	}

	cppLatencyNs := res.LatencyNs
	networkOverhead := roundTrip.Nanoseconds() - cppLatencyNs

	// Log performa real-time ke terminal
	log.Printf("[PERF] req_id=%d | cpp=%dns (%.3fms) | network=%dns | total=%v",
		input.RequestID,
		cppLatencyNs,
		float64(cppLatencyNs)/1e6,
		networkOverhead,
		roundTrip,
	)

	c.JSON(http.StatusOK, gin.H{
		"status":        res.StatusCode,
		"result":        string(res.Result),
		"cpp_latency_ns": cppLatencyNs,
		"cpp_latency_ms": float64(cppLatencyNs) / 1e6,
		"roundtrip_ms":   float64(roundTrip.Microseconds()) / 1000.0,
	})
}
