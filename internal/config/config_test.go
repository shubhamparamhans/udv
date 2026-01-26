package config

import (
	"testing"
)

func TestValidateConfig(t *testing.T) {
	tests := []struct {
		name    string
		config  *Config
		wantErr bool
		errMsg  string
	}{
		{
			name:    "nil config",
			config:  nil,
			wantErr: true,
			errMsg:  "config is nil",
		},
		{
			name: "empty models",
			config: &Config{
				Models: []Model{},
			},
			wantErr: true,
			errMsg:  "no models defined in config",
		},
		{
			name: "valid single model",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "users",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
							{Name: "name", Type: "string", Nullable: false},
						},
					},
				},
			},
			wantErr: false,
		},
		{
			name: "missing model name",
			config: &Config{
				Models: []Model{
					{
						Name:       "",
						Table:      "users",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
						},
					},
				},
			},
			wantErr: true,
			errMsg:  "name is required",
		},
		{
			name: "missing table name",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
						},
					},
				},
			},
			wantErr: true,
			errMsg:  "table is required",
		},
		{
			name: "missing primary key",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "users",
						PrimaryKey: "",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
						},
					},
				},
			},
			wantErr: true,
			errMsg:  "primaryKey is required",
		},
		{
			name: "no fields",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "users",
						PrimaryKey: "id",
						Fields:     []Field{},
					},
				},
			},
			wantErr: true,
			errMsg:  "at least one field is required",
		},
		{
			name: "primary key not in fields",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "users",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "name", Type: "string", Nullable: false},
						},
					},
				},
			},
			wantErr: true,
			errMsg:  "primaryKey id not found in fields",
		},
		{
			name: "duplicate field names",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "users",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
							{Name: "id", Type: "string", Nullable: false},
						},
					},
				},
			},
			wantErr: true,
			errMsg:  "duplicate field name",
		},
		{
			name: "invalid field type",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "users",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
							{Name: "age", Type: "invalid_type", Nullable: false},
						},
					},
				},
			},
			wantErr: true,
			errMsg:  "invalid type",
		},
		{
			name: "missing field name",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "users",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
							{Name: "", Type: "string", Nullable: false},
						},
					},
				},
			},
			wantErr: true,
			errMsg:  "name is required",
		},
		{
			name: "missing field type",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "users",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
							{Name: "email", Type: "", Nullable: false},
						},
					},
				},
			},
			wantErr: true,
			errMsg:  "type is required",
		},
		{
			name: "duplicate model names",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "users",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
						},
					},
					{
						Name:       "users",
						Table:      "users_backup",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
						},
					},
				},
			},
			wantErr: true,
			errMsg:  "duplicate model name",
		},
		{
			name: "valid multiple models",
			config: &Config{
				Models: []Model{
					{
						Name:       "users",
						Table:      "users",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
							{Name: "name", Type: "string", Nullable: false},
							{Name: "email", Type: "string", Nullable: false},
						},
					},
					{
						Name:       "orders",
						Table:      "orders",
						PrimaryKey: "id",
						Fields: []Field{
							{Name: "id", Type: "integer", Nullable: false},
							{Name: "user_id", Type: "integer", Nullable: false},
							{Name: "total", Type: "decimal", Nullable: false},
						},
					},
				},
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateConfig(tt.config)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateConfig() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if err != nil && tt.errMsg != "" && !contains(err.Error(), tt.errMsg) {
				t.Errorf("ValidateConfig() error message = %v, want to contain %v", err.Error(), tt.errMsg)
			}
		})
	}
}

func TestLoadConfig(t *testing.T) {
	tests := []struct {
		name    string
		file    string
		wantErr bool
	}{
		{
			name:    "nonexistent file",
			file:    "/nonexistent/path.json",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := LoadConfig(tt.file)
			if (err != nil) != tt.wantErr {
				t.Errorf("LoadConfig() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func contains(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
