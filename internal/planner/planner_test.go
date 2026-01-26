package planner

import (
	"testing"

	"udv/internal/config"
	"udv/internal/dsl"
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

func TestPlanQuery_SimpleQuery(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)

	query := &dsl.Query{
		Model:  "orders",
		Fields: []string{"id", "status", "amount"},
	}

	plan, err := planner.PlanQuery(query)
	if err != nil {
		t.Errorf("PlanQuery() error = %v, want nil", err)
		return
	}

	// Check root model
	if plan.RootModel == nil {
		t.Errorf("RootModel is nil")
		return
	}
	if plan.RootModel.Name != "orders" {
		t.Errorf("RootModel.Name = %s, want orders", plan.RootModel.Name)
	}
	if plan.RootModel.Table != "orders" {
		t.Errorf("RootModel.Table = %s, want orders", plan.RootModel.Table)
	}
	if plan.RootModel.Alias != "t0" {
		t.Errorf("RootModel.Alias = %s, want t0", plan.RootModel.Alias)
	}

	// Check SELECT columns
	if len(plan.Select) != 3 {
		t.Errorf("Select has %d columns, want 3", len(plan.Select))
		return
	}

	expectedFields := []string{"id", "status", "amount"}
	for i, field := range expectedFields {
		if plan.Select[i].Alias != field {
			t.Errorf("Select[%d].Alias = %s, want %s", i, plan.Select[i].Alias, field)
		}
		if plan.Select[i].Column.ColumnName != field {
			t.Errorf("Select[%d].Column.ColumnName = %s, want %s", i, plan.Select[i].Column.ColumnName, field)
		}
		if plan.Select[i].Column.TableAlias != "t0" {
			t.Errorf("Select[%d].Column.TableAlias = %s, want t0", i, plan.Select[i].Column.TableAlias)
		}
	}

	// Check pagination defaults
	if plan.Pagination.Limit != 100 {
		t.Errorf("Pagination.Limit = %d, want 100", plan.Pagination.Limit)
	}
	if plan.Pagination.Offset != 0 {
		t.Errorf("Pagination.Offset = %d, want 0", plan.Pagination.Offset)
	}
}

func TestPlanQuery_QueryWithFilter(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)

	query := &dsl.Query{
		Model: "orders",
		Filters: &dsl.ComparisonFilter{
			Field: "status",
			Op:    dsl.OpEqual,
			Value: "PAID",
		},
	}

	plan, err := planner.PlanQuery(query)
	if err != nil {
		t.Errorf("PlanQuery() error = %v, want nil", err)
		return
	}

	if plan.Filters == nil {
		t.Errorf("Filters is nil")
		return
	}

	compFilter, ok := plan.Filters.(*ComparisonFilterIR)
	if !ok {
		t.Errorf("Filters is not *ComparisonFilterIR")
		return
	}

	if compFilter.Left.ColumnName != "status" {
		t.Errorf("Filter.Left.ColumnName = %s, want status", compFilter.Left.ColumnName)
	}
	if compFilter.Operator != dsl.OpEqual {
		t.Errorf("Filter.Operator = %s, want =", compFilter.Operator)
	}
	if compFilter.Value == nil {
		t.Errorf("Filter.Value is nil")
		return
	}
	if compFilter.Value.Value != "PAID" {
		t.Errorf("Filter.Value.Value = %v, want PAID", compFilter.Value.Value)
	}
}

