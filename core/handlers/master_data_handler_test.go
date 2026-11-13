package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	os.Setenv("ALLOW_IN_MEMORY_FOR_UNIT_TEST", "true")
}

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(func(c *gin.Context) {
		if tid := c.GetHeader("X-Test-Tenant-ID"); tid != "" {
			c.Set("school_id", tid)
			c.Set("tenant_id", tid)
			c.Set("role", "SCHOOL_ADMIN")
		}
		c.Next()
	})
	school := r.Group("/api/v1/school")
	{
		// Classes
		school.GET("/classes", GetClasses)
		school.POST("/classes", CreateClass)
		school.POST("/classes/batch", BatchImportClasses)
		school.GET("/classes/:id", GetClassByID)
		school.PUT("/classes/:id", UpdateClass)
		school.DELETE("/classes/:id", DeleteClass)

		// Teachers
		school.GET("/teachers", GetTeachers)
		school.POST("/teachers", CreateTeacher)
		school.POST("/teachers/batch", BatchImportTeachers)
		school.GET("/teachers/:id", GetTeacherByID)
		school.PUT("/teachers/:id", UpdateTeacher)
		school.DELETE("/teachers/:id", DeleteTeacher)

		// Subjects
		school.GET("/subjects", GetSubjects)
		school.POST("/subjects", CreateSubject)
		school.POST("/subjects/batch", BatchImportSubjects)
		school.GET("/subjects/:id", GetSubjectByID)
		school.PUT("/subjects/:id", UpdateSubject)
		school.DELETE("/subjects/:id", DeleteSubject)
	}
	return r
}

func performRequest(r *gin.Engine, method, path, schoolID string, body interface{}) *httptest.ResponseRecorder {
	var bodyBytes []byte
	if body != nil {
		bodyBytes, _ = json.Marshal(body)
	}
	req, _ := http.NewRequest(method, path, bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	if schoolID != "" {
		req.Header.Set("X-Test-Tenant-ID", schoolID)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestClasses_CRUD_And_Validation(t *testing.T) {
	r := setupTestRouter()
	tenantA := "tenant-test-a"

	// 1. Validation error: empty name
	t.Run("Create Class Empty Name Rejected With 422", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/classes", tenantA, map[string]interface{}{
			"name":          "",
			"academic_year": "2024/2025",
		})
		if w.Code != http.StatusUnprocessableEntity {
			t.Fatalf("expected 422, got %d: %s", w.Code, w.Body.String())
		}
		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		errObj := resp["error"].(map[string]interface{})
		fields := errObj["fields"].(map[string]interface{})
		if fields["name"] == nil {
			t.Errorf("expected field error on 'name', got %v", fields)
		}
	})

	// 2. Validation error: negative student count
	t.Run("Create Class Negative Student Count Rejected With 422", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/classes", tenantA, map[string]interface{}{
			"name":          "7 A",
			"academic_year": "2024/2025",
			"student_count": -5,
		})
		if w.Code != http.StatusUnprocessableEntity {
			t.Fatalf("expected 422, got %d", w.Code)
		}
	})

	// 3. Create Valid Class
	var createdID string
	t.Run("Create Valid Class Succeeded", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/classes", tenantA, map[string]interface{}{
			"name":          "7 A",
			"grade_level":   7,
			"major":         "Umum",
			"academic_year": "2024/2025",
			"student_count": 32,
		})
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
		}
		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		data := resp["data"].(map[string]interface{})
		createdID = data["id"].(string)
		if createdID == "" {
			t.Fatal("expected non-empty ID")
		}
	})

	// 4. Duplicate Class in Same Tenant and Academic Year
	t.Run("Duplicate Class in Same Tenant Rejected With 422", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/classes", tenantA, map[string]interface{}{
			"name":          "7 A",
			"academic_year": "2024/2025",
			"student_count": 30,
		})
		if w.Code != http.StatusUnprocessableEntity {
			t.Fatalf("expected 422 on duplicate class, got %d", w.Code)
		}
	})

	// 5. Query List Classes
	t.Run("Get Classes Tenant A Returns Created Item", func(t *testing.T) {
		w := performRequest(r, "GET", "/api/v1/school/classes?q=7", tenantA, nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}
		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		data := resp["data"].([]interface{})
		if len(data) == 0 {
			t.Fatal("expected at least 1 class")
		}
	})

	// 6. Update Class
	t.Run("Update Class Succeeded", func(t *testing.T) {
		newCount := 35
		w := performRequest(r, "PUT", "/api/v1/school/classes/"+createdID, tenantA, map[string]interface{}{
			"name":          "7 A Unggulan",
			"student_count": newCount,
		})
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		data := resp["data"].(map[string]interface{})
		if data["name"] != "7 A Unggulan" {
			t.Errorf("expected updated name '7 A Unggulan', got %v", data["name"])
		}
	})

	// 7. Soft Delete Class
	t.Run("Delete Class Sets DeletedAt And Excludes From Active Listing", func(t *testing.T) {
		w := performRequest(r, "DELETE", "/api/v1/school/classes/"+createdID, tenantA, nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}

		// Verify GetClassByID returns 404
		wGet := performRequest(r, "GET", "/api/v1/school/classes/"+createdID, tenantA, nil)
		if wGet.Code != http.StatusNotFound {
			t.Fatalf("expected 404 for soft deleted class, got %d", wGet.Code)
		}
	})
}

