package controllers

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"yakkaw_dashboard/models"
	"yakkaw_dashboard/services"
)

type CategoryController struct {
	Service *services.CategoryService
}

// NewCategoryController เป็น constructor สำหรับ CategoryController
func NewCategoryController(s *services.CategoryService) *CategoryController {
	return &CategoryController{Service: s}
}

// CreateCategory (ADMIN ONLY) สำหรับสร้าง Category ใหม่
func (cc *CategoryController) CreateCategory(c echo.Context) error {
	var category models.Category
	if err := c.Bind(&category); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	createdCategory, err := cc.Service.CreateCategory(category)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, createdCategory)
}

// GetCategories (PUBLIC) สำหรับดึง Category ทั้งหมด
func (cc *CategoryController) GetCategories(c echo.Context) error {
    categories, err := cc.Service.GetAllCategories()
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, categories)
}


// GetCategoryByID สำหรับดึงข้อมูล Category ตาม ID
func (cc *CategoryController) GetCategoryByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid category id"})
	}
	category, err := cc.Service.GetCategoryByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "category not found"})
	}
	return c.JSON(http.StatusOK, category)
}

func (cc *CategoryController) DeleteCategory(c echo.Context) error {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid category id"})
    }

    err = cc.Service.DeleteCategory(uint(id))
    if err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{"message": "Not Found"})
    }

    return c.JSON(http.StatusOK, map[string]string{"message": "Category deleted successfully"})
}

// UpdateCategory (ADMIN ONLY) สำหรับอัปเดตข้อมูลหมวดหมู่
func (cc *CategoryController) UpdateCategory(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid category id"})
	}

	var categoryUpdate models.Category
	if err := c.Bind(&categoryUpdate); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// อัปเดตหมวดหมู่
	updatedCategory, err := cc.Service.UpdateCategory(uint(id), categoryUpdate)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, updatedCategory)
}
