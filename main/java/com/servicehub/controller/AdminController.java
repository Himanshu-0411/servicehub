package com.servicehub.controller;

import com.servicehub.dto.ServiceHubDTOs.*;
import com.servicehub.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStats> getStats() {

        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/providers")
    public ResponseEntity<Page<ProviderPublicResponse>> getAllProviders(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllProviders(pageable));
    }

    @PatchMapping("/providers/{id}/approve")
    public ResponseEntity<ProviderPublicResponse> approveProvider(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveProvider(id));
    }

    @PatchMapping("/providers/{id}/reject")
    public ResponseEntity<ProviderPublicResponse> rejectProvider(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectProvider(id));
    }

    @PatchMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse> toggleUserStatus(@PathVariable Long id) {
        adminService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("User status updated"));
    }

    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingResponse>> getAllBookings(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllBookings(pageable));
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String iconName,
            @RequestParam String type) {
        return ResponseEntity.status(201).body(adminService.createCategory(name, description, iconName, type));
    }

    @PatchMapping("/categories/{id}/toggle")
    public ResponseEntity<ApiResponse> toggleCategory(@PathVariable Long id) {
        adminService.toggleCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Category status updated"));
    }
}
