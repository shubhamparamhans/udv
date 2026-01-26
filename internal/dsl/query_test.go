package dsl

import (
	"testing"

	"udv/internal/config"
	"udv/internal/schema"
)

func setupTestRegistry() *schema.Registry {
	cfg := &config.Config{
		Models: []config.Model{
			{
				Name:       "orders",
				Table:      "orders",
				PrimaryKey: "id",
				Fields: []config.Field{
					{Name: "id", Type: "integer", Nullable: false},
					{Name: "user_id", Type: "integer", Nullable: false},
					{Name: "status", Type: "string", Nullable: false},
					{Name: "amount", Type: "decimal", Nullable: false},
					{Name: "created_at", Type: "timestamp", Nullable: false},
					{Name: "notes", Type: "string", Nullable: true},
				},
			},
			{
				Name:       "users",
				Table:      "users",
				PrimaryKey: "id",
				Fields: []config.Field{
					{Name: "id", Type: "integer", Nullable: false},
					{Name: "name", Type: "string", Nullable: false},
					{Name: "email", Type: "string", Nullable: false},
					{Name: "age", Type: "integer", Nullable: true},
				},
			},
		},
	}

	reg := schema.NewRegistry()
	reg.LoadFromConfig(cfg)
	return reg
}

func TestValidateQuery_ValidSimpleQuery(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Fields: []string{"id", "status", "amount"},
	}

	err := v.ValidateQuery(query)
	if err != nil {
		t.Errorf("ValidateQuery() error = %v, want nil", err)
	}
}

func TestValidateQuery_NoModel(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for missing model")
	}
	if !contains(err.Error(), "model is required") {
		t.Errorf("ValidateQuery() error message = %v, want 'model is required'", err)
	}
}

func TestValidateQuery_InvalidModel(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "nonexistent",
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for invalid model")
	}
	if !contains(err.Error(), "model not found") {
		t.Errorf("ValidateQuery() error message = %v, want 'model not found'", err)
	}
}

func TestValidateQuery_InvalidField(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model:  "orders",
		Fields: []string{"nonexistent_field"},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for invalid field")
	}
	if !contains(err.Error(), "field not found") {
		t.Errorf("ValidateQuery() error message = %v, want 'field not found'", err)
	}
}

func TestValidateQuery_SimpleFilter(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Filters: &ComparisonFilter{
			Field: "status",
			Op:    OpEqual,
			Value: "PAID",
		},
	}

	err := v.ValidateQuery(query)
	if err != nil {
		t.Errorf("ValidateQuery() error = %v, want nil", err)
	}
}

func TestValidateQuery_InvalidFilterField(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Filters: &ComparisonFilter{
			Field: "nonexistent",
			Op:    OpEqual,
			Value: "PAID",
		},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for invalid filter field")
	}
}

func TestValidateQuery_InvalidOperatorForStringType(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Filters: &ComparisonFilter{
			Field: "status",
			Op:    "invalid_op", // Invalid operator that doesn't exist
			Value: "PAID",
		},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for invalid operator")
	}
}

func TestValidateQuery_LogicalFilterAnd(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Filters: &LogicalFilter{
			And: []*ComparisonFilter{
				{Field: "status", Op: OpEqual, Value: "PAID"},
				{Field: "amount", Op: OpGT, Value: 1000},
			},
		},
	}

	err := v.ValidateQuery(query)
	if err != nil {
		t.Errorf("ValidateQuery() error = %v, want nil", err)
	}
}

func TestValidateQuery_LogicalFilterOr(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Filters: &LogicalFilter{
			Or: []*ComparisonFilter{
				{Field: "status", Op: OpEqual, Value: "PAID"},
				{Field: "status", Op: OpEqual, Value: "PENDING"},
			},
		},
	}

	err := v.ValidateQuery(query)
	if err != nil {
		t.Errorf("ValidateQuery() error = %v, want nil", err)
	}
}

func TestValidateQuery_LogicalFilterNot(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Filters: &LogicalFilter{
			Not: &ComparisonFilter{
				Field: "status",
				Op:    OpEqual,
				Value: "CANCELLED",
			},
		},
	}

	err := v.ValidateQuery(query)
	if err != nil {
		t.Errorf("ValidateQuery() error = %v, want nil", err)
	}
}

func TestValidateQuery_ValidGroupBy(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model:   "orders",
		GroupBy: []string{"status"},
	}

	err := v.ValidateQuery(query)
	if err != nil {
		t.Errorf("ValidateQuery() error = %v, want nil", err)
	}
}

