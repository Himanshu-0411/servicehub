package com.servicehub.repository;

import com.servicehub.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    List<ServiceCategory> findByIsActiveTrue();
    List<ServiceCategory> findByType(ServiceCategory.CategoryType type);
}