func TestClasses_MultiTenant_Isolation(t *testing.T) {
	r := setupTestRouter()
	tenantA := "school-uuid-tenant-alpha"
	tenantB := "school-uuid-tenant-beta"

	// Create class in Tenant A
	wA := performRequest(r, "POST", "/api/v1/school/classes", tenantA, map[string]interface{}{
		"name":          "10 MIPA 1",
		"academic_year": "2024/2025",
		"student_count": 36,
	})
	if wA.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", wA.Code, wA.Body.String())
	}
	var respA map[string]interface{}
	_ = json.Unmarshal(wA.Body.Bytes(), &respA)
	classA_ID := respA["data"].(map[string]interface{})["id"].(string)

	// Tenant B lists classes -> Must NOT see Tenant A's class
	wB_List := performRequest(r, "GET", "/api/v1/school/classes", tenantB, nil)
	var respBList map[string]interface{}
	_ = json.Unmarshal(wB_List.Body.Bytes(), &respBList)
	listB := respBList["data"].([]interface{})
	for _, item := range listB {
		cls := item.(map[string]interface{})
		if cls["id"] == classA_ID {
			t.Fatalf("SECURITY VIOLATION: Tenant B can see Tenant A's class!")
		}
	}

	// Tenant B attempts to read Tenant A's class by ID -> Must return 404
	wB_Get := performRequest(r, "GET", "/api/v1/school/classes/"+classA_ID, tenantB, nil)
	if wB_Get.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", wB_Get.Code)
	}

	// Tenant B attempts to update Tenant A's class -> Must return 404
	wB_Put := performRequest(r, "PUT", "/api/v1/school/classes/"+classA_ID, tenantB, map[string]interface{}{
		"name": "Hacked Class Name",
	})
	if wB_Put.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", wB_Put.Code)
	}

	// Tenant B attempts to delete Tenant A's class -> Must return 404
	wB_Del := performRequest(r, "DELETE", "/api/v1/school/classes/"+classA_ID, tenantB, nil)
	if wB_Del.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", wB_Del.Code)
	}
}

func TestBatchImport_Classes(t *testing.T) {
	r := setupTestRouter()
	tenant := "batch-test-tenant"

	payload := map[string]interface{}{
		"mode": "upsert",
		"classes": []map[string]interface{}{
			{
				"name":          "Class X-1",
				"grade_level":   10,
				"academic_year": "2024/2025",
				"student_count": 30,
			},
			{
				"name":          "Class X-2",
				"grade_level":   10,
				"academic_year": "2024/2025",
				"student_count": 32,
			},
			{
				"name":          "", // Invalid row: missing name
				"academic_year": "2024/2025",
				"student_count": 25,
			},
		},
	}

	w := performRequest(r, "POST", "/api/v1/school/classes/batch", tenant, payload)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	data := resp["data"].(map[string]interface{})

	if int(data["inserted"].(float64)) != 2 {
		t.Errorf("expected 2 inserted, got %v", data["inserted"])
	}
	if int(data["failed"].(float64)) != 1 {
		t.Errorf("expected 1 failed, got %v", data["failed"])
	}

	errors := data["errors"].([]interface{})
	if len(errors) != 1 {
		t.Fatalf("expected 1 row error, got %d", len(errors))
	}
	errRow := errors[0].(map[string]interface{})
	if int(errRow["row"].(float64)) != 3 {
		t.Errorf("expected error at row 3, got %v", errRow["row"])
	}
}