func TestValidateQuery_InvalidGroupByField(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model:   "orders",
		GroupBy: []string{"nonexistent"},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for invalid group_by field")
	}
}

func TestValidateQuery_ValidAggregate(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model:   "orders",
		GroupBy: []string{"status"},
		Aggregates: []Aggregate{
			{Function: AggSum, Field: "amount", Alias: "total_amount"},
			{Function: AggCount, Field: "", Alias: "order_count"},
		},
	}

	err := v.ValidateQuery(query)
	if err != nil {
		t.Errorf("ValidateQuery() error = %v, want nil", err)
	}
}

func TestValidateQuery_AggregateInvalidFunction(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Aggregates: []Aggregate{
			{Function: "invalid_func", Field: "amount", Alias: "total"},
		},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for invalid aggregate function")
	}
}

func TestValidateQuery_AggregateNoAlias(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Aggregates: []Aggregate{
			{Function: AggSum, Field: "amount", Alias: ""},
		},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for missing alias")
	}
}

func TestValidateQuery_AggregateNonNumericField(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Aggregates: []Aggregate{
			{Function: AggSum, Field: "status", Alias: "total"},
		},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for non-numeric field with sum")
	}
}

func TestValidateQuery_ValidSort(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Sort: []Sort{
			{Field: "created_at", Direction: SortDesc},
			{Field: "amount", Direction: SortAsc},
		},
	}

	err := v.ValidateQuery(query)
	if err != nil {
		t.Errorf("ValidateQuery() error = %v, want nil", err)
	}
}

func TestValidateQuery_SortInvalidField(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Sort: []Sort{
			{Field: "nonexistent", Direction: SortDesc},
		},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for invalid sort field")
	}
}

func TestValidateQuery_SortInvalidDirection(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Sort: []Sort{
			{Field: "amount", Direction: "invalid"},
		},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for invalid sort direction")
	}
}

func TestValidateQuery_ValidPagination(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Pagination: &Pagination{
			Limit:  50,
			Offset: 0,
		},
	}

	err := v.ValidateQuery(query)
	if err != nil {
		t.Errorf("ValidateQuery() error = %v, want nil", err)
	}
}

func TestValidateQuery_PaginationZeroLimit(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Pagination: &Pagination{
			Limit:  0,
			Offset: 0,
		},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for zero limit")
	}
}

func TestValidateQuery_PaginationNegativeOffset(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model: "orders",
		Pagination: &Pagination{
			Limit:  50,
			Offset: -1,
		},
	}

	err := v.ValidateQuery(query)
	if err == nil {
		t.Errorf("ValidateQuery() error = nil, want error for negative offset")
	}
}

func TestValidateQuery_ComplexQuery(t *testing.T) {
	reg := setupTestRegistry()
	v := NewValidator(reg)

	query := &Query{
		Model:   "orders",
		Fields:  []string{"status", "amount"},
		GroupBy: []string{"status"},
		Filters: &LogicalFilter{
			And: []*ComparisonFilter{
				{Field: "created_at", Op: OpAfter, Value: "2024-01-01"},
				{Field: "amount", Op: OpGTE, Value: 100},
			},
		},
		Aggregates: []Aggregate{
			{Function: AggSum, Field: "amount", Alias: "total_amount"},
			{Function: AggCount, Field: "", Alias: "order_count"},
			{Function: AggAvg, Field: "amount", Alias: "avg_amount"},
		},
		Sort: []Sort{
			{Field: "status", Direction: SortAsc},
		},
		Pagination: &Pagination{
			Limit:  100,
			Offset: 0,
		},
	}

	err := v.ValidateQuery(query)
	if err != nil {
		t.Errorf("ValidateQuery() error = %v, want nil", err)
	}
}

func TestNewComparisonFilter(t *testing.T) {
	f := NewComparisonFilter("age", OpGT, 18)
	if f.Field != "age" {
		t.Errorf("Field = %s, want age", f.Field)
	}
	if f.Op != OpGT {
		t.Errorf("Op = %s, want >", f.Op)
	}
	if f.Value != 18 {
		t.Errorf("Value = %v, want 18", f.Value)
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && s[len(s)-len(substr):] == substr || 
		(len(s) > len(substr) && s[0:len(substr)] == substr) || 
		(len(s) > len(substr)*2 && indexOfSubstring(s, substr) >= 0)
}

func indexOfSubstring(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}
