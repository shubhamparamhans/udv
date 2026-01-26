package main

import (
	"fmt"
	"net/http"
	"os"

	"udv/internal/config"
    "udv/internal/api"
	"udv/internal/schema"
)

func main() {
	// Load configuration
	configPath := "configs/models.json"
	if envPath := os.Getenv("CONFIG_PATH"); envPath != "" {
		configPath = envPath
	}

	cfg, err := config.LoadConfig(configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// Log loaded models
	fmt.Printf("Loaded %d model(s):\n", len(cfg.Models))
	for _, model := range cfg.Models {
		fmt.Printf("  - %s (table: %s, primaryKey: %s)\n", model.Name, model.Table, model.PrimaryKey)
	}

	// Initialize schema registry
	registry := schema.NewRegistry()
	if err := registry.LoadFromConfig(cfg); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to initialize schema registry: %v\n", err)
		os.Exit(1)
	}

	// Log registry initialization
	fmt.Printf("Schema registry initialized with %d model(s)\n", len(registry.ListModels()))

	// Health check endpoint
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok"}`)
	})

	// Register API routes
	apiSrv := api.New(registry)
	apiSrv.RegisterRoutes(mux)

	fmt.Println("Server starting on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		panic(err)
	}
}