func TestPlanQuery_QueryWithLogicalFilter(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)

	query := &dsl.Query{
		Model: "orders",
		Filters: &dsl.LogicalFilter{
			And: []*dsl.ComparisonFilter{
				{Field: "status", Op: dsl.OpEqual, Value: "PAID"},
				{Field: "amount", Op: dsl.OpGT, Value: 1000},
			},
		},
	}

	plan, err := planner.PlanQuery(query)
	if err != nil {
		t.Errorf("PlanQuery() error = %v, want nil", err)
		return
	}

	logFilter, ok := plan.Filters.(*LogicalFilterIR)
	if !ok {
		t.Errorf("Filters is not *LogicalFilterIR")
		return
	}

	if logFilter.Op != "AND" {
		t.Errorf("LogicalFilter.Op = %s, want AND", logFilter.Op)
	}

	if len(logFilter.Nodes) != 2 {
		t.Errorf("LogicalFilter.Nodes has %d items, want 2", len(logFilter.Nodes))
		return
	}

	// Check first condition
	cond1, ok := logFilter.Nodes[0].(*ComparisonFilterIR)
	if !ok {
		t.Errorf("Nodes[0] is not *ComparisonFilterIR")
		return
	}
	if cond1.Left.ColumnName != "status" {
		t.Errorf("Nodes[0].Left.ColumnName = %s, want status", cond1.Left.ColumnName)
	}

	// Check second condition
	cond2, ok := logFilter.Nodes[1].(*ComparisonFilterIR)
	if !ok {
		t.Errorf("Nodes[1] is not *ComparisonFilterIR")
		return
	}
	if cond2.Left.ColumnName != "amount" {
		t.Errorf("Nodes[1].Left.ColumnName = %s, want amount", cond2.Left.ColumnName)
	}
}

func TestPlanQuery_QueryWithGroupBy(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)

	query := &dsl.Query{
		Model:   "orders",
		GroupBy: []string{"status"},
	}

	plan, err := planner.PlanQuery(query)
	if err != nil {
		t.Errorf("PlanQuery() error = %v, want nil", err)
		return
	}

	if len(plan.GroupBy) != 1 {
		t.Errorf("GroupBy has %d items, want 1", len(plan.GroupBy))
		return
	}

	if plan.GroupBy[0].Column.ColumnName != "status" {
		t.Errorf("GroupBy[0].Column.ColumnName = %s, want status", plan.GroupBy[0].Column.ColumnName)
	}
}

func TestPlanQuery_QueryWithAggregates(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)

	query := &dsl.Query{
		Model:   "orders",
		GroupBy: []string{"status"},
		Aggregates: []dsl.Aggregate{
			{Function: dsl.AggSum, Field: "amount", Alias: "total_amount"},
			{Function: dsl.AggCount, Field: "", Alias: "order_count"},
		},
	}

	plan, err := planner.PlanQuery(query)
	if err != nil {
		t.Errorf("PlanQuery() error = %v, want nil", err)
		return
	}

	if len(plan.Aggregates) != 2 {
		t.Errorf("Aggregates has %d items, want 2", len(plan.Aggregates))
		return
	}

	// Check SUM aggregate
	if plan.Aggregates[0].Function != AggSumFn {
		t.Errorf("Aggregates[0].Function = %s, want SUM", plan.Aggregates[0].Function)
	}
	if plan.Aggregates[0].Column == nil {
		t.Errorf("Aggregates[0].Column is nil")
	} else if plan.Aggregates[0].Column.ColumnName != "amount" {
		t.Errorf("Aggregates[0].Column.ColumnName = %s, want amount", plan.Aggregates[0].Column.ColumnName)
	}
	if plan.Aggregates[0].Alias != "total_amount" {
		t.Errorf("Aggregates[0].Alias = %s, want total_amount", plan.Aggregates[0].Alias)
	}

	// Check COUNT aggregate
	if plan.Aggregates[1].Function != AggCountFn {
		t.Errorf("Aggregates[1].Function = %s, want COUNT", plan.Aggregates[1].Function)
	}
	if plan.Aggregates[1].Column != nil {
		t.Errorf("Aggregates[1].Column should be nil for COUNT(*)")
	}
	if plan.Aggregates[1].Alias != "order_count" {
		t.Errorf("Aggregates[1].Alias = %s, want order_count", plan.Aggregates[1].Alias)
	}
}

func TestPlanQuery_QueryWithSort(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)

	query := &dsl.Query{
		Model: "orders",
		Sort: []dsl.Sort{
			{Field: "created_at", Direction: dsl.SortDesc},
			{Field: "amount", Direction: dsl.SortAsc},
		},
	}

	plan, err := planner.PlanQuery(query)
	if err != nil {
		t.Errorf("PlanQuery() error = %v, want nil", err)
		return
	}

	if len(plan.Sort) != 2 {
		t.Errorf("Sort has %d items, want 2", len(plan.Sort))
		return
	}

	if plan.Sort[0].Column.ColumnName != "created_at" {
		t.Errorf("Sort[0].Column.ColumnName = %s, want created_at", plan.Sort[0].Column.ColumnName)
	}
	if plan.Sort[0].Direction != "DESC" {
		t.Errorf("Sort[0].Direction = %s, want DESC", plan.Sort[0].Direction)
	}

	if plan.Sort[1].Column.ColumnName != "amount" {
		t.Errorf("Sort[1].Column.ColumnName = %s, want amount", plan.Sort[1].Column.ColumnName)
	}
	if plan.Sort[1].Direction != "ASC" {
		t.Errorf("Sort[1].Direction = %s, want ASC", plan.Sort[1].Direction)
	}
}

