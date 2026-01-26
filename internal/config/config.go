package config

import (
	"encoding/json"
	"fmt"
	"os"
)

// Model represents a data model configuration
type Model struct {
	Name       string  `json:"name"`
	Table      string  `json:"table"`
	PrimaryKey string  `json:"primaryKey"`
	Fields     []Field `json:"fields"`
}

// Field represents a field within a model
type Field struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Nullable bool   `json:"nullable"`
}

// Config represents the entire configuration
type Config struct {
	Models []Model `json:"models"`
}

// LoadConfig loads and validates the configuration from a JSON file
func LoadConfig(filePath string) (*Config, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config JSON: %w", err)
	}

	if err := ValidateConfig(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// ValidateConfig validates the configuration
func ValidateConfig(cfg *Config) error {
	if cfg == nil {
		return fmt.Errorf("config is nil")
	}

	if len(cfg.Models) == 0 {
		return fmt.Errorf("no models defined in config")
	}

	modelNames := make(map[string]bool)

	for i, model := range cfg.Models {
		if err := ValidateModel(&model, i); err != nil {
			return err
		}

		// Check for duplicate model names
		if modelNames[model.Name] {
			return fmt.Errorf("duplicate model name: %s", model.Name)
		}
		modelNames[model.Name] = true
	}

	return nil
}

// ValidateModel validates a single model
func ValidateModel(model *Model, index int) error {
	if model.Name == "" {
		return fmt.Errorf("model[%d]: name is required", index)
	}

	if model.Table == "" {
		return fmt.Errorf("model[%d] %s: table is required", index, model.Name)
	}

	if model.PrimaryKey == "" {
		return fmt.Errorf("model[%d] %s: primaryKey is required", index, model.Name)
	}

	if len(model.Fields) == 0 {
		return fmt.Errorf("model[%d] %s: at least one field is required", index, model.Name)
	}

	// Validate that primary key exists in fields
	primaryKeyExists := false
	fieldNames := make(map[string]bool)

	for j, field := range model.Fields {
		if err := ValidateField(&field, index, model.Name, j); err != nil {
			return err
		}

		if fieldNames[field.Name] {
			return fmt.Errorf("model[%d] %s: duplicate field name: %s", index, model.Name, field.Name)
		}
		fieldNames[field.Name] = true

		if field.Name == model.PrimaryKey {
			primaryKeyExists = true
		}
	}

	if !primaryKeyExists {
		return fmt.Errorf("model[%d] %s: primaryKey %s not found in fields", index, model.Name, model.PrimaryKey)
	}

	return nil
}

// ValidateField validates a single field
func ValidateField(field *Field, modelIndex int, modelName string, fieldIndex int) error {
	if field.Name == "" {
		return fmt.Errorf("model[%d] %s: field[%d] name is required", modelIndex, modelName, fieldIndex)
	}

	if field.Type == "" {
		return fmt.Errorf("model[%d] %s: field[%d] %s: type is required", modelIndex, modelName, fieldIndex, field.Name)
	}

	// Validate field type
	validTypes := map[string]bool{
		"string":    true,
		"integer":   true,
		"int":       true,
		"float":     true,
		"decimal":   true,
		"boolean":   true,
		"datetime":  true,
		"timestamp": true,
		"date":      true,
		"uuid":      true,
		"json":      true,
	}

	if !validTypes[field.Type] {
		return fmt.Errorf("model[%d] %s: field[%d] %s: invalid type %q", modelIndex, modelName, fieldIndex, field.Name, field.Type)
	}

	return nil
}