func TestTeachers_CRUD_And_Validation(t *testing.T) {
	r := setupTestRouter()
	tenant := "teachers-test-tenant"

	// 1. Validation error: empty name
	t.Run("Empty Name Rejected With 422", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/teachers", tenant, map[string]interface{}{
			"name": "",
		})
		if w.Code != http.StatusUnprocessableEntity {
			t.Fatalf("expected 422, got %d", w.Code)
		}
	})

	// 2. Create Teacher
	var teacherID string
	t.Run("Create Valid Teacher", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/teachers", tenant, map[string]interface{}{
			"name":              "Dr. Handoko, M.Pd",
			"nip_nuptk":         "198501012010011005",
			"gender":            "Laki-laki",
			"employment_status": "PNS",
			"is_certified":      true,
			"subject_specialty": "Fisika",
		})
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
		}
		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		teacherID = resp["data"].(map[string]interface{})["id"].(string)
	})

	// 3. Duplicate NIP in same tenant rejected
	t.Run("Duplicate NIP Rejected With 422", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/teachers", tenant, map[string]interface{}{
			"name":      "Guru Lain",
			"nip_nuptk": "198501012010011005",
		})
		if w.Code != http.StatusUnprocessableEntity {
			t.Fatalf("expected 422 on duplicate NIP, got %d", w.Code)
		}
	})

	// 4. Soft Delete Teacher
	t.Run("Delete Teacher Soft Deletes", func(t *testing.T) {
		w := performRequest(r, "DELETE", "/api/v1/school/teachers/"+teacherID, tenant, nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}
		wGet := performRequest(r, "GET", "/api/v1/school/teachers/"+teacherID, tenant, nil)
		if wGet.Code != http.StatusNotFound {
			t.Fatalf("expected 404 for deleted teacher, got %d", wGet.Code)
		}
	})
}

func TestSubjects_CRUD_And_Validation(t *testing.T) {
	r := setupTestRouter()
	tenant := "subjects-test-tenant"

	// 1. Empty Code/Name rejected
	t.Run("Empty Code Rejected With 422", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/subjects", tenant, map[string]interface{}{
			"code": "",
			"name": "Matematika",
		})
		if w.Code != http.StatusUnprocessableEntity {
			t.Fatalf("expected 422, got %d", w.Code)
		}
	})

	// 2. Negative weekly hours rejected
	t.Run("Negative Hours Rejected With 422", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/subjects", tenant, map[string]interface{}{
			"code":                 "BIO",
			"name":                 "Biologi",
			"weekly_default_hours": -2,
		})
		if w.Code != http.StatusUnprocessableEntity {
			t.Fatalf("expected 422, got %d", w.Code)
		}
	})

	// 3. Create Valid Subject (Normalizes code to uppercase)
	var subjectID string
	t.Run("Create Valid Subject With Uppercase Normalization", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/subjects", tenant, map[string]interface{}{
			"code":                 "mtk-wajib",
			"name":                 "Matematika Wajib",
			"category":             "Umum",
			"weekly_default_hours": 4,
		})
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
		}
		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		data := resp["data"].(map[string]interface{})
		subjectID = data["id"].(string)
		if data["code"] != "MTK-WAJIB" {
			t.Errorf("expected normalized uppercase code 'MTK-WAJIB', got %v", data["code"])
		}
	})

	// 4. Duplicate Subject Code Rejected
	t.Run("Duplicate Subject Code Rejected With 422", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/subjects", tenant, map[string]interface{}{
			"code": "MTK-WAJIB",
			"name": "Matematika Lain",
		})
		if w.Code != http.StatusUnprocessableEntity {
			t.Fatalf("expected 422 on duplicate code, got %d", w.Code)
		}
	})

	// 5. Soft Delete Subject
	t.Run("Delete Subject Soft Deletes", func(t *testing.T) {
		w := performRequest(r, "DELETE", "/api/v1/school/subjects/"+subjectID, tenant, nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", w.Code)
		}
		wGet := performRequest(r, "GET", "/api/v1/school/subjects/"+subjectID, tenant, nil)
		if wGet.Code != http.StatusNotFound {
			t.Fatalf("expected 404 for deleted subject, got %d", wGet.Code)
		}
	})
}

func TestWriteEndpoints_Return503_WhenDatabaseDisconnected(t *testing.T) {
	// Ensure ALLOW_IN_MEMORY_FOR_UNIT_TEST is disabled
	t.Setenv("ALLOW_IN_MEMORY_FOR_UNIT_TEST", "false")
	r := setupTestRouter()
	tenant := "tenant-disconnected"

	t.Run("Create Class returns 503 DATABASE_UNAVAILABLE", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/classes", tenant, map[string]interface{}{
			"name":          "7 A",
			"academic_year": "2024/2025",
		})
		if w.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected 503, got %d: %s", w.Code, w.Body.String())
		}
		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		errObj := resp["error"].(map[string]interface{})
		if errObj["code"] != "DATABASE_UNAVAILABLE" {
			t.Fatalf("expected code DATABASE_UNAVAILABLE, got %v", errObj["code"])
		}
	})

	t.Run("Create Teacher returns 503 DATABASE_UNAVAILABLE", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/teachers", tenant, map[string]interface{}{
			"name": "Budi Santoso",
		})
		if w.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected 503, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("Create Subject returns 503 DATABASE_UNAVAILABLE", func(t *testing.T) {
		w := performRequest(r, "POST", "/api/v1/school/subjects", tenant, map[string]interface{}{
			"code": "BIO",
			"name": "Biologi",
		})
		if w.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected 503, got %d: %s", w.Code, w.Body.String())
		}
	})
}