func TestPlanQuery_QueryWithPagination(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)

	query := &dsl.Query{
		Model: "orders",
		Pagination: &dsl.Pagination{
			Limit:  50,
			Offset: 100,
		},
	}

	plan, err := planner.PlanQuery(query)
	if err != nil {
		t.Errorf("PlanQuery() error = %v, want nil", err)
		return
	}

	if plan.Pagination.Limit != 50 {
		t.Errorf("Pagination.Limit = %d, want 50", plan.Pagination.Limit)
	}
	if plan.Pagination.Offset != 100 {
		t.Errorf("Pagination.Offset = %d, want 100", plan.Pagination.Offset)
	}
}

func TestPlanQuery_ComplexQuery(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)

	query := &dsl.Query{
		Model:   "orders",
		Fields:  []string{"status", "amount"},
		GroupBy: []string{"status"},
		Filters: &dsl.LogicalFilter{
			And: []*dsl.ComparisonFilter{
				{Field: "created_at", Op: dsl.OpAfter, Value: "2024-01-01"},
				{Field: "amount", Op: dsl.OpGTE, Value: 100},
			},
		},
		Aggregates: []dsl.Aggregate{
			{Function: dsl.AggSum, Field: "amount", Alias: "total_amount"},
			{Function: dsl.AggCount, Field: "", Alias: "order_count"},
		},
		Sort: []dsl.Sort{
			{Field: "status", Direction: dsl.SortAsc},
		},
		Pagination: &dsl.Pagination{
			Limit:  100,
			Offset: 0,
		},
	}

	plan, err := planner.PlanQuery(query)
	if err != nil {
		t.Errorf("PlanQuery() error = %v, want nil", err)
		return
	}

	// Verify all components exist
	if plan.RootModel == nil {
		t.Errorf("RootModel is nil")
	}
	if len(plan.Select) != 2 {
		t.Errorf("Select has %d items, want 2", len(plan.Select))
	}
	if plan.Filters == nil {
		t.Errorf("Filters is nil")
	}
	if len(plan.GroupBy) != 1 {
		t.Errorf("GroupBy has %d items, want 1", len(plan.GroupBy))
	}
	if len(plan.Aggregates) != 2 {
		t.Errorf("Aggregates has %d items, want 2", len(plan.Aggregates))
	}
	if len(plan.Sort) != 1 {
		t.Errorf("Sort has %d items, want 1", len(plan.Sort))
	}
}

func TestPlanQuery_NilQuery(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)

	_, err := planner.PlanQuery(nil)
	if err == nil {
		t.Errorf("PlanQuery(nil) error = nil, want error")
	}
}

func TestPlanQuery_FieldTypeResolution(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)

	query := &dsl.Query{
		Model:  "orders",
		Fields: []string{"id", "amount", "created_at"},
	}

	plan, err := planner.PlanQuery(query)
	if err != nil {
		t.Errorf("PlanQuery() error = %v, want nil", err)
		return
	}

	tests := []struct {
		index    int
		field    string
		dataType FieldType
	}{
		{0, "id", TypeInteger},
		{1, "amount", TypeDecimal},
		{2, "created_at", TypeTimestamp},
	}

	for _, test := range tests {
		if plan.Select[test.index].Column.DataType != test.dataType {
			t.Errorf("Select[%d].Column.DataType = %s, want %s", test.index, plan.Select[test.index].Column.DataType, test.dataType)
		}
	}
}

func TestNewPlanner(t *testing.T) {
	reg := setupTestRegistry()
	planner := NewPlanner(reg)
	if planner == nil {
		t.Errorf("NewPlanner() returned nil")
	}
	if planner.registry != reg {
		t.Errorf("NewPlanner() registry not set correctly")
	}
}
