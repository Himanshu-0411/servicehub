package com.servicehub.controller;

import com.servicehub.dto.ServiceHubDTOs.CategoryResponse;
import com.servicehub.repository.ServiceCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final ServiceCategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        return ResponseEntity.ok(
            categoryRepository.findByIsActiveTrue().stream()
                .map(CategoryResponse::from).toList()
        );
    }
}
